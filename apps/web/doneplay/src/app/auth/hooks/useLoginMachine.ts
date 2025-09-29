"use client";
import { useCallback, useReducer, useEffect } from "react";
import {
  useLoginMutation,
  useRequestOtpMutation,
  useVerifyOtpMutation,
  useCompleteRegistrationMutation,
  useCheckIdentifierMutation,
  useResetPasswordMutation,
} from "./useAuth";
import { useQueryClient } from "@tanstack/react-query";

export type LoginPhase =
  | "IDENTIFIER"
  | "PASSWORD"
  | "OTP" // for signup (new user) verification
  | "OTP_RESET" // combined code + new password forced reset flow
  | "COMPLETE_REGISTRATION"; // after signupToken

interface State {
  phase: LoginPhase;
  phone: string;
  password: string;
  otp: string;
  newPassword: string; // for OTP_RESET
  firstName: string;
  lastName: string;
  loading: boolean;
  error: string | null;
  devCode: string | null; // dev only
  exists: boolean | null; // identifier existence
  signupToken: string | null;
  mode: "LOGIN" | "SIGNUP" | null;
}

const initial: State = {
  phase: "IDENTIFIER",
  phone: "",
  password: "",
  otp: "",
  newPassword: "",
  firstName: "",
  lastName: "",
  loading: false,
  error: null,
  devCode: null,
  exists: null,
  signupToken: null,
  mode: null,
};

type Action =
  | { type: "SET_FIELD"; field: keyof State; value: State[keyof State] }
  | { type: "SET_PHASE"; phase: LoginPhase }
  | { type: "LOADING"; value: boolean }
  | { type: "ERROR"; error: string | null }
  | { type: "DEV_CODE"; code: string | null }
  | { type: "EXISTS"; exists: boolean }
  | { type: "MODE"; mode: State["mode"] }
  | { type: "SIGNUP_TOKEN"; token: string | null };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value } as State;
    case "SET_PHASE":
      return { ...state, phase: action.phase, error: null };
    case "LOADING":
      return { ...state, loading: action.value };
    case "ERROR":
      return { ...state, error: action.error };
    case "DEV_CODE":
      return { ...state, devCode: action.code };
    case "EXISTS":
      return { ...state, exists: action.exists };
    case "MODE":
      return { ...state, mode: action.mode };
    case "SIGNUP_TOKEN":
      return { ...state, signupToken: action.token };
    default:
      return state;
  }
}

