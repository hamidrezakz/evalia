"use client";
import React from "react";
import {
  Panel,
  PanelHeader,
  PanelContent,
  PanelTitle,
  PanelDescription,
} from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardHeaderSkeleton() {
  return (
    <Panel>
      <PanelHeader className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
        <div className="flex items-center gap-4 md:gap-6">
          <Skeleton className="h-20 w-20 rounded-2xl" />
          <div className="flex flex-col gap-3 w-[220px]">
            <Skeleton className="h-5 w-40" />
            <div className="flex gap-2 flex-wrap">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-14" />
            </div>
            <div className="flex gap-3 flex-wrap">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </div>
      </PanelHeader>
      <PanelContent className="flex flex-col gap-6">
        <div className="grid gap-4 md:grid-cols-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-border/40 bg-muted/30 px-3 py-3 flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-md" />
              <div className="flex flex-col gap-2 flex-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-14" />
              </div>
            </div>
          ))}
        </div>
      </PanelContent>
    </Panel>
  );
}

export function SessionsPanelSkeleton({ count = 4 }: { count?: number }) {
  return (
    <Panel>
      <PanelHeader>
        <PanelTitle className="text-sm">آزمون‌های من</PanelTitle>
        <PanelDescription>در حال بارگذاری جلسات ارزیابی...</PanelDescription>
      </PanelHeader>
      <PanelContent className="flex flex-col gap-4 text-[12px] leading-5">
        <div className="grid gap-2 grid-cols-1">
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-border/60 bg-background/40 p-3 animate-pulse">
              <div className="flex items-center gap-3 flex-wrap">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-28" />
                <div className="ms-auto flex gap-2">
                  <Skeleton className="h-8 w-24 rounded" />
                </div>
              </div>
              <div className="mt-2">
                <Skeleton className="h-1.5 w-full rounded" />
              </div>
            </div>
          ))}
        </div>
      </PanelContent>
    </Panel>
  );
}
