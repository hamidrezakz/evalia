"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IdentifierForm } from "./components/auth/identifier-form";
import { PasswordForm } from "./components/auth/password-form";
import { OtpForm } from "./components/auth/otp-form";
import { useLoginMachine } from "./hooks/useLoginMachine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { friendlyError } from "./lib/error-map";
import { User, Lock } from "lucide-react";

function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const redirect = sp.get("redirect") || "/dashboard";

  const machine = useLoginMachine(() => router.replace(redirect));
  const { state } = machine;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card
        className="w-full max-w-md transition-all py-8"
        role="form"
        aria-labelledby="login-title">
        <CardHeader>
          <CardTitle id="login-title" className="text-center">
            ورود / ثبت‌نام
          </CardTitle>
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
              onSubmit={machine.submitIdentifier}
            />
          )}

          {state.phase === "PASSWORD" && (
            <PasswordForm
              phone={state.phone}
              password={state.password}
              loading={state.loading}
              onPasswordChange={(v) => machine.set("password", v)}
              onLogin={machine.doPasswordLogin}
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
              onVerify={machine.verifyLoginOtp}
              onResend={machine.requestLoginOtp}
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
                onClick={machine.finishRegistration}>
                ثبت نهایی
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="text-center text-xs text-muted-foreground justify-center">
          <div className="space-y-1">
            <p>
              با ورود یا ثبت‌نام در <span className="font-bold">ایوالیا</span>،
              شما تمامی <span className="font-semibold">شرایط استفاده</span> و{" "}
              <span className="font-semibold">حریم خصوصی</span> را به طور کامل
              می‌پذیرید.
            </p>
          </div>
        </CardFooter>
      </Card>
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
