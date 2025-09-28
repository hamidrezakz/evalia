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
    (activeData?.avatarUrl as string | null) || null
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
                className="h-8 inline-flex items-center gap-2 min-w-[200px] justify-between">
                <span className="flex items-center gap-2 min-w-0">
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
                  <span className="truncate text-xs" suppressHydrationWarning>
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
                  const avatarPath = d?.avatarUrl || (d as any)?.avatar || null;
                  const avatarSrc = avatarPath
                    ? avatarPath.startsWith("/")
                      ? resolveApiBase() + avatarPath
                      : avatarPath
                    : undefined;
                  return (
                    <DropdownMenuItem
                      key={id}
                      disabled={load && !d}
                      className="text-[12px] flex items-center gap-2"
                      onClick={() => setActiveSubjectId(String(id))}>
                      {d ? (
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={avatarSrc || undefined}
                            alt={d.fullName || d.email || String(d.id)}
                          />
                          <AvatarFallback className="text-[10px]">
                            {(d.fullName || d.email || "?")
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
                          {d
                            ? d.fullName || d.email || d.phone || `#${d.id}`
                            : load
                            ? "در حال بارگذاری…"
                            : err
                            ? `#${id}`
                            : `#${id}`}
                        </span>
                        {d?.phone && (
                          <span className="text-[10px] text-muted-foreground truncate">
                            {formatIranPhone(String(d.phone))}
                          </span>
                        )}
                        {!d && !load && err && (
                          <span className="text-[9px] text-rose-500">خطا</span>
                        )}
                      </div>
                    </DropdownMenuItem>
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
          <Badge variant="secondary" className="text-[10px] h-5">
            {allowedSubjectIds.length} سوژه مجاز
          </Badge>
        )}
      </div>
    </div>
  );
}
