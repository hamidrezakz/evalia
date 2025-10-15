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
import { Building2, Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAvatarImage } from "@/users/api/useAvatarImage";
import { uploadOrganizationAvatar } from "@/organizations/organization/api/organization-avatar.api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { orgKeys } from "@/organizations/organization/api/organization-query-keys";

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
  const qc = useQueryClient();

  function OrgAvatarUpload({ org }: { org: Organization }) {
    const fileRef = React.useRef<HTMLInputElement | null>(null);
    const rawAvatar: string | null = (org as any).avatarUrl || null;
    const { src: avatarSrc } = useAvatarImage(rawAvatar);
    const onClick = () => fileRef.current?.click();
    const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        toast.error("فقط فایل تصویری مجاز است.");
        return;
      }
      const MAX_AVATAR_BYTES = 100 * 1024;
      if (file.size > MAX_AVATAR_BYTES) {
        toast.error("حجم تصویر آواتار نباید بیشتر از ۱۰۰ کیلوبایت باشد.");
        return;
      }
      try {
        await uploadOrganizationAvatar(org.id, file);
        toast.success("آواتار سازمان با موفقیت به‌روزرسانی شد.");
        await qc.invalidateQueries({ queryKey: orgKeys.byId(org.id) });
        await qc.invalidateQueries({ queryKey: orgKeys.lists() });
      } catch (err: any) {
        toast.error(err?.message || "خطا در آپلود آواتار سازمان");
      }
    };
    return (
      <div className="relative">
        <Avatar
          className="h-10 w-10 md:h-9 md:w-9 rounded-xl border cursor-pointer hover:ring-2 hover:ring-primary/40"
          onClick={onClick}
          title="تغییر آواتار سازمان">
          {avatarSrc && (
            <AvatarImage src={avatarSrc || undefined} alt={org.name} />
          )}
          <AvatarFallback className="rounded-xl text-[10px]">
            {org.name?.substring(0, 2)?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <button
          type="button"
          onClick={onClick}
          className="absolute -bottom-1 -left-1 h-5 w-5 rounded-full bg-background/90 border border-border/60 shadow-sm flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50"
          title="آپلود آواتار">
          <Camera className="h-3.5 w-3.5" />
          <span className="sr-only">آپلود آواتار</span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onChange}
        />
      </div>
    );
  }
  return (
    <div className={cn("w-full", className)}>
      {/* Mobile / small screens: card list */}
      <ul className="space-y-4 md:hidden" dir="rtl">
        {rows.map((o) => {
          const membersCount: number | undefined = (o as any).membersCount;
          const teamsCount: number | undefined = (o as any).teamsCount;
          return (
            <li
              key={o.id}
              className="rounded-2xl border border-border/60 bg-gradient-to-br from-card/80 to-muted/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow px-4 pt-4 pb-3 focus-within:ring-2 ring-primary/40">
              <div className="flex items-start gap-4">
                <OrgAvatarUpload org={o} />
                <div className="flex flex-col flex-1 min-w-0 gap-1.5">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    {" "}
                    <span
                      className="text-[13px] font-semibold truncate max-w-[25ch] tracking-tight text-right"
                      title={o.name}>
                      {o.name}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground mt-0.5">
                    @{o.id}
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
              <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-4 text-[10px]">
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">وضعیت</span>
                  {/* Interactive status dropdown (mobile) */}
                  <div className="scale-95 origin-right" dir="rtl">
                    <StatusCell orgId={o.id} status={o.status as any} />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">پلن</span>
                  {/* Interactive plan dropdown (mobile) */}
                  <div className="scale-95 origin-right" dir="rtl">
                    <PlanCell orgId={o.id} plan={o.plan as any} />
                  </div>
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
              لایسنس{" "}
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
                  <div className="flex items-center gap-3 min-w-0">
                    <OrgAvatarUpload org={o} />
                    <div className="flex flex-col min-w-0">
                      <span
                        className="font-medium truncate max-w-[18ch]"
                        title={o.name}>
                        {o.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                   کد: {o.id}
                      </span>
                    </div>
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
