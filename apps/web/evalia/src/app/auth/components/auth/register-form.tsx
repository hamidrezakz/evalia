"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  identifier: string;
  password: string;
  firstName: string;
  lastName: string;
  loading?: boolean;
  onPasswordChange(v: string): void;
  onFirstNameChange(v: string): void;
  onLastNameChange(v: string): void;
  onRegister(): void;
  onOtp(): void;
  onBack(): void;
}

export function RegisterForm({
  identifier,
  password,
  firstName,
  lastName,
  loading,
  onPasswordChange,
  onFirstNameChange,
  onLastNameChange,
  onRegister,
  onOtp,
  onBack,
}: Props) {
  return (
    <div className="space-y-2">
      <Input disabled value={identifier} dir="ltr" />
      <div className="flex gap-2">
        <Input
          placeholder="نام"
          value={firstName}
          onChange={(e) => onFirstNameChange(e.target.value)}
        />
        <Input
          placeholder="نام خانوادگی"
          value={lastName}
          onChange={(e) => onLastNameChange(e.target.value)}
        />
      </div>
      <Input
        type="password"
        placeholder="رمز عبور"
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
        autoComplete="new-password"
      />
      <div className="flex gap-2">
        <Button
          disabled={loading || password.length < 6}
          className="flex-1"
          onClick={onRegister}>
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
