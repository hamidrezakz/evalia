"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Clock, RefreshCcw, Phone } from "lucide-react";

interface Props {
  phone: string;
  otp: string;
  loading?: boolean;
  devCode?: string | null;
  onOtpChange(v: string): void;
  onVerify(): void;
  onResend(): void;
}

export function OtpForm({
  phone,
  otp,
  loading,
  devCode,
  onOtpChange,
  onVerify,
  onResend,
}: Props) {
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    setSeconds(30); // reset when component mounts (new request occurred before mount)
  }, [phone]);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  const canResend = seconds <= 0 && !loading;

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
          value={otp}
          onChange={(e) => onOtpChange(e.target.value.replace(/[^0-9]/g, ""))}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          className="tracking-widest"
        />
      </div>
      <div className="flex gap-2">
        <Button
          disabled={loading || otp.length < 6}
          className="flex-1"
          onClick={onVerify}>
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
          className="flex items-center gap-1 min-w-[110px] justify-center text-[12px]">
          {canResend ? (
            <>
              <RefreshCcw className="size-4" />
              ارسال مجدد
            </>
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
