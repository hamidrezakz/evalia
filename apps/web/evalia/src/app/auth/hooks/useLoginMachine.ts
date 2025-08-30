"use client";
import { useCallback, useReducer } from "react";
import {
  checkIdentifier,
  loginWithPassword,
  requestOtp,
  verifyOtp,
  register,
} from "../lib/auth-api";

export type LoginPhase = "IDENTIFIER" | "PASSWORD" | "OTP" | "REGISTER";

interface State {
  phase: LoginPhase;
  identifier: string;
  password: string;
  otp: string;
  firstName: string;
  lastName: string;
  loading: boolean;
  error: string | null;
  devCode: string | null; // dev only
  exists: boolean | null; // identifier existence
}

const initial: State = {
  phase: "IDENTIFIER",
  identifier: "",
  password: "",
  otp: "",
  firstName: "",
  lastName: "",
  loading: false,
  error: null,
  devCode: null,
  exists: null,
};

type Action =
  | { type: "SET_FIELD"; field: keyof State; value: any }
  | { type: "SET_PHASE"; phase: LoginPhase }
  | { type: "LOADING"; value: boolean }
  | { type: "ERROR"; error: string | null }
  | { type: "DEV_CODE"; code: string | null }
  | { type: "EXISTS"; exists: boolean };

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
    default:
      return state;
  }
}

export function useLoginMachine(onSuccess: () => void) {
  const [state, dispatch] = useReducer(reducer, initial);

  const set = useCallback(
    (field: keyof State, value: any) =>
      dispatch({ type: "SET_FIELD", field, value }),
    []
  );

  async function wrap<T>(fn: () => Promise<T>) {
    dispatch({ type: "LOADING", value: true });
    dispatch({ type: "ERROR", error: null });
    try {
      return await fn();
    } catch (e: any) {
      dispatch({ type: "ERROR", error: e.message || "خطا" });
      throw e;
    } finally {
      dispatch({ type: "LOADING", value: false });
    }
  }

  const submitIdentifier = useCallback(async () => {
    const identifier = state.identifier.trim();
    if (!identifier) return;
    const res = await wrap(() => checkIdentifier(identifier));
    dispatch({ type: "EXISTS", exists: res.exists });
    dispatch({
      type: "SET_PHASE",
      phase: res.exists ? "PASSWORD" : "REGISTER",
    });
  }, [state.identifier]);

  const doPasswordLogin = useCallback(async () => {
    await wrap(() => loginWithPassword(state.identifier, state.password));
    onSuccess();
  }, [state.identifier, state.password, onSuccess]);

  const requestLoginOtp = useCallback(async () => {
    const r = await wrap(() => requestOtp(state.identifier, "LOGIN"));
    dispatch({ type: "DEV_CODE", code: r.devCode || null });
    dispatch({ type: "SET_PHASE", phase: "OTP" });
  }, [state.identifier]);

  const verifyLoginOtp = useCallback(async () => {
    await wrap(() => verifyOtp(state.identifier, "LOGIN", state.otp));
    onSuccess();
  }, [state.identifier, state.otp, onSuccess]);

  const doRegister = useCallback(async () => {
    await wrap(() =>
      register(
        state.identifier,
        state.password,
        state.firstName,
        state.lastName
      )
    );
    onSuccess();
  }, [
    state.identifier,
    state.password,
    state.firstName,
    state.lastName,
    onSuccess,
  ]);

  return {
    state,
    set,
    submitIdentifier,
    doPasswordLogin,
    requestLoginOtp,
    verifyLoginOtp,
    doRegister,
    goToPhase: (p: LoginPhase) => dispatch({ type: "SET_PHASE", phase: p }),
  };
}
