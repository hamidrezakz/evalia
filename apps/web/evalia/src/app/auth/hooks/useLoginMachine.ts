"use client";
import { useCallback, useReducer, useEffect } from "react";
import {
  useLoginMutation,
  useRequestOtpMutation,
  useVerifyOtpMutation,
  useCompleteRegistrationMutation,
} from "./useAuth";
import { checkIdentifier } from "../api/auth.api";
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

  // Removed auto identifier query to avoid multiple network calls while typing.
  const loginMutation = useLoginMutation({
    onSuccess: (data) => {
      dispatch({ type: "MODE", mode: "LOGIN" });
      // Invalidate identifier query cache after successful login
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
      dispatch({ type: "DEV_CODE", code: data.devCode || null });
      dispatch({ type: "SET_PHASE", phase: "OTP" });
    },
    onError: (err: Error) => dispatch({ type: "ERROR", error: err.message }),
  });
  const verifyOtpMutation = useVerifyOtpMutation({
    onSuccess: (data) => {
      if (data.mode === "LOGIN") {
        dispatch({ type: "MODE", mode: "LOGIN" });
        if (state.phone) {
          queryClient.invalidateQueries({
            queryKey: ["auth", "identifier", state.phone],
          });
        }
        onSuccess();
      } else if (data.mode === "SIGNUP") {
        dispatch({ type: "MODE", mode: "SIGNUP" });
        dispatch({ type: "SIGNUP_TOKEN", token: data.signupToken });
        dispatch({ type: "SET_PHASE", phase: "COMPLETE_REGISTRATION" });
      }
    },
    onError: (err: Error) => dispatch({ type: "ERROR", error: err.message }),
  });
  const completeRegistrationMutation = useCompleteRegistrationMutation({
    onSuccess: (data) => {
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

  // Derive loading from mutations / query
  useEffect(() => {
    const loading =
      loginMutation.isPending ||
      requestOtpMutation.isPending ||
      verifyOtpMutation.isPending ||
      completeRegistrationMutation.isPending;
    dispatch({ type: "LOADING", value: loading });
  }, [
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

  const submitIdentifier = useCallback(async () => {
    const phone = state.phone.trim();
    if (!phone) return;
    dispatch({ type: "ERROR", error: null });
    dispatch({ type: "LOADING", value: true });
    try {
      const res = await checkIdentifier(phone);
      dispatch({ type: "EXISTS", exists: res.exists });
      if (res.exists) {
        dispatch({ type: "SET_PHASE", phase: "PASSWORD" });
      } else {
        requestOtpMutation.mutate({ identifier: phone, purpose: "LOGIN" });
      }
    } catch (e: any) {
      dispatch({ type: "ERROR", error: e.message || "خطا" });
    } finally {
      dispatch({ type: "LOADING", value: false });
    }
  }, [state.phone, requestOtpMutation]);

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
      login: loginMutation,
      requestOtp: requestOtpMutation,
      verifyOtp: verifyOtpMutation,
      completeRegistration: completeRegistrationMutation,
    },
  };
}
