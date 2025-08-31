"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone } from "lucide-react";

interface Props {
  phone: string;
  disabled?: boolean;
  loading?: boolean;
  onChange(v: string): void;
  onSubmit(): void;
}

export function IdentifierForm({
  phone,
  onChange,
  onSubmit,
  disabled,
  loading,
}: Props) {
  return (
    <div className="space-y-2">
      <div className="relative">
        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="شماره موبایل"
          value={phone}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9+]/g, ""))}
          disabled={disabled}
          autoComplete="tel"
          inputMode="tel"
          className=""
        />
      </div>
      <Button
        disabled={loading || !phone || phone.length < 11}
        className="w-full"
        onClick={onSubmit}>
        ادامه
      </Button>
    </div>
  );
}
