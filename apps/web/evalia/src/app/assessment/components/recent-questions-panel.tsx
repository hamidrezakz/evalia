"use client";
import React from "react";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelContent,
} from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuestions } from "../api/hooks";
import Link from "next/link";

interface RecentQuestionsPanelProps {
  limit?: number;
}

export const RecentQuestionsPanel: React.FC<RecentQuestionsPanelProps> = ({
  limit = 6,
}) => {
  const { data, isLoading } = useQuestions({ limit, sort: "createdAt:desc" });
  const items: any[] = (data as any)?.data || [];
  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>سوالات اخیر</PanelTitle>
      </PanelHeader>
      <PanelContent className="flex-col gap-3 text-xs">
        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: limit }).map((_, i) => (
              <Skeleton key={i} className="h-7" />
            ))}
          </div>
        )}
        {!isLoading && items.length === 0 && (
          <div className="text-[11px] text-muted-foreground">
            سوالی ثبت نشده است.
          </div>
        )}
        {!isLoading && items.length > 0 && (
          <ul className="space-y-1">
            {items.map((q) => (
              <li key={q.id} className="flex items-center gap-2">
                <span className="text-muted-foreground text-[10px] w-8">
                  #{q.id}
                </span>
                <span className="flex-1 truncate" title={q.text}>
                  {q.text}
                </span>
                <code className="px-1 rounded bg-muted text-[10px]">
                  {q.type}
                </code>
              </li>
            ))}
          </ul>
        )}
        <div className="pt-1">
          <Link
            href="/dashboard/assessment/builder"
            className="text-primary text-[11px] underline underline-offset-4">
            مشاهده همه
          </Link>
        </div>
      </PanelContent>
    </Panel>
  );
};
