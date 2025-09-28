"use client";
import * as React from "react";
import { Panel, PanelHeader, PanelContent } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";

export function QuestionSkeleton({ index }: { index: number }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-10" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-md" />
        ))}
      </div>
    </div>
  );
}

export function TakeSkeleton({ questions = 6 }: { questions?: number }) {
  return (
    <div className="space-y-6" dir="rtl">
      <Panel className="shadow-sm w-full overflow-hidden">
        <PanelHeader className="gap-4 flex flex-col xl:flex-row xl:items-start">
          <div className="flex flex-col gap-4 w-full">
            <div className="flex items-center gap-2 flex-wrap">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="flex flex-wrap gap-4 text-[11px]">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end w-full sm:w-auto">
            <Skeleton className="h-10 w-44" />
            <Skeleton className="h-10 w-40" />
          </div>
        </PanelHeader>
        <PanelContent className="pt-3 mb-3 w-full overflow-visible">
          <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </PanelContent>
      </Panel>
      <div className="max-w-2xl space-y-10">
        {Array.from({ length: questions }).map((_, i) => (
          <QuestionSkeleton key={i} index={i} />
        ))}
      </div>
    </div>
  );
}

export default TakeSkeleton;
