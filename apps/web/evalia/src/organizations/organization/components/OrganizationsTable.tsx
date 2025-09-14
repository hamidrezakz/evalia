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
import { OrganizationStatusBadge } from "./OrganizationStatusBadge";
import {
  OrganizationRowActions,
  OrganizationRowActionsProps,
} from "./OrganizationRowActions";
import { cn } from "@/lib/utils";

export interface OrganizationsTableProps {
  rows: Organization[];
  className?: string;
  rowActions?: (org: Organization) => OrganizationRowActionsProps | null;
  onRowClick?: (org: Organization) => void;
}

export function OrganizationsTable({
  rows,
  className,
  rowActions,
  onRowClick,
}: OrganizationsTableProps) {
  return (
    <div className={cn("w-full", className)}>
      <Table className="border-separate border-spacing-y-2">
        <TableHeader className="hidden md:table-header-group">
          <TableRow className="text-sm text-muted-foreground">
            <TableHead className="px-2">نام</TableHead>
            <TableHead className="px-2">اسلاگ</TableHead>
            <TableHead className="px-2">وضعیت</TableHead>
            <TableHead className="px-2 hidden lg:table-cell">پلن</TableHead>
            <TableHead className="px-2 w-0 text-left">عملیات</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((o) => (
            <TableRow
              key={o.id}
              onClick={() => onRowClick?.(o)}
              className="bg-card hover:bg-accent cursor-pointer text-sm">
              <TableCell className="px-2 py-3">
                <div className="flex flex-col">
                  <span className="font-medium">{o.name}</span>
                  <span className="text-xs text-muted-foreground">#{o.id}</span>
                </div>
              </TableCell>

              <TableCell className="px-2 py-3 hidden md:table-cell">
                {o.slug}
              </TableCell>

              <TableCell className="px-2 py-3">
                <OrganizationStatusBadge status={o.status} />
              </TableCell>

              <TableCell className="px-2 py-3 hidden lg:table-cell">
                <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs">
                  {o.plan}
                </span>
              </TableCell>

              <TableCell className="px-2 py-3 text-left w-0">
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
