"use client";
import { useState } from "react";
import {
  TemplateManager,
  TemplateSectionsPanel,
  AssignQuestionToSection,
} from "@/assessment/components/templates";
import type { Template } from "@/assessment/types/templates.types";

export default function TemplatesPage() {
  const [selected, setSelected] = useState<Template | null>(null);
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="lg:col-span-1 space-y-4">
        <TemplateManager onSelect={setSelected} />
      </div>
      <div className="lg:col-span-2 space-y-4">
        <TemplateSectionsPanel template={selected} />
        <AssignQuestionToSection template={selected} />
      </div>
    </div>
  );
}
