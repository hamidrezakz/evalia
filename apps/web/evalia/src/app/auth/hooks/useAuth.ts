"use client";
import {
  useMutation,
  useQuery,
  UseMutationOptions,
} from "@tanstack/react-query";
import {
  authKeys,
  checkIdentifier,
  loginWithPassword,
  requestOtp,
  verifyOtp,
  completeRegistration,
} from "../api/auth.api";
import type {
  CheckIdentifierData,
  OtpRequestData,
  VerifyOtpData,
  LoginPasswordData,
  CompleteRegistrationData,
} from "../api/auth.types";
import { AUTH_CACHE } from "../auth.config";

/**
 * Hooks for auth flows built on top of the low-level auth.api.ts functions.
 * These encapsulate caching keys and mutation lifecycle handling.
 */

export function useCheckIdentifier(identifier: string | null, enabled = true) {
  return useQuery({
    queryKey: identifier
      ? authKeys.identifier(identifier)
      : authKeys.identifier(""),
    queryFn: () => {
      if (!identifier) throw new Error("identifier is required");
      return checkIdentifier(identifier);
    },
    enabled: enabled && !!identifier,
    staleTime: AUTH_CACHE.IDENTIFIER_STALE,
    gcTime: AUTH_CACHE.IDENTIFIER_GC,
  });
}

export function useLoginMutation(
  options?: UseMutationOptions<
    LoginPasswordData,
    Error,
    { identifier: string; password: string }
  >
) {
  return useMutation({
    mutationKey: authKeys.mLogin(),
    mutationFn: ({ identifier, password }) =>
      loginWithPassword(identifier, password),
    ...options,
  });
}

export function useRequestOtpMutation(
  options?: UseMutationOptions<
    OtpRequestData,
    Error,
    { identifier: string; purpose: string }
  >
) {
  return useMutation({
    mutationKey: authKeys.mOtpRequest(),
    mutationFn: ({ identifier, purpose }) => requestOtp(identifier, purpose),
    ...options,
  });
}

export function useVerifyOtpMutation(
  options?: UseMutationOptions<
    VerifyOtpData,
    Error,
    { identifier: string; purpose: string; code: string }
  >
) {
  return useMutation({
    mutationKey: authKeys.mOtpVerify(),
    mutationFn: ({ identifier, purpose, code }) =>
      verifyOtp(identifier, purpose, code),
    ...options,
  });
}

export function useCompleteRegistrationMutation(
  options?: UseMutationOptions<
    CompleteRegistrationData,
    Error,
    {
      signupToken: string;
      firstName: string;
      lastName: string;
      password: string;
    }
  >
) {
  return useMutation({
    mutationKey: authKeys.mCompleteRegistration(),
    mutationFn: ({ signupToken, firstName, lastName, password }) =>
      completeRegistration(signupToken, firstName, lastName, password),
    ...options,
  });
}

export function useCheckIdentifierMutation(
  options?: UseMutationOptions<
    CheckIdentifierData,
    Error,
    { identifier: string }
  >
) {
  return useMutation({
    mutationKey: authKeys.identifier("mutation"),
    mutationFn: ({ identifier }) => checkIdentifier(identifier),
    ...options,
  });
}
