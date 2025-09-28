"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface Props {
  answeredCount: number;
  totalCount: number;
  pendingCount: number;
  saving: boolean;
  error: string | null;
  sessionState: string | null;
  onSave: () => void;
  className?: string;
  variant?: "floating" | "inline"; // visual tweaks if needed later
}

export const SaveResponsesPanel: React.FC<Props> = ({
  answeredCount,
  totalCount,
  pendingCount,
  saving,
  error,
  sessionState,
  onSave,
  className = "",
}) => {
  const disabled =
    saving || pendingCount === 0 || sessionState !== "IN_PROGRESS";
  return (
    <div
      className={
        "rounded-xl shadow-lg border border-border/60 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70 p-3 flex flex-col gap-2 min-w-[220px] " +
        className
      }>
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>ذخیره پاسخ‌ها</span>
        <span className="flex items-center gap-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">
            {answeredCount}/{totalCount}
          </span>
          {pendingCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-2 py-0.5 text-[10px] font-medium">
              تغییرات: {pendingCount}
            </span>
          )}
        </span>
      </div>
      <Button
        onClick={onSave}
        isLoading={saving}
        icon={<Save className="size-4" />}
        className="w-full"
        disabled={disabled}>
        {saving
          ? "در حال ذخیره…"
          : pendingCount === 0
          ? "چیزی برای ذخیره نیست"
          : "ذخیره"}
      </Button>
      {error && (
        <div className="text-[11px] text-rose-600 leading-relaxed">{error}</div>
      )}
    </div>
  );
};
