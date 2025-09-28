"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, ArrowLeft } from "lucide-react";

interface Props {
  phone: string;
  disabled?: boolean; // external disable (rare)
  loading?: boolean; // show pending state
  onChange(v: string): void;
}

export function IdentifierForm({ phone, onChange, disabled, loading }: Props) {
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
          autoFocus
          className=""
        />
      </div>
      <Button
        disabled={disabled || loading || !phone || phone.length < 11}
        isLoading={!!loading}
        icon={<ArrowLeft className="size-4" />}
        iconPosition="right"
        className="w-full"
        type="submit">
        {loading ? "در حال بررسی..." : "ادامه"}
      </Button>
    </div>
  );
}
