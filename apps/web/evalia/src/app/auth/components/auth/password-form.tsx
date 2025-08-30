"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  identifier: string;
  password: string;
  loading?: boolean;
  onPasswordChange(v: string): void;
  onLogin(): void;
  onOtp(): void;
  onGoRegister(): void;
}

export function PasswordForm({
  identifier,
  password,
  loading,
  onPasswordChange,
  onLogin,
  onOtp,
  onGoRegister,
}: Props) {
  return (
    <div className="space-y-2">
      <Input disabled value={identifier} dir="ltr" />
      <Input
        type="password"
        placeholder="رمز عبور"
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
        autoComplete="current-password"
      />
      <div className="flex gap-2">
        <Button
          disabled={loading || !password}
          className="flex-1"
          onClick={onLogin}>
          ورود
        </Button>
        <Button variant="secondary" type="button" onClick={onOtp}>
          ورود با کد
        </Button>
      </div>
      <Button variant="ghost" className="w-full" onClick={onGoRegister}>
        ثبت‌نام جدید
      </Button>
    </div>
  );
}
