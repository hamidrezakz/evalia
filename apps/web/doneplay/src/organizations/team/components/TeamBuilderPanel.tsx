"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelDescription,
  PanelContent,
} from "@/components/ui/panel";
import { Users, UserPlus, Plus, Trash2 } from "lucide-react";
import { useUsers } from "@/users/api/users-hooks";
import { useTeams, useCreateTeam } from "@/organizations/team/api/team-hooks";
import {
  useTeamMembers,
  useAddTeamMember,
  useRemoveTeamMember,
} from "@/organizations/member/api/team-membership-hooks";

type CreateTeamVals = { name: string; slug?: string; description?: string };

function MembersSection({ orgId, teamId }: { orgId: number; teamId: number }) {
  const [userSearch, setUserSearch] = React.useState("");
  const { data: usersData, isLoading: usersLoading } = useUsers({
    orgId,
    q: userSearch,
    pageSize: 50,
  } as any);
  const users = (usersData?.data as any[]) || [];

  const membersQuery = useTeamMembers(orgId, teamId, { pageSize: 100 });
  const members = membersQuery.data || [];

  const addMemberMut = useAddTeamMember(orgId, teamId);
  const removeMemberMut = useRemoveTeamMember(orgId, teamId);

  const addMember = async (userId: number | null) => {
    if (!userId) return;
    await addMemberMut.mutateAsync({ userId } as any);
  };
  const removeMember = async (membershipId: number) => {
    await removeMemberMut.mutateAsync(membershipId);
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label>افزودن عضو از سازمان</Label>
        <Combobox<any>
          items={users}
          value={null}
          onChange={(v) => addMember((v as number) ?? null)}
          searchable
          searchValue={userSearch}
          onSearchChange={setUserSearch}
          getKey={(u) => u.id}
          getLabel={(u) => u.fullName || u.name || u.email || String(u.id)}
          leadingIcon={UserPlus}
          loading={usersLoading}
          placeholder={
            usersLoading ? "در حال بارگذاری..." : "انتخاب کاربر برای اضافه شدن"
          }
        />
      </div>
      <div className="space-y-2">
        <Label>اعضای تیم</Label>
        <div className="flex flex-col gap-2">
          {membersQuery.isLoading && (
            <div className="text-sm text-muted-foreground">
              در حال بارگذاری...
            </div>
          )}
          {!membersQuery.isLoading && members.length === 0 && (
            <div className="text-sm text-muted-foreground">عضوی وجود ندارد</div>
          )}
          {members.map((m: any) => {
            const label = m.user?.fullName || m.user?.email || `#${m.userId}`;
            return (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-md border p-2">
                <div className="text-sm">{label}</div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeMember(m.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function TeamBuilderPanel({
  organizationId,
}: {
  organizationId: number;
}) {
  const [teamSearch, setTeamSearch] = React.useState("");
  const teamsQ = useTeams(organizationId, { q: teamSearch, pageSize: 50 });
  const teams = teamsQ.data || [];
  const [selectedTeamId, setSelectedTeamId] = React.useState<number | null>(
    null
  );

  React.useEffect(() => {
    if (!selectedTeamId && teams.length > 0) setSelectedTeamId(teams[0].id);
  }, [teams, selectedTeamId]);

  const createTeamMut = useCreateTeam(organizationId);
  const { register, handleSubmit, reset } = useForm<CreateTeamVals>({
    defaultValues: { name: "" },
  });
  const onCreateTeam = handleSubmit(async (vals) => {
    const created = await createTeamMut.mutateAsync({
      name: vals.name,
      slug: vals.slug || undefined,
      description: vals.description || undefined,
    } as any);
    reset({ name: "", slug: "", description: "" });
    if (created && typeof (created as any).id === "number")
      setSelectedTeamId((created as any).id);
  });

  return (
    <Panel>
      <PanelHeader className="flex-row items-center justify-between">
        <div>
          <PanelTitle className="text-base">تشکیل و مدیریت تیم‌ها</PanelTitle>
          <PanelDescription>
            یک تیم بسازید یا انتخاب کنید، اعضا را از سازمان اضافه و مدیریت کنید.
          </PanelDescription>
        </div>
      </PanelHeader>
      <PanelContent className="flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>انتخاب تیم</Label>
            <Combobox<any>
              items={teams}
              value={selectedTeamId}
              onChange={(v) => setSelectedTeamId((v as number) ?? null)}
              searchable
              searchValue={teamSearch}
              onSearchChange={setTeamSearch}
              getKey={(t) => t.id}
              getLabel={(t) => t.name}
              leadingIcon={Users}
              loading={teamsQ.isLoading}
              placeholder={
                teamsQ.isLoading ? "در حال بارگذاری..." : "انتخاب یا ساخت تیم"
              }
            />
          </div>
          <form
            onSubmit={onCreateTeam}
            className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <div className="space-y-2">
              <Label>نام تیم جدید</Label>
              <Input
                {...register("name", { required: true })}
                placeholder="مثلاً تیم توسعه"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input {...register("slug")} placeholder="team-dev" />
            </div>
            <div className="space-y-2">
              <Label>توضیح</Label>
              <Input {...register("description")} placeholder="اختیاری" />
            </div>
            <div className="col-span-full">
              <Button
                type="submit"
                size="sm"
                disabled={createTeamMut.isPending}>
                <Plus className="h-4 w-4 ms-1" /> ساخت تیم
              </Button>
            </div>
          </form>
        </div>

        {selectedTeamId ? (
          <MembersSection orgId={organizationId} teamId={selectedTeamId} />
        ) : (
          <div className="text-sm text-muted-foreground">
            ابتدا یک تیم انتخاب یا ایجاد کنید.
          </div>
        )}
      </PanelContent>
    </Panel>
  );
}
