"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  identifier: string;
  otp: string;
  loading?: boolean;
  devCode?: string | null;
  onOtpChange(v: string): void;
  onVerify(): void;
  onResend(): void;
}

export function OtpForm({
  identifier,
  otp,
  loading,
  devCode,
  onOtpChange,
  onVerify,
  onResend,
}: Props) {
  return (
    <div className="space-y-2">
      <Input disabled value={identifier} dir="ltr" />
      <Input
        placeholder="کد تایید"
        value={otp}
        onChange={(e) => onOtpChange(e.target.value)}
        inputMode="numeric"
        autoComplete="one-time-code"
      />
      <div className="flex gap-2">
        <Button
          disabled={loading || otp.length < 4}
          className="flex-1"
          onClick={onVerify}>
          تایید و ورود
        </Button>
        <Button
          variant="secondary"
          type="button"
          disabled={loading}
          onClick={onResend}>
          ارسال مجدد
        </Button>
      </div>
      {devCode && (
        <div className="text-xs text-muted-foreground">dev: {devCode}</div>
      )}
    </div>
  );
}
