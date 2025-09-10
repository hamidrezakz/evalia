"use client";
import { useCallback, useReducer, useEffect } from "react";
import {
  useLoginMutation,
  useRequestOtpMutation,
  useVerifyOtpMutation,
  useCompleteRegistrationMutation,
  useCheckIdentifierMutation,
} from "./useAuth";
import { useQueryClient } from "@tanstack/react-query";

export type LoginPhase =
  | "IDENTIFIER"
  | "PASSWORD"
  | "OTP"
  | "COMPLETE_REGISTRATION"; // after signupToken

interface State {
  phase: LoginPhase;
  phone: string;
  password: string;
  otp: string;
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
    onSuccess: (res) => {
      dispatch({ type: "EXISTS", exists: res.data.exists });
      if (res.data.exists) {
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
    onSuccess: (res) => {
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
    onSuccess: (res) => {
      dispatch({ type: "DEV_CODE", code: res.data.devCode || null });
      dispatch({ type: "SET_PHASE", phase: "OTP" });
    },
    onError: (err: Error) => dispatch({ type: "ERROR", error: err.message }),
  });
  const verifyOtpMutation = useVerifyOtpMutation({
    onSuccess: (res) => {
      if (res.data.mode === "LOGIN") {
        dispatch({ type: "MODE", mode: "LOGIN" });
        if (state.phone) {
          queryClient.invalidateQueries({
            queryKey: ["auth", "identifier", state.phone],
          });
        }
        onSuccess();
      } else if (res.data.mode === "SIGNUP") {
        dispatch({ type: "MODE", mode: "SIGNUP" });
        dispatch({ type: "SIGNUP_TOKEN", token: res.data.signupToken });
        dispatch({ type: "SET_PHASE", phase: "COMPLETE_REGISTRATION" });
      }
    },
    onError: (err: Error) => dispatch({ type: "ERROR", error: err.message }),
  });
  const completeRegistrationMutation = useCompleteRegistrationMutation({
    onSuccess: (res) => {
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

  useEffect(() => {
    const loading =
      checkIdentifierMutation.isPending ||
      loginMutation.isPending ||
      requestOtpMutation.isPending ||
      verifyOtpMutation.isPending ||
      completeRegistrationMutation.isPending;
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
    requestOtpMutation.mutate({ identifier: state.phone, purpose: "LOGIN" });
  }, [state.phone, requestOtpMutation]);

  const verifyLoginOtp = useCallback(() => {
    verifyOtpMutation.mutate({
      identifier: state.phone,
      purpose: "LOGIN",
      code: state.otp,
    });
  }, [state.phone, state.otp, verifyOtpMutation]);

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
    finishRegistration,
    goToPhase: (p: LoginPhase) => dispatch({ type: "SET_PHASE", phase: p }),
    mutations: {
      checkIdentifier: checkIdentifierMutation,
      login: loginMutation,
      requestOtp: requestOtpMutation,
      verifyOtp: verifyOtpMutation,
      completeRegistration: completeRegistrationMutation,
    },
  };
}
