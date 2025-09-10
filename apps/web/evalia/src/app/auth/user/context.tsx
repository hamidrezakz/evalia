"use client";
import React, { createContext, useContext, useMemo, useCallback } from "react";
import { useAuthSession } from "../event/session-context";
import { useUserData } from "./queries";
import type { UserDataContextValue } from "./types";

const UserDataContext = createContext<UserDataContextValue | undefined>(
  undefined
);

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { userId } = useAuthSession();
  const userQuery = useUserData(userId, !!userId);

  const refetch = useCallback(async () => {
    await userQuery.refetch();
  }, [userQuery]);

  const value: UserDataContextValue = useMemo(
    () => ({
      user: userQuery.data || null,
      userId: userId || null,
      loading: userQuery.isLoading,
      error: userQuery.error ? String(userQuery.error) : null,
      refetch,
    }),
    [userQuery.data, userQuery.isLoading, userQuery.error, userId, refetch]
  );

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
};

export function useUserDataContext() {
  const ctx = useContext(UserDataContext);
  if (!ctx)
    throw new Error(
      "useUserDataContext must be used inside <UserDataProvider>"
    );
  return ctx;
}
