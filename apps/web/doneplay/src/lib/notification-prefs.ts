"use client";

export type SuccessTransformArgs = {
  method: string;
  path: string;
  serverMessage?: string | null;
};

export type NotificationPrefs = {
  suppressSuccess?: boolean;
  transformSuccessMessage?: (
    args: SuccessTransformArgs
  ) => string | null | undefined;
};

let currentPrefs: NotificationPrefs = {};

export function setNotificationPrefs(prefs: NotificationPrefs) {
  currentPrefs = { ...prefs };
}

export function getNotificationPrefs(): NotificationPrefs {
  return currentPrefs;
}

export function resetNotificationPrefs() {
  currentPrefs = {};
}
