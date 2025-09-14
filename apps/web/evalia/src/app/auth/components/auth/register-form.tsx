"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Lock, User } from "lucide-react";

interface Props {
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  loading?: boolean;
  onPasswordChange(v: string): void;
  onFirstNameChange(v: string): void;
  onLastNameChange(v: string): void;
  onOtp(): void;
  onBack(): void;
}

export function RegisterForm({
  phone,
  password,
  firstName,
  lastName,
  loading,
  onPasswordChange,
  onFirstNameChange,
  onLastNameChange,
  onOtp,
  onBack,
}: Props) {
  return (
    <div className="space-y-2">
      <div className="relative">
        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input disabled value={phone} />
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="نام"
            value={firstName}
            autoFocus
            onChange={(e) => onFirstNameChange(e.target.value)}
          />
        </div>
        <div className="relative flex-1">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="نام خانوادگی"
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
          />
        </div>
      </div>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="password"
          placeholder="رمز عبور"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          autoComplete="new-password"
        />
      </div>
      <div className="flex gap-2">
        <Button
          disabled={loading || password.length < 6}
          className="flex-1"
          type="submit">
          ثبت‌نام
        </Button>
        <Button variant="secondary" type="button" onClick={onOtp}>
          ورود با کد
        </Button>
      </div>
      <Button variant="ghost" className="w-full" onClick={onBack}>
        برگشت
      </Button>
    </div>
  );
}
