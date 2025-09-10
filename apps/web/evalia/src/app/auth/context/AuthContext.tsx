"use client";
// Thin compatibility facade for the modular AuthContext implementation
export { AuthProvider } from "./AuthContext/auth-provider";
export { useAuthContext, useRequireAuth } from "./AuthContext/auth-hooks";
export { AuthContext } from "./AuthContext/context-core";
