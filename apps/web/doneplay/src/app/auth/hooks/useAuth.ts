"use client";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { ApiResponse } from "@/lib/api/types";
import {
  authKeys,
  checkIdentifier,
  loginWithPassword,
  requestOtp,
  verifyOtp,
  completeRegistration,
  resetPassword,
} from "../api/auth.api";
import type {
  CheckIdentifierData,
  OtpRequestData,
  VerifyOtpData,
  LoginPasswordData,
  CompleteRegistrationData,
  ResetPasswordData,
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
    { identifier: string; password: string; orgSlug?: string | null }
  >
) {
  return useMutation({
    mutationKey: authKeys.mLogin(),
    mutationFn: ({ identifier, password, orgSlug }) =>
      loginWithPassword(identifier, password, orgSlug),
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
    {
      identifier: string;
      purpose: string;
      code: string;
      orgSlug?: string | null;
    }
  >
) {
  return useMutation({
    mutationKey: authKeys.mOtpVerify(),
    mutationFn: ({ identifier, purpose, code, orgSlug }) =>
      verifyOtp(identifier, purpose, code, orgSlug),
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
      orgSlug?: string | null;
    }
  >
) {
  return useMutation({
    mutationKey: authKeys.mCompleteRegistration(),
    mutationFn: ({ signupToken, firstName, lastName, password, orgSlug }) =>
      completeRegistration(signupToken, firstName, lastName, password, orgSlug),
    ...options,
  });
}

export function useResetPasswordMutation(
  options?: UseMutationOptions<
    ApiResponse<ResetPasswordData>,
    Error,
    { identifier: string; code: string; newPassword: string }
  >
) {
  return useMutation({
    mutationKey: authKeys.mResetPassword(),
    mutationFn: ({ identifier, code, newPassword }) =>
      resetPassword(identifier, code, newPassword),
    ...options,
  });
}
