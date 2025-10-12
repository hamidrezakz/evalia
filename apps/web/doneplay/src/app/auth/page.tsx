"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useMemo } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IdentifierForm } from "./components/auth/identifier-form";
import { PasswordForm } from "./components/auth/password-form";
import { OtpForm } from "./components/auth/otp-form";
import { OtpResetForm } from "./components/auth/otp-reset-form";
import { useLoginMachine } from "./hooks/useLoginMachine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { friendlyError } from "./api/error-map";
import {
  User,
  Lock,
  Command,
  Phone,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import {
  HeroBackground,
  RadialGlow,
  BlurBlob,
  FloatingSymbol,
} from "@/components/sections/hero-backgrounds";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { LoadingDots } from "@/components/ui/loading-dots";
// Notification preferences removed; success toasts are shown only when server sends message

function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const redirect = sp.get("redirect") || "/dashboard";
  const machine = useLoginMachine(() => router.replace(redirect));
  const { state } = machine;

  // Autofocus management
  const focusRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    focusRef.current?.focus();
  }, [state.phase]);

  // No page-level notification overrides: UI relies solely on server-provided messages

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    switch (state.phase) {
      case "IDENTIFIER":
        machine.submitIdentifier();
        break;
      case "PASSWORD":
        machine.doPasswordLogin();
        break;
      case "OTP":
        machine.verifyLoginOtp();
        break;
      case "OTP_RESET":
        machine.submitResetOtp();
        break;
      case "COMPLETE_REGISTRATION":
        machine.finishRegistration();
        break;
    }
  }

  // Dynamic action label/icon/styles based on current phase
  const phaseMeta = useMemo(() => {
    const base = {
      label: "ورود | ثبت‌نام",
      Icon: Command,
      classes:
        "border-slate-300 text-slate-700 bg-slate-50 dark:border-slate-600/60 dark:text-slate-300 dark:bg-slate-900/40",
    } as { label: string; Icon: React.ComponentType<any>; classes: string };
    switch (state.phase) {
      case "IDENTIFIER":
        return {
          label: "شماره موبایل",
          Icon: Phone,
          classes:
            "border-sky-300 text-sky-700 bg-sky-50 dark:border-sky-600/60 dark:text-sky-300 dark:bg-sky-950/30",
        };
      case "PASSWORD":
        return {
          label: "رمز عبور",
          Icon: Lock,
          classes:
            "border-indigo-300 text-indigo-700 bg-indigo-50 dark:border-indigo-600/60 dark:text-indigo-300 dark:bg-indigo-950/30",
        };
      case "OTP":
        return {
          label: "کد تایید (ثبت‌نام)",
          Icon: ShieldCheck,
          classes:
            "border-amber-300 text-amber-700 bg-amber-50 dark:border-amber-600/60 dark:text-amber-300 dark:bg-amber-950/30",
        };
      case "OTP_RESET":
        return {
          label: "کد + رمز جدید",
          Icon: ShieldCheck,
          classes:
            "border-rose-300 text-rose-700 bg-rose-50 dark:border-rose-600/60 dark:text-rose-300 dark:bg-rose-950/30",
        };
      case "COMPLETE_REGISTRATION":
        return {
          label: "تکمیل ثبت‌نام",
          Icon: UserPlus,
          classes:
            "border-emerald-300 text-emerald-700 bg-emerald-50 dark:border-emerald-600/60 dark:text-emerald-300 dark:bg-emerald-950/30",
        };
      default:
        return base;
    }
  }, [state.phase]);

  return (
    <div className="flex items-center min-h-[100svh] max-h-[100svh] p-4 relative overflow-hidden">
      {/* Unified decorative background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <HeroBackground variant="signal" showMasks={false} />
        {/* Auth specific center glow */}
        <RadialGlow className="opacity-40 md:opacity-60" />
        <BlurBlob
          className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96"
          colorClass="bg-primary/15"
          sizeClass="w-96 h-96"
        />
        <FloatingSymbol
          className="top-10 right-12 text-sm"
          animation="float-medium">
          ✦
        </FloatingSymbol>
        <FloatingSymbol
          className="bottom-14 left-16 text-base"
          animation="float-slow">
          ★
        </FloatingSymbol>
      </div>
      <div className="relative z-10 flex justify-center items-center w-full mt-[-8rem] sm:mt-[-8rem] md:mt-[-6rem] lg:mt-[-4rem] 2xl:mt-0">
        <form onSubmit={handleSubmit} noValidate aria-labelledby="login-title">
          <Card className="w-full max-w-sm bg-accent/65 transition-all py-8">
            <CardHeader className="space-y-3 justify-between flex items-top">
              <div className="flex items-center justify-center p-0 m-0 mt-[-0.8rem] gap-2">
                <Avatar className="size-12 rounded-sm">
                  <AvatarImage alt="DanPlay" />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <Command className="size-[18px]" />
                  </AvatarFallback>
                </Avatar>
                <div className="text-start space-y-1">
                  <div className="text-base font-bold leading-none">
                    دآن‌پلی
                  </div>
                  <div className="text-[9px] text-muted-foreground leading-snug">
                    doneplay{" "}
                  </div>
                </div>
              </div>
              <CardAction
                id="login-title"
                className={cn(
                  "text-end",
                  "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-medium",
                  phaseMeta.classes
                )}>
                {state.loading ? (
                  <LoadingDots className="scale-90" />
                ) : (
                  <phaseMeta.Icon className="size-3.5" />
                )}
                <span>{phaseMeta.label}</span>
              </CardAction>
            </CardHeader>
            <CardContent className="space-y-4">
              {state.error && (
                <div className="text-sm text-red-500" role="alert">
                  {friendlyError(state.error) || state.error}
                </div>
              )}

              {state.phase === "IDENTIFIER" && (
                <IdentifierForm
                  phone={state.phone}
                  loading={state.loading}
                  onChange={(v) => machine.set("phone", v)}
                />
              )}

              {state.phase === "PASSWORD" && (
                <PasswordForm
                  phone={state.phone}
                  password={state.password}
                  loading={state.loading}
                  onPasswordChange={(v) => machine.set("password", v)}
                  onOtp={machine.requestLoginOtp}
                  onGoRegister={() => machine.requestLoginOtp()}
                />
              )}

              {state.phase === "OTP" && (
                <OtpForm
                  phone={state.phone}
                  otp={state.otp}
                  loading={state.loading}
                  devCode={state.devCode}
                  onOtpChange={(v) => machine.set("otp", v)}
                  onResend={machine.requestLoginOtp}
                />
              )}

              {state.phase === "OTP_RESET" && (
                <OtpResetForm
                  phone={state.phone}
                  code={state.otp}
                  password={state.newPassword || state.password}
                  loading={state.loading}
                  devCode={state.devCode}
                  onCodeChange={(v) => machine.set("otp", v)}
                  onPasswordChange={(v) => machine.set("newPassword", v)}
                  onResend={machine.requestLoginOtp}
                  onSubmit={machine.submitResetOtp}
                />
              )}

              {state.phase === "COMPLETE_REGISTRATION" && (
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground text-center">
                    تکمیل ثبت‌نام — اطلاعات پروفایل را وارد کنید
                  </div>
                  <div className="relative">
                    <User className="absolute right-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      ref={
                        state.phase === "COMPLETE_REGISTRATION"
                          ? focusRef
                          : undefined
                      }
                      placeholder="نام"
                      value={state.firstName}
                      onChange={(e) => machine.set("firstName", e.target.value)}
                      className="pr-8"
                    />
                  </div>
                  <div className="relative">
                    <User className="absolute right-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      placeholder="نام خانوادگی"
                      value={state.lastName}
                      onChange={(e) => machine.set("lastName", e.target.value)}
                      className="pr-8"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute right-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="رمز عبور"
                      value={state.password}
                      onChange={(e) => machine.set("password", e.target.value)}
                      className="pr-8"
                    />
                  </div>
                  <Button
                    disabled={
                      state.loading ||
                      state.password.length < 6 ||
                      !state.firstName ||
                      !state.lastName
                    }
                    className="w-full"
                    type="submit">
                    ثبت نهایی
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="text-center text-xs text-muted-foreground justify-center">
              <div className="space-y-1">
                <p>
                  با ورود یا ثبت‌نام در{" "}
                  <span className="font-bold">دآن‌پلی</span>، شما تمامی{" "}
                  <span className="font-semibold">شرایط استفاده</span> و{" "}
                  <span className="font-semibold">حریم خصوصی</span> را به طور
                  کامل می‌پذیرید.
                </p>
              </div>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={null}>
      <LoginPage />
    </Suspense>
  );
}
