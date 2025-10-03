"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { useOrganization } from "../../api/organization-hooks";
import { useDeleteTeam } from "@/organizations/team/api/team-hooks";
import { useTeamMembers } from "@/organizations/team/api/team-members-hooks";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Loader2,
  UsersRound,
  PlusCircle,
  Pencil,
  Check,
  ChevronDown,
  UserPlus,
  Users,
  Phone,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useUsersByIds } from "@/users/api/users-hooks";
import { Button } from "@/components/ui/button";
import { UserStatusBadge } from "@/components/status-badges/UserStatusBadge";
import { formatIranPhone } from "@/lib/utils";
import { XCircle } from "lucide-react";
import { useRemoveTeamMember } from "@/organizations/team/api/team-members-hooks";
import RemoveTeamMemberDialog from "@/organizations/team/components/RemoveTeamMemberDialog";
import AddTeamDialog from "../add-team-dialog";
import AddTeamMembersDialog from "../add-team-members-dialog";
import { orgKeys } from "@/organizations/organization/api/organization-query-keys";
import { useQueryClient } from "@tanstack/react-query";

function resolveAvatarUrl(urlOrPath: string | null | undefined) {
  if (!urlOrPath) return null as string | null;
  try {
    const cdn = (process.env.NEXT_PUBLIC_CDN_BASE || "").replace(/\/$/, "");
    const api = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/$/, "");
    if (/^https?:\/\//i.test(urlOrPath)) {
      try {
        const u = new URL(urlOrPath);
        if (u.pathname.startsWith("/avatars/") && cdn) {
          return cdn + u.pathname + (u.search || "");
        }
      } catch {}
      return urlOrPath;
    }
    if (urlOrPath.startsWith("/avatars/")) {
      if (cdn) return cdn + urlOrPath;
      return urlOrPath;
    }
    if (urlOrPath.startsWith("/")) {
      return api ? api + urlOrPath : urlOrPath;
    }
    return urlOrPath;
  } catch {
    return urlOrPath || null;
  }
}

interface TeamsDropdownProps {
  orgId: number;
  count?: number;
}

