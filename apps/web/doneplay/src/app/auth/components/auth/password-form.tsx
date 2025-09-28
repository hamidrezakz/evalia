"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Lock, KeyRound } from "lucide-react";

interface Props {
  phone: string;
  password: string;
  loading?: boolean;
  onPasswordChange(v: string): void;
  onOtp(): void;
  onGoRegister(): void;
}

export function PasswordForm({
  phone,
  password,
  loading,
  onPasswordChange,
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
          autoFocus
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          autoComplete="current-password"
        />
      </div>
      <div className="flex gap-2">
        <Button
          disabled={loading || !password || password.length < 6}
          isLoading={!!loading}
          className="flex-1"
          type="submit"
          icon={<KeyRound className="size-4" />}
          iconPosition="right">
          ورود
        </Button>
        <Button
          variant="outline"
          type="button"
          onClick={onOtp}
          className="min-w-[100px]"
          icon={<KeyRound className="size-4" />}
          iconPosition="right">
          <span className="text-[12px] mt-0.5"> ورود با کد</span>
        </Button>
      </div>
      <Button
        variant="ghost"
        className="w-full text-[12px]"
        onClick={onGoRegister}>
        ثبت‌نام جدید
      </Button>
    </div>
  );
}
