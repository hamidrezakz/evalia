"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Save, XCircle, FilePlus2, RefreshCw } from "lucide-react";

export interface BuilderActionsProps {
  isEditing: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  creating?: boolean;
  updating?: boolean;
  onCreate: () => void;
  onUpdate: () => void;
  onCancelEdit: () => void;
  onNew: () => void;
  onReset: () => void;
}

export function BuilderActions({
  isEditing,
  canCreate,
  canUpdate,
  creating,
  updating,
  onCreate,
  onUpdate,
  onCancelEdit,
  onNew,
  onReset,
}: BuilderActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
      {!isEditing && (
        <Button
          onClick={onCreate}
          disabled={!canCreate || !!creating}
          isLoading={!!creating}
          size="sm"
          icon={<PlusCircle className="size-4" />}
          iconPosition="left">
          ایجاد سؤال
        </Button>
      )}
      {isEditing && (
        <Button
          onClick={onUpdate}
          disabled={!canUpdate || !!updating}
          isLoading={!!updating}
          size="sm"
          icon={<Save className="size-4" />}>
          ذخیره تغییرات
        </Button>
      )}
      {isEditing && (
        <Button
          variant="ghost"
          size="sm"
          icon={<XCircle className="size-4" />}
          onClick={onCancelEdit}>
          لغو انتخاب
        </Button>
      )}
      {isEditing && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          icon={<FilePlus2 className="size-4" />}
          iconPosition="left"
          onClick={onNew}>
          سؤال جدید
        </Button>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        icon={<RefreshCw className="size-4" />}
        onClick={onReset}
        disabled={!!creating || !!updating}>
        ریست فرم
      </Button>
    </div>
  );
}

export default BuilderActions;
