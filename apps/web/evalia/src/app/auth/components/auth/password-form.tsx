"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Lock } from "lucide-react";

interface Props {
  phone: string;
  password: string;
  loading?: boolean;
  onPasswordChange(v: string): void;
  onLogin(): void;
  onOtp(): void;
  onGoRegister(): void;
}

export function PasswordForm({
  phone,
  password,
  loading,
  onPasswordChange,
  onLogin,
  onOtp,
  onGoRegister,
}: Props) {
  return (
    <div className="space-y-2">
      <div className="relative">
        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input disabled value={phone} />
      </div>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="password"
          placeholder="رمز عبور"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          autoComplete="current-password"
        />
      </div>
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
