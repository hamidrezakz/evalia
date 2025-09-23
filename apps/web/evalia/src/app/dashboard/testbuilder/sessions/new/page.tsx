"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { useOrgState } from "@/organizations/organization/context/org-context";
import { SessionUpsertDialog } from "@/assessment/components/sessions";
import { Plus } from "lucide-react";

export default function NewSessionPage() {
  const { activeOrganizationId } = useOrgState();
  const orgId = Number(activeOrganizationId || 0);
  const [open, setOpen] = React.useState(true); // open by default for quick add

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-semibold">افزودن جلسه</h1>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 ms-1" /> جلسه جدید
        </Button>
      </div>
      <SessionUpsertDialog
        open={open}
        onOpenChange={setOpen}
        defaultOrganizationId={orgId || null}
      />
    </div>
  );
}
