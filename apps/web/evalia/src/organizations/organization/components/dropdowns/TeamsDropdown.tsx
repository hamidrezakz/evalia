"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { useOrganization } from "../../api/organization-hooks";
import { useDeleteTeam } from "@/organizations/team/api/team-hooks";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, UsersRound, PlusCircle, Pencil, Check } from "lucide-react";
import AddTeamDialog from "../add-team-dialog";

interface TeamsDropdownProps {
  orgId: number;
  count?: number;
}

export function TeamsDropdown({ orgId, count }: TeamsDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const { data, isLoading } = useOrganization(orgId, open);
  const [addOpen, setAddOpen] = React.useState(false);
  const [editMode, setEditMode] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<number | null>(null);
  const deleteTeamMut = useDeleteTeam(orgId);

  function handleDelete(teamId: number) {
    setDeletingId(teamId);
    deleteTeamMut.mutate(teamId, {
      onSettled: () => setDeletingId(null),
    });
  }

  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={(e) => e.stopPropagation()}
      className="relative">
      <DropdownMenu open={open} onOpenChange={setOpen} dir="rtl">
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium hover:bg-muted/70 transition-colors",
              open && "ring-1 ring-primary/30"
            )}>
            <UsersRound className="h-3.5 w-3.5 text-muted-foreground" />
            {count != null ? count : "—"}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-60"
          onClick={(e) => e.stopPropagation()}>
          <DropdownMenuLabel className="flex items-center gap-1 text-xs">
            <UsersRound className="h-3.5 w-3.5" /> تیم‌های سازمان
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {isLoading && (
            <div className="flex items-center gap-2 p-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> در حال بارگذاری…
            </div>
          )}
          {!isLoading && (!data?.teams || data.teams.length === 0) && (
            <div className="p-2 text-xs text-muted-foreground">
              تیمی یافت نشد
            </div>
          )}
          {!isLoading && data?.teams?.length ? (
            <ScrollArea className="max-h-60">
              <div className="p-1 space-y-0.5">
                {data.teams.map((t: any) => (
                  <div
                    key={t.id}
                    className="group flex items-center gap-2 rounded-md px-2 py-1 text-xs hover:bg-accent hover:text-accent-foreground justify-between transition-colors">
                    <span className="flex-1 truncate text-right" title={t.name}>
                      {t.name}
                    </span>
                    {typeof t.membersCount === "number" && (
                      <span className="text-[10px] text-muted-foreground min-w-[1.25rem] text-left">
                        {t.membersCount}
                      </span>
                    )}
                    {editMode && (
                      <button
                        disabled={deletingId === t.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(t.id);
                        }}
                        className={cn(
                          "text-[10px] px-1 py-0.5 rounded border transition-colors",
                          deletingId === t.id
                            ? "border-rose-300 bg-rose-500 text-white"
                            : "border-rose-300 text-rose-600 hover:bg-rose-600 hover:text-white"
                        )}>
                        {deletingId === t.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          "حذف"
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : null}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-xs cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setEditMode((m) => !m);
            }}>
            {editMode ? (
              <>
                <Check className="h-3.5 w-3.5" /> اتمام ویرایش
              </>
            ) : (
              <>
                <Pencil className="h-3.5 w-3.5" /> ویرایش
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-xs cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setAddOpen(true);
            }}>
            <PlusCircle className="h-3.5 w-3.5" /> تیم جدید
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AddTeamDialog orgId={orgId} open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}

export default TeamsDropdown;
