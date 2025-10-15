"use client";
import React from "react";
import { PerspectiveDropdown } from "./PerspectiveDropdown";
import { cn, formatIranPhone } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAvatarImage } from "@/users/api/useAvatarImage";
import { useUsersByIds } from "@/users/api/users-hooks";
import { resolveApiBase } from "@/lib/api/helpers";
import { Users2 } from "lucide-react";

interface TakeHeaderProps {
  perspectives: string[] | null | undefined;
  activePerspective: string | null;
  setActivePerspective: (p: string | null) => void;
  allowedSubjectIds: string[] | undefined; // raw ids (stringified numbers)
  activeSubjectId: string | null;
  setActiveSubjectId: (id: string | null) => void;
  loadingSubjects?: boolean;
  className?: string;
}

export function TakeHeader({
  perspectives,
  activePerspective,
  setActivePerspective,
  allowedSubjectIds,
  activeSubjectId,
  setActiveSubjectId,
  loadingSubjects,
  className,
}: TakeHeaderProps) {
  // Only show subject dropdown if current perspective is NOT SELF
  const showSubject =
    activePerspective && activePerspective !== "SELF" && allowedSubjectIds;

  const normIds = React.useMemo(
    () => (allowedSubjectIds || []).map((v) => Number(v)).filter((v) => v > 0),
    [allowedSubjectIds ? allowedSubjectIds.join(",") : ""]
  );
  const {
    users: subjectMap,
    loadingIds,
    errorIds,
    hasAny,
  } = useUsersByIds(showSubject ? normIds : []);

  React.useEffect(() => {
    if (!showSubject || activeSubjectId || !normIds.length) return;
    for (const id of normIds) {
      if (subjectMap[id]) {
        setActiveSubjectId(String(id));
        break;
      }
    }
  }, [showSubject, activeSubjectId, normIds, subjectMap, setActiveSubjectId]);

  const activeData = activeSubjectId
    ? subjectMap[Number(activeSubjectId)]
    : null;
  const { src: activeAvatarSrc } = useAvatarImage(
    ((activeData?.avatarUrl as string | null) ||
      (activeData as any)?.avatar ||
      null) as string | null
  );
  const anyLoading = loadingIds.length > 0 && !hasAny;
  const anyFetched = hasAny;
  const subjectButtonLabel = activeData
    ? activeData.fullName ||
      activeData.email ||
      activeData.phone ||
      `#${activeData.id}`
    : anyLoading && !anyFetched
    ? "در حال بارگذاری..."
    : "انتخاب سوژه";

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap gap-3 items-center">
        <PerspectiveDropdown
          perspectives={perspectives}
          active={activePerspective}
          onChange={(p) => setActivePerspective(p)}
        />
        {showSubject ? (
          <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={
                  !allowedSubjectIds?.length || (anyLoading && !anyFetched)
                }
                className="h-8 inline-flex items-center gap-2 justify-between min-w-0 max-w-full">
                <span className="flex items-center gap-2 min-w-0 max-w-full">
                  {activeData ? (
                    <Avatar className="h-5 w-5">
                      <AvatarImage
                        src={activeAvatarSrc || undefined}
                        alt={activeData.fullName || String(activeData.id)}
                      />
                      <AvatarFallback className="text-[9px]">
                        {(activeData.fullName || activeData.email || "?")
                          .split(" ")
                          .map((w: string) => w[0])
                          .filter(Boolean)
                          .slice(0, 2)
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <Users2 className="size-4 text-muted-foreground" />
                  )}
                  <span
                    className="truncate text-xs max-w-[52vw] sm:max-w-[240px]"
                    suppressHydrationWarning>
                    {subjectButtonLabel}
                  </span>
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="min-w-[220px]"
              sideOffset={6}>
              <DropdownMenuLabel className="text-[11px]">
                انتخاب سوژه
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {normIds.length ? (
                normIds.map((id) => {
                  const d = subjectMap[id];
                  const load = loadingIds.includes(id) && !d;
                  const err = errorIds[id];
                  return (
                    <SubjectDropdownItem
                      key={id}
                      id={id}
                      user={d}
                      loading={load && !d}
                      error={err}
                      onSelect={() => setActiveSubjectId(String(id))}
                    />
                  );
                })
              ) : (
                <div className="px-2 py-1 text-[11px] text-muted-foreground">
                  سوژه‌ای موجود نیست
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
        {allowedSubjectIds && showSubject && (
          <Badge
            variant="outline"
            className="h-6 px-2 text-[10px] rounded-full bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/15 dark:text-emerald-300 dark:border-emerald-800/60 inline-flex items-center gap-1 min-w-0 whitespace-nowrap">
            {/* ShieldCheck icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-3.5">
              <path d="M12 2c-1.7 1.3-3.7 2-6 2v6c0 5.5 3.8 10.4 9 12 5.2-1.6 9-6.5 9-12V4c-2.3 0-4.3-.7-6-2-1.7 1.3-3.7 2-6 2V2z"></path>
              <path d="M10.9 13.5l-1.9-1.9-1.4 1.4 3.3 3.3 6-6-1.4-1.4-4.6 4.6z"></path>
            </svg>
            <span className="tabular-nums">{allowedSubjectIds.length}</span>
            <span>سوژه مجاز</span>
          </Badge>
        )}
      </div>
    </div>
  );
}

function SubjectDropdownItem({
  id,
  user,
  loading,
  error,
  onSelect,
}: {
  id: number;
  user: any | null | undefined;
  loading: boolean;
  error: any;
  onSelect: () => void;
}) {
  const avatarRaw =
    (user?.avatarUrl as string | null) || (user as any)?.avatar || null;
  const { src } = useAvatarImage(avatarRaw);
  return (
    <DropdownMenuItem
      disabled={loading && !user}
      className="text-[12px] flex items-center gap-2"
      onClick={onSelect}>
      {user ? (
        <Avatar className="h-6 w-6">
          <AvatarImage
            src={src || undefined}
            alt={user.fullName || user.email || String(user.id)}
          />
          <AvatarFallback className="text-[10px]">
            {(user.fullName || user.email || "?")
              .split(" ")
              .map((w: string) => w[0])
              .filter(Boolean)
              .slice(0, 2)
              .join("")}
          </AvatarFallback>
        </Avatar>
      ) : (
        <span className="flex items-center justify-center h-6 w-6 rounded bg-muted/40 text-[10px] text-muted-foreground">
          …
        </span>
      )}
      <div className="flex flex-col min-w-0">
        <span className="truncate font-medium">
          {user
            ? user.fullName || user.email || user.phone || `#${user.id}`
            : loading
            ? "در حال بارگذاری…"
            : error
            ? `#${id}`
            : `#${id}`}
        </span>
        {user?.phone && (
          <span className="text-[10px] text-muted-foreground truncate">
            {formatIranPhone(String(user.phone))}
          </span>
        )}
        {!user && !loading && error && (
          <span className="text-[9px] text-rose-500">خطا</span>
        )}
      </div>
    </DropdownMenuItem>
  );
}
