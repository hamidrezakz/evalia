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
import { SessionUserCardSkeleton } from "./SessionUserCard";

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

export function SessionsPanelSkeleton({ count = 6 }: { count?: number }) {
  return (
    <Panel>
      <PanelHeader className="pb-0">
        <div className="flex flex-col gap-2 w-full">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-52" />
        </div>
      </PanelHeader>
      <PanelContent className="flex flex-col gap-4 text-[12px] leading-5">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {Array.from({ length: count }).map((_, i) => (
            <SessionUserCardSkeleton key={i} />
          ))}
        </div>
      </PanelContent>
    </Panel>
  );
}

// A richer standalone skeleton card (pretty version) for direct mapping in page while loading
export function SessionUserCardPrettySkeleton() {
  return (
    <div
      className="card-surface px-3 py-3 animate-pulse flex flex-col gap-2"
      dir="rtl">
      {/* Top row: icon + name + state badge placeholder */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-40" />
        <div className="ms-auto flex items-center gap-1">
          <Skeleton className="h-4 w-12 rounded-full" />
        </div>
      </div>
      {/* Secondary badges row: progress badge + question count */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-20 rounded" />
        <Skeleton className="h-4 w-14 rounded" />
      </div>
      {/* Progress bar */}
      <Skeleton className="h-1.5 w-full rounded" />
      {/* Schedule line */}
      <div className="flex items-center gap-2 text-[10px]">
        <Skeleton className="h-3 w-4 rounded" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-3 w-8" />
      </div>
      {/* Assignment line */}
      <div className="flex items-center gap-2 text-[10px]">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-10" />
      </div>
      {/* CTA button */}
      <div className="mt-1">
        <Skeleton className="h-8 w-28 rounded" />
      </div>
    </div>
  );
}
