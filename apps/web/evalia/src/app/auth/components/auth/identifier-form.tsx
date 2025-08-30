"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  identifier: string;
  disabled?: boolean;
  loading?: boolean;
  onChange(v: string): void;
  onSubmit(): void;
}

export function IdentifierForm({
  identifier,
  onChange,
  onSubmit,
  disabled,
  loading,
}: Props) {
  return (
    <div className="space-y-2">
      <Input
        placeholder="ایمیل یا موبایل"
        value={identifier}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        autoComplete="username"
        inputMode="email"
      />
      <Button
        disabled={loading || !identifier}
        className="w-full"
        onClick={onSubmit}>
        ادامه
      </Button>
    </div>
  );
}
