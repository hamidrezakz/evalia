"use client";
import * as React from "react";

export function ResultsCount({ count }: { count: number }) {
  return (
    <div className="px-2 pt-2 text-xs text-muted-foreground">
      {count.toLocaleString("fa-IR")} نتیجه
    </div>
  );
}
