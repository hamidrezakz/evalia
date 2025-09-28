"use client";
import React, { useMemo } from "react";
import { Combobox } from "@/components/ui/combobox";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface RestrictedSubjectSelectorProps {
  allowedSubjectIds: string[] | undefined;
  value: string | null;
  onChange: (id: string | null) => void;
  disabled?: boolean;
  className?: string;
}

interface SubjectItem {
  id: string;
  label: string;
  phone?: string;
}

// Batch fetch helper (assumes an API that can accept multiple ids via query param ?ids=)
async function fetchSubjects(ids: string[]) {
  if (!ids.length) return [];
  // Attempt batch endpoint; fallback to sequential if not supported
  const param = ids.join(",");
  try {
    const res = await fetch(`/api/users?ids=${param}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.items)) {
        return data.items;
      }
    }
  } catch (_) {
    // ignore
  }
  // Fallback sequential
  return Promise.all(
    ids.map(async (id) => {
      try {
        const r = await fetch(`/api/users/${id}`);
        if (!r.ok) return null;
        return r.json();
      } catch (e) {
        return null;
      }
    })
  ).then((arr) => arr.filter(Boolean));
}

export function RestrictedSubjectSelector({
  allowedSubjectIds,
  value,
  onChange,
  disabled,
  className,
}: RestrictedSubjectSelectorProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["restricted-subjects", allowedSubjectIds?.join("-")],
    queryFn: () => (allowedSubjectIds ? fetchSubjects(allowedSubjectIds) : []),
    enabled: !!allowedSubjectIds && allowedSubjectIds.length > 0,
    staleTime: 60_000,
  });

  const items: SubjectItem[] = useMemo(
    () =>
      (data || []).map((u: any) => ({
        id: String(u.id),
        label: u.displayName || u.fullName || u.phone || "(بدون نام)",
        phone: u.phone,
      })),
    [data]
  );

  const selected = items.find((i) => i.id === value) || null;

  return (
    <Combobox<SubjectItem>
      items={items}
      value={value}
      onChange={(val) => onChange((val as string) ?? null)}
      placeholder={isLoading ? "در حال بارگذاری..." : "انتخاب پاسخ‌دهنده"}
      emptyText={
        allowedSubjectIds && allowedSubjectIds.length === 0
          ? "سوژه‌ مجاز وجود ندارد"
          : "موردی یافت نشد"
      }
      disabled={disabled || isLoading}
      className={cn("w-full", className)}
      getKey={(it) => it.id}
      getLabel={(it) => it.label}
      renderValue={({ item }) => item.label || "انتخاب پاسخ‌دهنده"}
      filter={(item, q) => {
        if (!q) return true;
        const s = q.toLowerCase();
        return (
          item.label.toLowerCase().includes(s) ||
          (item.phone
            ? item.phone.replace(/\s/g, "").includes(q.replace(/\s/g, ""))
            : false)
        );
      }}
    />
  );
}
