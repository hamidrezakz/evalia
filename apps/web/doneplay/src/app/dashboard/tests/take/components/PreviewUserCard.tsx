"use client";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ResponsePerspectiveEnum, type ResponsePerspective } from "@/lib/enums";
import { cn, formatIranPhone } from "@/lib/utils";
import { useAvatarImage } from "@/users/api/useAvatarImage";
import {
  PhoneBadge,
  ResponsePerspectiveBadge,
} from "@/components/status-badges";

export interface PreviewUserCardProps {
  title: string;
  user:
    | {
        id: number;
        fullName?: string | null;
        email?: string | null;
        phone?: string | null;
        avatarUrl?: string | null;
        avatar?: string | null;
      }
    | null
    | undefined;
  perspective?: ResponsePerspective | null; // show as badge when provided
  className?: string;
}

export function PreviewUserCard({
  title,
  user,
  perspective,
  className,
}: PreviewUserCardProps) {
  const raw =
    (user?.avatarUrl as string | null) ||
    (user?.avatar as string | null) ||
    null;
  const { src } = useAvatarImage(raw);
  const displayName =
    user?.fullName || user?.email || `کاربر #${user?.id ?? "?"}`;

  return (
    <div
      className={cn(
        "group relative shrink-0 w-full sm:w-fit min-w-[200px] sm:min-w-[260px] max-w-full rounded-xl border border-border/60 card-surface-focus card-surface p-3 sm:p-3.5 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 overflow-hidden",
        "transition-colors",
        className
      )}>
      {/* Accent bar on the right (RTL) */}
      <div className="pointer-events-none gap-1 absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-primary/60 to-primary/20 opacity-40 group-hover:opacity-70 transition-opacity" />
      <Avatar className="size-8">
        <AvatarImage src={src || undefined} alt={String(displayName)} />
        <AvatarFallback className="text-[11px]">
          {String(displayName)
            .split(" ")
            .map((w) => w[0])
            .filter(Boolean)
            .slice(0, 2)
            .join("")}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 w-full">
        <div className="flex items-center gap-2">
          <Label className="text-[10px] text-muted-foreground">{title}</Label>
          {perspective ? (
            <ResponsePerspectiveBadge
              value={perspective}
              tone="soft"
              size="xs"
            />
          ) : null}
        </div>
        <div className="text-sm font-semibold tracking-tight truncate mt-1">
          {displayName}
        </div>
        {(user?.email || user?.phone) && (
          <div className="flex items-center gap-1 flex-wrap text-[11px] text-muted-foreground">
            {user?.email ? (
              <Badge
                variant="outline"
                className="rounded-full text-[10px]"
                dir="ltr">
                {user.email}
              </Badge>
            ) : null}
            {user?.phone ? (
              <PhoneBadge className="mt-2" phone={String(user.phone)} tone="soft" size="xs" />
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

export default PreviewUserCard;
