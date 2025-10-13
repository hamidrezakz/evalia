"use client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  MoreVertical,
  Copy,
  Lock,
  Archive,
  Pencil,
  PlayCircle,
  Search,
  Hash,
  CalendarClock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelAction,
  PanelContent,
} from "@/components/ui/panel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { TemplateStateBadge } from "@/components/status-badges";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAvatarImage } from "@/users/api/useAvatarImage";
import { useOrganization } from "@/organizations/organization/api/organization-hooks";
import { parseJalali, formatJalali } from "@/lib/jalali-date";
import TemplateInfoCard from "./TemplateInfoCard";
import TemplateUpsertDialog from "./TemplateUpsertDialog";
import TemplateActionsMenu from "./TemplateActionsMenu";
// import { cn } from "@/lib/utils";
import {
  useTemplates,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
  templatesKeys,
} from "@/assessment/api/templates-hooks";
import { useOrgState } from "@/organizations/organization/context/org-context";
import TemplateCombobox from "./TemplateCombobox";
import type {
  Template,
  TemplateState,
} from "@/assessment/types/templates.types";

// State labels handled by global TemplateStateBadge

export type TemplateManagerProps = {
  onSelect?: (t: Template | null) => void;
};

export default function TemplateManager({ onSelect }: TemplateManagerProps) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Template | null>(null);
  const [dialogOpen, setDialogOpen] = useState<
    null | { mode: "create" } | { mode: "edit"; tpl: Template }
  >(null);

  const { activeOrganizationId } = useOrgState();
  const { data, isLoading } = useTemplates(activeOrganizationId, { search });
  const createMut = useCreateTemplate(activeOrganizationId);
  const updateMut = useUpdateTemplate(activeOrganizationId);
  const deleteMut = useDeleteTemplate(activeOrganizationId);
  const orgQ = useOrganization(activeOrganizationId || null);
  // Build the exact list query key to update cache precisely on local mutations
  const listQueryKey = activeOrganizationId
    ? [...templatesKeys.list({ search }), activeOrganizationId]
    : ("templates:list:disabled" as any);

  const list: Template[] = (data as any)?.data || [];
  const { register, handleSubmit, reset } = useForm<{
    name: string;
    description?: string;
  }>();

  const openCreate = () => {
    reset({ name: "", description: "" });
    setDialogOpen({ mode: "create" });
  };
  const openEdit = (tpl: Template) => {
    reset({ name: tpl.name, description: tpl.description ?? "" });
    setDialogOpen({ mode: "edit", tpl });
  };

  const onSubmit = handleSubmit(async (vals) => {
    if (!dialogOpen) return;
    if (dialogOpen.mode === "create") {
      const created = await createMut.mutateAsync({
        name: vals.name,
        description: vals.description || undefined,
      });
      // Optimistically merge into current list cache (best-effort)
      try {
        qc.setQueriesData({ queryKey: ["templates", "list"] }, (old: any) => {
          if (!old || !Array.isArray(old?.data)) return old;
          if (old.data.some((t: Template) => t.id === created.id)) return old;
          return { ...old, data: [created, ...old.data] };
        });
      } catch {}
      setSelected(created);
      onSelect?.(created);
    } else {
      await updateMut.mutateAsync({
        id: dialogOpen.tpl.id,
        body: { name: vals.name, description: vals.description || null },
      });
    }
    setDialogOpen(null);
  });

  // Resolve owner organization visuals
  const orgName = ((orgQ.data as any)?.name as string) || "سازمان";
  const orgInitials = orgName.slice(0, 2);
  const orgAvatarRaw: string | null =
    ((orgQ.data as any)?.avatarUrl as string) || null;
  const { src: orgAvatarSrc } = useAvatarImage(orgAvatarRaw);
  const onDelete = async (tpl: Template) => {
    // Optimistically clear selection and cancel/remove related queries to avoid stale fetches
    if (selected?.id === tpl.id) {
      setSelected(null);
      onSelect?.(null);
      try {
        await qc.cancelQueries({ queryKey: templatesKeys.sections(tpl.id) });
        await qc.cancelQueries({ queryKey: templatesKeys.full(tpl.id) });
        await qc.cancelQueries({ queryKey: templatesKeys.byId(tpl.id) });
      } catch {}
      try {
        qc.removeQueries({ queryKey: templatesKeys.sections(tpl.id) });
        qc.removeQueries({ queryKey: templatesKeys.full(tpl.id) });
        qc.removeQueries({ queryKey: templatesKeys.byId(tpl.id) });
      } catch {}
    }
    await deleteMut.mutateAsync(tpl.id);
  };

  return (
    <>
      <Panel>
        <PanelHeader className="flex-row items-center justify-between gap-2">
          <PanelTitle className="text-sm flex items-center gap-2 font-semibold">
            قالب‌های آزمون
          </PanelTitle>
          <PanelAction>
            <Button
              size="sm"
              onClick={openCreate}
              isLoading={createMut.isPending}
              icon={<Plus className="h-4 w-4" />}
              iconPosition="left">
              جدید
            </Button>
          </PanelAction>
        </PanelHeader>
        <PanelContent className="flex-col gap-3">
          <div className="flex flex-col gap-2">
            <TemplateCombobox
              items={list}
              value={selected?.id ?? null}
              onChange={(tpl) => {
                setSelected(tpl);
                onSelect?.(tpl);
              }}
              disabled={isLoading}
              loading={isLoading}
              placeholder={isLoading ? "در حال بارگذاری..." : "انتخاب قالب"}
            />
            {selected && (
              <TemplateInfoCard
                template={selected}
                orgName={orgName}
                orgAvatarSrc={orgAvatarSrc}
                orgInitials={orgInitials}
                orgPlan={(orgQ.data as any)?.plan || null}
                orgStatus={(orgQ.data as any)?.status || null}
                onEdit={() => openEdit(selected)}
                onChangeState={(state) => {
                  const prev = selected;
                  // Optimistic UI update
                  setSelected((p) => (p ? { ...p, state } : p));
                  try {
                    if (
                      Array.isArray(
                        (qc.getQueryData(listQueryKey) as any)?.data
                      )
                    ) {
                      qc.setQueryData(listQueryKey, (old: any) => {
                        const mapped = old.data.map((it: Template) =>
                          it.id === selected.id ? { ...it, state } : it
                        );
                        return { ...old, data: mapped };
                      });
                    }
                  } catch {}

                  updateMut.mutate(
                    { id: selected.id, body: { state } },
                    {
                      onError: () => {
                        // Rollback if server update fails
                        setSelected(prev || null);
                        try {
                          if (
                            Array.isArray(
                              (qc.getQueryData(listQueryKey) as any)?.data
                            ) &&
                            prev
                          ) {
                            qc.setQueryData(listQueryKey, (old: any) => {
                              const mapped = old.data.map((it: Template) =>
                                it.id === prev.id
                                  ? { ...it, state: prev.state }
                                  : it
                              );
                              return { ...old, data: mapped };
                            });
                          }
                        } catch {}
                      },
                      onSuccess: (t) => {
                        // Ensure local matches server in case of drift
                        setSelected((p) =>
                          p && p.id === t.id ? { ...p, state: t.state } : p
                        );
                        try {
                          if (
                            Array.isArray(
                              (qc.getQueryData(listQueryKey) as any)?.data
                            )
                          ) {
                            qc.setQueryData(listQueryKey, (old: any) => {
                              const mapped = old.data.map((it: Template) =>
                                it.id === t.id ? { ...it, state: t.state } : it
                              );
                              return { ...old, data: mapped };
                            });
                          }
                        } catch {}
                      },
                    }
                  );
                }}
                onDelete={() => selected && onDelete(selected)}
                isDeleting={deleteMut.isPending}
              />
            )}
          </div>
        </PanelContent>
      </Panel>

      <TemplateUpsertDialog
        open={!!dialogOpen}
        mode={dialogOpen?.mode === "edit" ? "edit" : "create"}
        initial={
          dialogOpen?.mode === "edit"
            ? {
                name: dialogOpen.tpl.name,
                description: dialogOpen.tpl.description || "",
              }
            : { name: "", description: "" }
        }
        isSubmitting={createMut.isPending || updateMut.isPending}
        onClose={() => setDialogOpen(null)}
        onSubmit={async (vals) => {
          if (!dialogOpen) return;
          if (dialogOpen.mode === "create") {
            const created = await createMut.mutateAsync({
              name: vals.name,
              description: vals.description || undefined,
            });
            try {
              qc.setQueriesData(
                { queryKey: ["templates", "list"] },
                (old: any) => {
                  if (!old || !Array.isArray(old?.data)) return old;
                  if (old.data.some((t: Template) => t.id === created.id))
                    return old;
                  return { ...old, data: [created, ...old.data] };
                }
              );
            } catch {}
            setSelected(created);
            onSelect?.(created);
          } else {
            await updateMut.mutateAsync({
              id: dialogOpen.tpl.id,
              body: { name: vals.name, description: vals.description || null },
            });
          }
          setDialogOpen(null);
        }}
      />
    </>
  );
}
