"use client";
import {
  useMutation,
  useQuery,
  UseMutationOptions,
} from "@tanstack/react-query";
import { ApiResponse } from "@/lib/api/types";
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

/**
 * Hooks for auth flows built on top of the low-level auth.api.ts functions.
 * These encapsulate caching keys and mutation lifecycle handling.
 */

export function useCheckIdentifierMutation(
  options?: UseMutationOptions<
    ApiResponse<CheckIdentifierData>,
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

export function useLoginMutation(
  options?: UseMutationOptions<
    ApiResponse<LoginPasswordData>,
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
    ApiResponse<OtpRequestData>,
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
    ApiResponse<VerifyOtpData>,
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
    ApiResponse<CompleteRegistrationData>,
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
