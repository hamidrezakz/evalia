"use client";
import { toast } from "sonner";

export function notifyError(message: string, opts?: { description?: string }) {
  try {
    toast.error(message || "خطا رخ داد", {
      description: opts?.description,
      duration: 5000,
    });
  } catch {
    // noop (SSR or toast not mounted)
  }
}

export function notifySuccess(
  message: string,
  opts?: { description?: string }
) {
  try {
    toast.success(message || "عملیات با موفقیت انجام شد", {
      description: opts?.description,
      duration: 3000,
    });
  } catch {
    // noop
  }
}
