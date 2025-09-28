"use client";
import React, { createContext, useContext, useMemo, useCallback } from "react";
import { useOrgState } from "@/organizations/organization/context/org-context";
import { useNavigationTree } from "./queries";
import type { NavigationContextValue } from "./types";
import type { NavigationItemTree } from "../types/navigation.types";

const NavigationContext = createContext<NavigationContextValue | undefined>(
  undefined
);

function flattenTree(nodes: NavigationItemTree[]): NavigationItemTree[] {
  const acc: NavigationItemTree[] = [];
  const walk = (list: NavigationItemTree[]) => {
    list.forEach((n) => {
      acc.push(n);
      if (n.children?.length) walk(n.children);
    });
  };
  walk(nodes);
  return acc;
}

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { activeRole, activeRoleSource } = useOrgState();
  const navQuery = useNavigationTree(activeRole, activeRoleSource);

  const refetch = useCallback(async () => {
    await navQuery.refetch();
  }, [navQuery]);
  const flat = useMemo(() => flattenTree(navQuery.data || []), [navQuery.data]);

  const hasPath = useCallback(
    (path: string) => flat.some((i) => i.path === path),
    [flat]
  );
  const findByPath = useCallback(
    (path: string) => flat.find((i) => i.path === path),
    [flat]
  );

  const value: NavigationContextValue = useMemo(
    () => ({
      loading: navQuery.isLoading,
      error: navQuery.error ? String(navQuery.error) : null,
      items: navQuery.data || [],
      activeRole: activeRole || null,
      activeRoleSource: activeRoleSource,
      refetch,
      hasPath,
      findByPath,
      flatten: () => flat,
    }),
    [
      navQuery.isLoading,
      navQuery.error,
      navQuery.data,
      activeRole,
      activeRoleSource,
      refetch,
      hasPath,
      findByPath,
      flat,
    ]
  );

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export function useNavigationContext() {
  const ctx = useContext(NavigationContext);
  if (!ctx)
    throw new Error(
      "useNavigationContext must be used inside <NavigationProvider>"
    );
  return ctx;
}
