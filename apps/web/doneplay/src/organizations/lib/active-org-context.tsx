"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

interface ActiveOrgContextValue {
  activeOrgId?: number;
  setActiveOrgId: (id?: number) => void;
}

const ActiveOrgContext = createContext<ActiveOrgContextValue | undefined>(
  undefined
);

export function ActiveOrgProvider({ children }: { children: React.ReactNode }) {
  const [activeOrgId, setActiveOrgIdState] = useState<number | undefined>(
    undefined
  );

  useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? window.localStorage.getItem("activeOrgId")
        : null;
    if (stored) setActiveOrgIdState(Number(stored));
  }, []);

  const setActiveOrgId = (id?: number) => {
    setActiveOrgIdState(id);
    if (typeof window !== "undefined") {
      if (id) window.localStorage.setItem("activeOrgId", String(id));
      else window.localStorage.removeItem("activeOrgId");
    }
  };

  return (
    <ActiveOrgContext.Provider value={{ activeOrgId, setActiveOrgId }}>
      {children}
    </ActiveOrgContext.Provider>
  );
}

export function useActiveOrg() {
  const ctx = useContext(ActiveOrgContext);
  if (!ctx)
    throw new Error("useActiveOrg must be used within ActiveOrgProvider");
  return ctx;
}
