"use client";
import React from "react";
import { Panel, PanelHeader, PanelContent } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { SessionStateBadge } from "@/components/status-badges/SessionStateBadge";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ResponsePerspectiveEnum, type ResponsePerspective } from "@/lib/enums";
import { cn, formatIranPhone } from "@/lib/utils";
import { TakeHeader } from "./TakeHeader";
import { useAvatarImage } from "@/users/api/useAvatarImage";
import {
  Target,
  BookOpen,
  Users,
  Eye,
  CalendarCheck,
  CalendarX,
  User2,
} from "lucide-react";
import {
  ResponsePerspectiveBadge,
  PhoneBadge,
} from "@/components/status-badges";
import { PreviewUserCard } from "./PreviewUserCard";

type BasicUser =
  | {
      id: number;
      fullName?: string | null;
      name?: string | null;
      email?: string | null;
      phone?: string | null;
      avatarUrl?: string | null;
      avatar?: string | null;
    }
  | null
  | undefined;

interface TakeHeaderPanelProps {
  // mode/session
  previewMode: boolean;
  activeSession: any;
  sessionName: string;
  sessionState: string | null;
  // perspective/subject controls
  availablePerspectives: string[] | null | undefined;
  activePerspective: string | null;
  setActivePerspective: (p: string | null) => void;
  allowedSubjectIds: string[]; // stringified ids
  subjectUserId: number | null;
  setSubjectUserId: (id: number | null) => void;
  loadingSubjects?: boolean;
  // respondent/subject preview data
  respondent: BasicUser;
  subject: BasicUser;
  effUserId: number | null;
  effSubjectUserId: number | null;
  needsSubject: boolean;
}

export function TakeHeaderPanel({
  previewMode,
  activeSession,
  sessionName,
  sessionState,
  availablePerspectives,
  activePerspective,
  setActivePerspective,
  allowedSubjectIds,
  subjectUserId,
  setSubjectUserId,
  loadingSubjects,
  respondent,
  subject,
  effUserId,
  effSubjectUserId,
  needsSubject,
}: TakeHeaderPanelProps) {
  // Avatars
  const respondentRaw =
    (respondent?.avatarUrl as string | null) ||
    (respondent?.avatar as string | null) ||
    null;
  const { src: respondentAvatarSrc } = useAvatarImage(respondentRaw);
  const subjectRaw =
    (subject?.avatarUrl as string | null) ||
    (subject?.avatar as string | null) ||
    null;
  const { src: subjectAvatarSrc } = useAvatarImage(subjectRaw);

  return (
    <Panel className="shadow-sm w-full overflow-hidden max-w-2xl">
      <PanelHeader className="relative gap-4 flex flex-col [.border-b]:border-border/70">
        <div className="flex flex-col gap-3 w-full">
          {/* Left cluster (title & meta) */}
          <div className="flex flex-col gap-1 min-w-0 relative">
            {/* Title with subtle background icon */}
            <div className="relative pr-0">
              <div className="absolute -left-2 -top-2 opacity-10 pointer-events-none">
                <Target className="size-10 text-primary" />
              </div>
              <h1 className="font-semibold text-base sm:text-lg mb-1 tracking-tight truncate max-w-[70vw]">
                {sessionName}
              </h1>
              {previewMode && (
                <Badge
                  variant="outline"
                  className="h-5 ml-1 px-2 text-[11px] rounded-full bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-800/60 inline-flex items-center gap-1">
                  <Eye className="size-3.5" />
                  پیش‌نمایش
                </Badge>
              )}
              {sessionState && (
                <SessionStateBadge
                  state={sessionState as any}
                  size="xs"
                  tone="soft"
                />
              )}
            </div>
            <div className="flex mt-4 flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
              {activeSession?.startAt && (
                <span className="flex items-center gap-1.5">
                  <CalendarCheck
                    className="size-3.5 text-muted-foreground/80"
                    aria-hidden="true"
                  />
                  <span className="opacity-70">شروع:</span>
                  <time suppressHydrationWarning>
                    {new Date(activeSession.startAt as any).toLocaleString(
                      "fa-IR"
                    )}
                  </time>
                </span>
              )}
              {activeSession?.endAt && (
                <span className="flex items-center gap-1.5">
                  <CalendarX
                    className="size-3.5 text-muted-foreground/80"
                    aria-hidden="true"
                  />
                  <span className="opacity-70">پایان:</span>
                  <time suppressHydrationWarning>
                    {new Date(activeSession.endAt as any).toLocaleString(
                      "fa-IR"
                    )}
                  </time>
                </span>
              )}
              {activePerspective && (
                <span className="flex items-center gap-1.5 mt-1">
                  <BookOpen
                    className="size-3.5 text-muted-foreground/80"
                    aria-hidden="true"
                  />
                  <span className="opacity-70">پرسپکتیو:</span>
                  <ResponsePerspectiveBadge
                    value={activePerspective as ResponsePerspective}
                    tone="soft"
                    size="xs"
                  />
                </span>
              )}
              {activePerspective &&
                activePerspective !== "SELF" &&
                subjectUserId && (
                  <span className="flex items-center gap-1.5">
                    <User2
                      className="size-3.5 text-muted-foreground/80"
                      aria-hidden="true"
                    />
                    <span className="opacity-70">سوژه:</span>
                    <span className="font-medium truncate max-w-[45vw]">
                      {subject?.fullName ||
                        subject?.email ||
                        `کاربر #${subjectUserId}`}
                    </span>
                    {subject?.phone ? (
                      <PhoneBadge
                        phone={String(subject.phone)}
                        tone="soft"
                        size="xs"
                      />
                    ) : null}
                  </span>
                )}
            </div>
            {/* Dedicated controls row: always together, wraps within itself, never mixes with meta */}
            {!previewMode && (
              <div className="mt-6 w-full">
                <div className="flex items-center gap-2 min-w-0 flex-wrap">
                  <TakeHeader
                    perspectives={availablePerspectives}
                    activePerspective={activePerspective as any}
                    setActivePerspective={(p) => setActivePerspective(p as any)}
                    allowedSubjectIds={allowedSubjectIds}
                    activeSubjectId={
                      subjectUserId ? String(subjectUserId) : null
                    }
                    setActiveSubjectId={(id) =>
                      setSubjectUserId(id ? Number(id) : null)
                    }
                    loadingSubjects={loadingSubjects}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </PanelHeader>
      <PanelContent className="pt-3 mb-3 w-full overflow-visible">
        <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4">
          {previewMode ? (
            <PreviewUserCard
              title="شرکت‌کننده"
              user={respondent as any}
              perspective={activePerspective as any}
            />
          ) : null}
          {previewMode && needsSubject && effSubjectUserId ? (
            <PreviewUserCard title="موضوع ارزیابی" user={subject as any} />
          ) : null}
        </div>
      </PanelContent>
    </Panel>
  );
}
