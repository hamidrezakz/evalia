import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";

export type SessionsEmptyStateProps = {
  canCreateSession: boolean;
  onResetFilters: () => void;
  onCreateSession: () => void;
};

export function SessionsEmptyState({
  canCreateSession,
  onResetFilters,
  onCreateSession,
}: SessionsEmptyStateProps) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/60 p-10 text-center">
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Search className="h-4 w-4" />
        <span>جلسه‌ای یافت نشد</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onResetFilters}
          className="text-xs">
          ریست جستجو و فیلتر
        </Button>
        {canCreateSession && (
          <Button size="sm" onClick={onCreateSession} className="text-xs">
            افزودن جلسه
          </Button>
        )}
      </div>
    </div>
  );
}

export default SessionsEmptyState;