export function TeamsDropdown({ orgId, count }: TeamsDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const { data, isLoading } = useOrganization(orgId, open);
  const [addOpen, setAddOpen] = React.useState(false);
  const [addMembersOpen, setAddMembersOpen] = React.useState(false);
  const [expandedTeamId, setExpandedTeamId] = React.useState<number | null>(
    null
  );
  const [membersTeamId, setMembersTeamId] = React.useState<number | null>(null);
  const qc = useQueryClient();
  const [editMode, setEditMode] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<number | null>(null);
  const deleteTeamMut = useDeleteTeam(orgId);

  function handleDelete(teamId: number) {
    setDeletingId(teamId);
    deleteTeamMut.mutate(teamId, {
      onSettled: () => setDeletingId(null),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: orgKeys.byId(orgId) });
      },
    });
  }

  const { data: members } = useTeamMembers(
    orgId,
    membersTeamId,
    !!membersTeamId
  );

  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={(e) => e.stopPropagation()}
      className="relative">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "h-6 pl-2 pr-1 gap-1 text-[11px] font-medium bg-muted/60 hover:bg-muted/80 border-muted-foreground/20 inline-flex items-center",
              open && "ring-1 ring-primary/30"
            )}>
            <UsersRound className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="tabular-nums">{count != null ? count : "—"}</span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-muted-foreground/70 transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="center"
          className="w-[18rem] max-w-[92vw] mr-2 sm:w-72"
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
            <ScrollArea className="max-h-72">
              <div className="p-1 space-y-1">
                {data.teams.map((t: any) => {
                  const isExpanded = expandedTeamId === t.id;
                  const showMembers =
                    isExpanded && membersTeamId === t.id && members;
                  return (
                    <div
                      key={t.id}
                      className="rounded-md border border-transparent hover:border-accent/50 transition-colors">
                      <div
                        className={cn(
                          "flex items-center gap-2 rounded-md px-2 py-1 text-xs hover:bg-accent hover:text-accent-foreground justify-between",
                          isExpanded && "bg-accent/60"
                        )}>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (isExpanded) {
                              setExpandedTeamId(null);
                              setMembersTeamId(null);
                            } else {
                              setExpandedTeamId(t.id);
                              setMembersTeamId(t.id);
                            }
                          }}
                          className={cn(
                            "h-6 px-1 flex-1 justify-end gap-1 text-[11px] font-medium rounded-md transition-colors",
                            isExpanded && "bg-accent/60"
                          )}>
                          <Users className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="truncate" title={t.name}>
                            {t.name}
                          </span>
                        </Button>
                        {typeof t.membersCount === "number" && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isExpanded) {
                                setExpandedTeamId(t.id);
                                setMembersTeamId(t.id);
                              } else {
                                setExpandedTeamId(null);
                                setMembersTeamId(null);
                              }
                            }}
                            className={cn(
                              "h-6 px-1.5 gap-1 text-[10px] font-medium bg-muted/70 hover:bg-muted rounded-md",
                              isExpanded && "ring-1 ring-primary/30"
                            )}
                            aria-label="Toggle members">
                            <ChevronDown
                              className={cn(
                                "h-3 w-3 transition-transform",
                                isExpanded && "rotate-180"
                              )}
                            />
                            {t.membersCount}
                          </Button>
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
                      {showMembers && members && (
                        <div className="mt-0.5 mb-1 rounded-md border border-accent/30 bg-accent/10 shadow-inner">
                          <TeamMembersList
                            members={members}
                            orgId={orgId}
                            teamId={t.id}
                            onAdd={() => {
                              setMembersTeamId(t.id);
                              setAddMembersOpen(true);
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
                <div className="pt-1 mt-1 border-t border-border/40 space-y-0.5" dir="rtl">
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
                </div>
              </div>
            </ScrollArea>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      <AddTeamDialog orgId={orgId} open={addOpen} onOpenChange={setAddOpen} />
      <AddTeamMembersDialog
        orgId={orgId}
        teamId={membersTeamId}
        open={addMembersOpen}
        onOpenChange={setAddMembersOpen}
      />
    </div>
  );
}

interface TeamMembersListProps {
  members: any[];
  onAdd: () => void;
  orgId: number;
  teamId: number;
}

function TeamMembersList({
  members,
  onAdd,
  orgId,
  teamId,
}: TeamMembersListProps) {
  const userIds = React.useMemo(() => members.map((m) => m.userId), [members]);
  const { users: userMap, loadingIds } = useUsersByIds(userIds);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [targetMember, setTargetMember] = React.useState<{
    id: number;
    name?: string;
  } | null>(null);
  const removeMut = useRemoveTeamMember(orgId, teamId);
  function confirmRemove(mId: number, name?: string) {
    setTargetMember({ id: mId, name });
    setDialogOpen(true);
  }
  return (
    <div
      className="px-1 pb-2 pt-1 text-[10px] space-y-1 animate-in fade-in-0"
      dir="rtl">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onAdd}
        className="w-full h-7 justify-start gap-1 text-[11px] font-medium border border-dashed border-transparent hover:border-accent/50">
        <UserPlus className="h-3.5 w-3.5" /> افزودن عضو جدید
      </Button>
      <div className="h-px bg-border/60" />
      {members.length === 0 && (
        <div className="text-muted-foreground px-2 py-1">عضوی ثبت نشده</div>
      )}
      {members.map((m) => {
        const user = userMap[m.userId];
        const fullName =
          user?.fullName || m.fullName || m.email || m.phone || "—";
        const phone = (user as any)?.phone || (m as any)?.phone || null;
        const email = user?.email || m.email || null;
        const rawAvatar =
          (user as any)?.avatarUrl ||
          (user as any)?.avatar ||
          (m as any)?.avatarUrl ||
          (m as any)?.avatar ||
          null;
        const resolved = resolveAvatarUrl(rawAvatar);
        const initials =
          (fullName || email || phone || "?")
            .split(" ")
            .map((w: string) => w[0])
            .filter(Boolean)
            .slice(0, 2)
            .join("") || "?";
        const isLoadingUser = loadingIds.includes(m.userId) && !user;
        return (
          <div
            key={m.id}
            className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-muted/50 group transition-colors text-right flex-wrap xs:flex-nowrap leading-snug">
            <Avatar className="h-6 w-6 ring-1 ring-border/40 overflow-hidden">
              {resolved && !isLoadingUser ? (
                <AvatarImage
                  src={resolved}
                  alt={fullName}
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback className="text-[9px] bg-muted">
                {isLoadingUser ? (
                  <span className="inline-block h-2 w-4 rounded bg-muted-foreground/20 animate-pulse" />
                ) : (
                  initials
                )}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 leading-tight flex-1 gap-0.5">
              <div className="flex items-center gap-1 min-w-0">
                <span
                  className="truncate text-[10px] font-medium"
                  title={fullName}>
                  {isLoadingUser ? (
                    <span className="inline-block h-2.5 w-16 rounded bg-muted-foreground/20 animate-pulse" />
                  ) : (
                    fullName
                  )}
                </span>
                {!isLoadingUser && user?.status && (
                  <UserStatusBadge
                    status={user.status as any}
                    size="xs"
                    tone="soft"
                    className="shrink-0 text-[9px] align-middle ltr:ml-1 rtl:mr-1"
                  />
                )}
              </div>
              {isLoadingUser ? (
                <span className="inline-flex items-center gap-1 mt-0.5">
                  <span className="h-2 w-24 rounded bg-muted-foreground/15 animate-pulse" />
                </span>
              ) : (
                (phone || email) && (
                  <span className="truncate text-[9px] text-muted-foreground inline-flex items-center gap-1">
                    {phone && (
                      <span className="inline-flex items-center gap-1 rounded bg-muted/60 px-1.5 py-0.5 ltr:font-mono">
                        <Phone className="h-2 w-2 text-muted-foreground" />
                        {formatIranPhone(String(phone))}
                      </span>
                    )}
                    {!phone && email && (
                      <span className="inline-flex items-center gap-1 rounded bg-muted/40 px-1.5 py-0.5 ltr:font-mono">
                        {email}
                      </span>
                    )}
                  </span>
                )
              )}
            </div>
            <button
              type="button"
              onClick={() => confirmRemove(m.id, fullName)}
              className="opacity-40 hover:opacity-90 transition-opacity p-1 rounded text-rose-600 hover:bg-rose-600/10"
              aria-label="حذف عضو">
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        );
      })}
      <RemoveTeamMemberDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        memberName={targetMember?.name}
        loading={removeMut.isPending}
        onConfirm={async () => {
          if (!targetMember) return;
          try {
            await removeMut.mutateAsync(targetMember.id);
          } finally {
            setDialogOpen(false);
            setTargetMember(null);
          }
        }}
      />
    </div>
  );
}

export default TeamsDropdown;
