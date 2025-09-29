"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, RefreshCcw, Phone, Lock, KeyRound } from "lucide-react";

interface Props {
  phone: string;
  code: string;
  password: string;
  loading?: boolean;
  devCode?: string | null;
  onCodeChange(v: string): void;
  onPasswordChange(v: string): void;
  onResend(): void;
  onSubmit(): void; // triggers resetPassword
}

export function OtpResetForm({
  phone,
  code,
  password,
  loading,
  devCode,
  onCodeChange,
  onPasswordChange,
  onResend,
  onSubmit,
}: Props) {
  const [seconds, setSeconds] = useState(30);
  useEffect(() => {
    setSeconds(30);
  }, [phone]);
  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [seconds]);
  const canResend = seconds <= 0 && !loading;

  const disabled = loading || code.length !== 6 || password.length < 6;

  return (
    <div className="space-y-2">
      <div className="relative">
        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input disabled value={phone} />
      </div>
      <div className="relative">
        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="کد تایید"
          value={code}
          autoFocus
          onChange={(e) => onCodeChange(e.target.value.replace(/[^0-9]/g, ""))}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          className="tracking-widest"
        />
      </div>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="password"
          placeholder="رمز جدید"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          autoComplete="new-password"
        />
      </div>
      <div className="flex gap-2">
        <Button
          disabled={disabled}
          isLoading={!!loading}
          className="flex-1"
          type="button"
          onClick={() => !disabled && onSubmit()}
          icon={<KeyRound className="size-4" />}
          iconPosition="right">
          تایید و ورود
        </Button>
        <Button
          variant="outline"
          type="button"
          disabled={!canResend}
          onClick={() => {
            if (!canResend) return;
            onResend();
            setSeconds(30);
          }}
          icon={<RefreshCcw className="size-4" />}
          className="min-w-[110px] text-[12px]">
          {canResend ? (
            <span>ارسال مجدد</span>
          ) : (
            <span className="tabular-nums mt-0.5">{seconds}s</span>
          )}
        </Button>
      </div>
      {devCode && (
        <div className="text-xs text-muted-foreground" dir="ltr">
          dev: {devCode}
        </div>
      )}
    </div>
  );
}
