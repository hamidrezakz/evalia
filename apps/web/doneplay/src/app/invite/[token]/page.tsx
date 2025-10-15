"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  resolveInviteLink,
  consumeInviteLink,
} from "@/assessment/api/invite-links.api";
import { useAuthSession } from "@/app/auth/hooks/useAuthSession";
import { LoadingDots } from "@/components/ui/loading-dots";

export default function InviteTokenPage() {
  const params = useParams<{ token: string }>();
  const token = (params?.token as string) || "";
  const router = useRouter();
  const session = useAuthSession();
  const [orgSlug, setOrgSlug] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Step 1: resolve token (no auth required)
  useEffect(() => {
    let mounted = true;
    async function run() {
      try {
        const res = await resolveInviteLink(token);
        const data: any = res.data;
        if (!mounted) return;
        setOrgSlug((data?.organizationSlug as string) || null);
        setSessionId((data?.sessionId as number) || null);
      } catch (e: any) {
        setError(
          typeof e?.message === "string" ? e.message : "لینک نامعتبر است"
        );
      }
    }
    if (token) run();
    return () => {
      mounted = false;
    };
  }, [token]);

  // Step 2: if not authenticated, bounce to /auth/[slug]?redirect=current
  useEffect(() => {
    // If user is not authenticated, redirect to auth immediately.
    // Prefer org-specific auth route when orgSlug is available; otherwise fallback to generic /auth.
    if (!session.isAuthenticated) {
      const redirect = encodeURIComponent(`/invite/${token}`);
      const path = orgSlug
        ? `/auth/${encodeURIComponent(orgSlug)}?redirect=${redirect}`
        : `/auth?redirect=${redirect}`;
      router.replace(path);
    }
  }, [orgSlug, session.isAuthenticated, token, router]);

  // Step 3: when authenticated, consume and redirect to tests take
  useEffect(() => {
    async function consume() {
      try {
        const res = await consumeInviteLink(token);
        const data: any = res.data || {};
        const next =
          (data.redirectTo as string) ||
          `/dashboard/tests/take${
            sessionId ? `?sessionId=${sessionId}&perspective=SELF` : ""
          }`;
        router.replace(next);
      } catch (e: any) {
        setError(
          typeof e?.message === "string"
            ? e.message
            : "عدم امکان استفاده از لینک"
        );
      }
    }
    if (session.isAuthenticated && token) consume();
  }, [session.isAuthenticated, token, sessionId, router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      {error ? (
        <div className="text-sm text-red-500">{error}</div>
      ) : (
        <div className="flex items-center gap-2 text-muted-foreground">
          <LoadingDots />
          <span>در حال بررسی لینک دعوت…</span>
        </div>
      )}
    </div>
  );
}
