"use client";
import { useCallback, useReducer } from "react";
import {
  checkIdentifier,
  loginWithPassword,
  requestOtp,
  verifyOtp,
  completeRegistration,
} from "../api/auth.api";

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

// Action type for the reducer: describes all possible actions that can be dispatched.
// This is a TypeScript union type: Action can be any ONE of these object shapes.
// Each action has a 'type' field (string literal) and, depending on the action, additional fields.
// This pattern ensures type safety and clear intent for each action in the reducer.
// Example usage:
//   dispatch({ type: "SET_FIELD", field: "phone", value: "0912..." })
//   dispatch({ type: "ERROR", error: "Invalid password" })
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

  const set = useCallback(
    <K extends keyof State>(field: K, value: State[K]) =>
      dispatch({ type: "SET_FIELD", field, value }),
    []
  );

  async function wrap<T>(fn: () => Promise<T>) {
    dispatch({ type: "LOADING", value: true });
    dispatch({ type: "ERROR", error: null });
    try {
      return await fn();
    } catch (e) {
      const err = e as Error;
      dispatch({ type: "ERROR", error: err.message || "خطا" });
      throw err;
    } finally {
      dispatch({ type: "LOADING", value: false });
    }
  }

  const submitIdentifier = useCallback(async () => {
    const phone = state.phone.trim();
    if (!phone) return;
    const res = await wrap(() => checkIdentifier(phone));
    dispatch({ type: "EXISTS", exists: res.data.exists });
    if (res.data.exists) {
      dispatch({ type: "SET_PHASE", phase: "PASSWORD" });
    } else {
      // directly request OTP for new phone (SIGNUP path)
      const r = await wrap(() => requestOtp(phone, "LOGIN")); // purpose can stay LOGIN for now
      dispatch({ type: "DEV_CODE", code: r.data.devCode || null });
      dispatch({ type: "SET_PHASE", phase: "OTP" });
    }
  }, [state.phone]);

  const doPasswordLogin = useCallback(async () => {
    const res = await wrap(() =>
      loginWithPassword(state.phone, state.password)
    );
    if (res.success) onSuccess();
    else dispatch({ type: "ERROR", error: res.message || "خطا" });
  }, [state.phone, state.password, onSuccess]);

  const requestLoginOtp = useCallback(async () => {
    const r = await wrap(() => requestOtp(state.phone, "LOGIN"));
    dispatch({ type: "DEV_CODE", code: r.data.devCode || null });
    dispatch({ type: "SET_PHASE", phase: "OTP" });
  }, [state.phone]);

  const verifyLoginOtp = useCallback(async () => {
    const r = await wrap(() => verifyOtp(state.phone, "LOGIN", state.otp));
    if (r.data.mode === "LOGIN") {
      onSuccess();
    } else if (r.data.mode === "SIGNUP") {
      dispatch({ type: "SIGNUP_TOKEN", token: r.data.signupToken });
      dispatch({ type: "SET_PHASE", phase: "COMPLETE_REGISTRATION" });
    }
  }, [state.phone, state.otp, onSuccess]);

  const finishRegistration = useCallback(async () => {
    if (!state.signupToken) return;
    const res = await wrap(() =>
      completeRegistration(
        state.signupToken!,
        state.firstName,
        state.lastName,
        state.password
      )
    );
    if (res.success) onSuccess();
    else dispatch({ type: "ERROR", error: res.message || "خطا" });
  }, [
    state.signupToken,
    state.firstName,
    state.lastName,
    state.password,
    onSuccess,
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
  };
}
