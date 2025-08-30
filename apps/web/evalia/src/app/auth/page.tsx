"use client";
import { useRouter, useSearchParams } from "next/navigation";
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
import { RegisterForm } from "./components/auth/register-form";
import { useLoginMachine } from "./hooks/useLoginMachine";

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const redirect = sp.get("redirect") || "/dashboard";

  const machine = useLoginMachine(() => router.replace(redirect));
  const { state } = machine;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card
        className="w-full max-w-[20rem]"
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
              {state.error}
            </div>
          )}
          {state.phase === "IDENTIFIER" && (
            <IdentifierForm
              identifier={state.identifier}
              loading={state.loading}
              onChange={(v) => machine.set("identifier", v)}
              onSubmit={machine.submitIdentifier}
            />
          )}
          {state.phase === "PASSWORD" && (
            <PasswordForm
              identifier={state.identifier}
              password={state.password}
              loading={state.loading}
              onPasswordChange={(v) => machine.set("password", v)}
              onLogin={machine.doPasswordLogin}
              onOtp={machine.requestLoginOtp}
              onGoRegister={() => machine.goToPhase("REGISTER")}
            />
          )}
          {state.phase === "OTP" && (
            <OtpForm
              identifier={state.identifier}
              otp={state.otp}
              loading={state.loading}
              devCode={state.devCode}
              onOtpChange={(v) => machine.set("otp", v)}
              onVerify={machine.verifyLoginOtp}
              onResend={machine.requestLoginOtp}
            />
          )}
          {state.phase === "REGISTER" && (
            <RegisterForm
              identifier={state.identifier}
              password={state.password}
              firstName={state.firstName}
              lastName={state.lastName}
              loading={state.loading}
              onPasswordChange={(v) => machine.set("password", v)}
              onFirstNameChange={(v) => machine.set("firstName", v)}
              onLastNameChange={(v) => machine.set("lastName", v)}
              onRegister={machine.doRegister}
              onOtp={machine.requestLoginOtp}
              onBack={() =>
                machine.goToPhase(state.exists ? "PASSWORD" : "IDENTIFIER")
              }
            />
          )}
        </CardContent>
        <CardFooter className="text-center text-xs text-muted-foreground justify-center">
          <div className="space-y-1">
            <p>با ورود، شرایط استفاده را می‌پذیرید.</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
