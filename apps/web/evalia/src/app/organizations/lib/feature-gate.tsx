"use client";
import React from "react";
import {
  canUseFeature,
  FeatureKey,
  UserRoles,
} from "@/app/organizations/lib/permissions";

interface FeatureGateProps {
  feature: FeatureKey;
  roles: UserRoles;
  activeOrgId?: number;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function FeatureGate({
  feature,
  roles,
  activeOrgId,
  fallback = null,
  children,
}: FeatureGateProps) {
  if (!canUseFeature(feature, roles, activeOrgId)) return <>{fallback}</>;
  return <>{children}</>;
}