export function useLoginMachine(onSuccess: () => void) {
  const [state, dispatch] = useReducer(reducer, initial);
  const queryClient = useQueryClient();

  const checkIdentifierMutation = useCheckIdentifierMutation({
    onSuccess: (data) => {
      dispatch({ type: "EXISTS", exists: data.data.exists });
      if (data.data.exists) {
        dispatch({ type: "SET_PHASE", phase: "PASSWORD" });
      } else {
        requestOtpMutation.mutate({
          identifier: state.phone,
          purpose: "LOGIN",
        });
      }
    },
    onError: (err: Error) => dispatch({ type: "ERROR", error: err.message }),
  });
  const loginMutation = useLoginMutation({
    onSuccess: () => {
      dispatch({ type: "MODE", mode: "LOGIN" });
      if (state.phone) {
        queryClient.invalidateQueries({
          queryKey: ["auth", "identifier", state.phone],
        });
      }
      onSuccess();
    },
    onError: (err: Error) => dispatch({ type: "ERROR", error: err.message }),
  });
  const requestOtpMutation = useRequestOtpMutation({
    onSuccess: (data) => {
      dispatch({ type: "DEV_CODE", code: data.data.devCode || null });
      // Phase depends on purpose we requested
      if (purposeRef.current === "PASSWORD_RESET") {
        dispatch({ type: "SET_PHASE", phase: "OTP_RESET" });
      } else {
        dispatch({ type: "SET_PHASE", phase: "OTP" });
      }
    },
    onError: (err: Error) => dispatch({ type: "ERROR", error: err.message }),
  });
  const verifyOtpMutation = useVerifyOtpMutation({
    onSuccess: (data) => {
      if (data.data.mode === "LOGIN") {
        dispatch({ type: "MODE", mode: "LOGIN" });
        if (state.phone) {
          queryClient.invalidateQueries({
            queryKey: ["auth", "identifier", state.phone],
          });
        }
        onSuccess();
      } else if (data.data.mode === "SIGNUP") {
        dispatch({ type: "MODE", mode: "SIGNUP" });
        dispatch({ type: "SIGNUP_TOKEN", token: data.data.signupToken });
        dispatch({ type: "SET_PHASE", phase: "COMPLETE_REGISTRATION" });
      }
    },
    onError: (err: Error) => dispatch({ type: "ERROR", error: err.message }),
  });
  const completeRegistrationMutation = useCompleteRegistrationMutation({
    onSuccess: () => {
      dispatch({ type: "MODE", mode: "LOGIN" });
      if (state.phone) {
        queryClient.invalidateQueries({
          queryKey: ["auth", "identifier", state.phone],
        });
      }
      onSuccess();
    },
    onError: (err: Error) => dispatch({ type: "ERROR", error: err.message }),
  });

  const resetPasswordMutation = useResetPasswordMutation({
    onSuccess: () => {
      dispatch({ type: "MODE", mode: "LOGIN" });
      if (state.phone) {
        queryClient.invalidateQueries({
          queryKey: ["auth", "identifier", state.phone],
        });
      }
      onSuccess();
    },
    onError: (err: Error) => dispatch({ type: "ERROR", error: err.message }),
  });

  // Keep last requested purpose
  const purposeRef = (globalThis as any)._authPurposeRef || { current: "" };
  (globalThis as any)._authPurposeRef = purposeRef;

  useEffect(() => {
    const loading =
      checkIdentifierMutation.isPending ||
      loginMutation.isPending ||
      requestOtpMutation.isPending ||
      verifyOtpMutation.isPending ||
      completeRegistrationMutation.isPending ||
      resetPasswordMutation.isPending;
    dispatch({ type: "LOADING", value: loading });
  }, [
    checkIdentifierMutation.isPending,
    loginMutation.isPending,
    requestOtpMutation.isPending,
    verifyOtpMutation.isPending,
    completeRegistrationMutation.isPending,
  ]);

  const set = useCallback(
    <K extends keyof State>(field: K, value: State[K]) =>
      dispatch({ type: "SET_FIELD", field, value }),
    []
  );

  const submitIdentifier = useCallback(() => {
    const phone = state.phone.trim();
    if (!phone) return;
    dispatch({ type: "ERROR", error: null });
    checkIdentifierMutation.mutate({ identifier: phone });
  }, [state.phone, checkIdentifierMutation]);

  const doPasswordLogin = useCallback(() => {
    loginMutation.mutate({ identifier: state.phone, password: state.password });
  }, [state.phone, state.password, loginMutation]);

  const requestLoginOtp = useCallback(() => {
    // Force password reset flow for existing users via OTP
    purposeRef.current = "PASSWORD_RESET";
    requestOtpMutation.mutate({
      identifier: state.phone,
      purpose: "PASSWORD_RESET",
    });
  }, [state.phone, requestOtpMutation]);

  const verifyLoginOtp = useCallback(() => {
    verifyOtpMutation.mutate({
      identifier: state.phone,
      purpose: "LOGIN",
      code: state.otp,
    });
  }, [state.phone, state.otp, verifyOtpMutation]);

  const submitResetOtp = useCallback(() => {
    resetPasswordMutation.mutate({
      identifier: state.phone,
      code: state.otp,
      newPassword: state.newPassword,
    });
  }, [state.phone, state.otp, state.newPassword, resetPasswordMutation]);

  const finishRegistration = useCallback(() => {
    if (!state.signupToken) return;
    completeRegistrationMutation.mutate({
      signupToken: state.signupToken,
      firstName: state.firstName,
      lastName: state.lastName,
      password: state.password,
    });
  }, [
    state.signupToken,
    state.firstName,
    state.lastName,
    state.password,
    completeRegistrationMutation,
  ]);

  return {
    state,
    set,
    submitIdentifier,
    doPasswordLogin,
    requestLoginOtp,
    verifyLoginOtp,
    submitResetOtp,
    finishRegistration,
    goToPhase: (p: LoginPhase) => dispatch({ type: "SET_PHASE", phase: p }),
    mutations: {
      checkIdentifier: checkIdentifierMutation,
      login: loginMutation,
      requestOtp: requestOtpMutation,
      verifyOtp: verifyOtpMutation,
      completeRegistration: completeRegistrationMutation,
      resetPassword: resetPasswordMutation,
    },
  };
}
