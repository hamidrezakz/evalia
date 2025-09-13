import React from "react";
import { AssessmentNav } from "./_components/assessment-nav";

export default function AssessmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <AssessmentNav />
      {children}
    </div>
  );
}
