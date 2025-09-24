import * as React from "react";
import type { Organization } from "../types/organization.types";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  OrganizationRowActions,
  OrganizationRowActionsProps,
} from "./OrganizationRowActions";
import { cn } from "@/lib/utils";
import MembersDropdown from "./dropdowns/MembersDropdown";
import TeamsDropdown from "./dropdowns/TeamsDropdown";
import PlanCell from "./dropdowns/PlanCell";
import StatusCell from "./dropdowns/StatusCell";

export interface OrganizationsTableProps {
  rows: Organization[];
  className?: string;
  rowActions?: (org: Organization) => OrganizationRowActionsProps | null;
}

export function OrganizationsTable({
  rows,
  className,
  rowActions,
}: OrganizationsTableProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Mobile / small screens: card list */}
      <ul className="space-y-3 md:hidden" dir="rtl">
        {rows.map((o) => {
          const membersCount: number | undefined = (o as any).membersCount;
          const teamsCount: number | undefined = (o as any).teamsCount;
          return (
            <li
              key={o.id}
              className="rounded-xl border bg-card/60 backdrop-blur-sm shadow-sm hover:shadow transition-shadow p-3 focus-within:ring-2 ring-primary/40">
              <div className="flex items-start gap-3">
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-right text-sm font-semibold truncate">
                    {o.name}
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">
                    #{o.id}
                  </span>
                </div>
                {rowActions
                  ? (() => {
                      const props = rowActions(o);
                      return props ? (
                        <OrganizationRowActions {...props} />
                      ) : null;
                    })()
                  : null}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">وضعیت</span>
                  <StatusCell orgId={o.id} status={o.status} />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">پلن</span>
                  <PlanCell orgId={o.id} plan={o.plan as any} />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">اعضا</span>
                  <MembersDropdown orgId={o.id} count={membersCount} />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">تیم‌ها</span>
                  <TeamsDropdown orgId={o.id} count={teamsCount} />
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Desktop table */}
      <Table className="hidden md:table w-full text-sm" dir="rtl">
        <TableHeader>
          <TableRow className="text-xs uppercase tracking-wide text-muted-foreground/80 border-b">
            <TableHead className="px-3 py-2 font-medium">نام</TableHead>
            <TableHead className="px-3 py-2 font-medium">وضعیت</TableHead>
            <TableHead className="px-3 py-2 font-medium">اعضا</TableHead>
            <TableHead className="px-3 py-2 font-medium">تیم‌ها</TableHead>
            <TableHead className="px-3 py-2 font-medium hidden lg:table-cell">
              پلن
            </TableHead>
            <TableHead className="px-3 py-2 font-medium w-0 text-left">
              عملیات
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="items-center">
          {rows.map((o, idx) => {
            const membersCount: number | undefined = (o as any).membersCount;
            const teamsCount: number | undefined = (o as any).teamsCount;
            return (
              <TableRow
                key={o.id}
                data-row-index={idx}
                className="group items-center hover:bg-accent/50 focus-visible:outline-none border-b last:border-b-0 transition-colors">
                <TableCell className="px-3 py-3 align-top">
                  <div className="flex flex-col min-w-0">
                    <span
                      className="font-medium truncate max-w-[18ch]"
                      title={o.name}>
                      {o.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      #{o.id}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-3 py-3 align-top">
                  <StatusCell orgId={o.id} status={o.status} />
                </TableCell>
                <TableCell className="px-3 py-3 align-top">
                  <MembersDropdown orgId={o.id} count={membersCount} />
                </TableCell>
                <TableCell className="px-3 py-3 align-top">
                  <TeamsDropdown orgId={o.id} count={teamsCount} />
                </TableCell>
                <TableCell className="px-3 py-3 align-top hidden lg:table-cell">
                  <PlanCell orgId={o.id} plan={o.plan as any} />
                </TableCell>
                <TableCell className="px-3 py-3 align-top text-left w-0">
                  {rowActions
                    ? (() => {
                        const props = rowActions(o);
                        return props ? (
                          <OrganizationRowActions {...props} />
                        ) : null;
                      })()
                    : null}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
