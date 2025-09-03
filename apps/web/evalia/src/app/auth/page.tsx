"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
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
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { friendlyError } from "./api/error-map";
import { User, Lock } from "lucide-react";

type AuthFormValues = {
  phone: string;
  password: string;
  otp: string;
  firstName: string;
  lastName: string;
};

function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const redirect = sp.get("redirect") || "/dashboard";

  const machine = useLoginMachine(() => router.replace(redirect));
  const { state } = machine;

  // react-hook-form setup (we still rely on the existing state machine to drive business logic)
  const form = useForm<AuthFormValues>({
    defaultValues: {
      phone: state.phone,
      password: state.password,
      otp: state.otp,
      firstName: state.firstName,
      lastName: state.lastName,
    },
    mode: "onChange",
  });

  // Sync external machine state into form when phase changes or values updated externally
  useEffect(() => {
    form.setValue("phone", state.phone);
  }, [state.phone, form]);
  useEffect(() => {
    form.setValue("password", state.password);
  }, [state.password, form]);
  useEffect(() => {
    form.setValue("otp", state.otp);
  }, [state.otp, form]);
  useEffect(() => {
    form.setValue("firstName", state.firstName);
  }, [state.firstName, form]);
  useEffect(() => {
    form.setValue("lastName", state.lastName);
  }, [state.lastName, form]);

  // Autofocus management
  const focusRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    focusRef.current?.focus();
  }, [state.phase]);

  const onSubmit = form.handleSubmit((values) => {
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
      case "COMPLETE_REGISTRATION":
        machine.finishRegistration();
        break;
      default:
        break;
    }
  });

  return (
    <div className="flex items-center justify-center min-h-screen p-4 relative overflow-hidden">
      {/* Centered glowing light source */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 w-[420px] h-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 blur-3xl bg-gradient-radial from-indigo-300 via-indigo-500/80 to-indigo-300/0 shadow-[0_0_120px_40px_#6366f1cc,0_0_320px_120px_#818cf855]"
        aria-hidden></div>
      <div className="z-10 flex justify-center items-center w-full">
        <Form {...form}>
          <form onSubmit={onSubmit} noValidate aria-labelledby="login-title">
            <Card className="w-full max-w-sm transition-all py-8">
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
                  <div>
                    <IdentifierForm
                      phone={state.phone}
                      loading={state.loading}
                      onChange={(v) => machine.set("phone", v)}
                    />
                  </div>
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
                        onChange={(e) =>
                          machine.set("firstName", e.target.value)
                        }
                        className="pr-8"
                      />
                    </div>
                    <div className="relative">
                      <User className="absolute right-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        placeholder="نام خانوادگی"
                        value={state.lastName}
                        onChange={(e) =>
                          machine.set("lastName", e.target.value)
                        }
                        className="pr-8"
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute right-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="رمز عبور"
                        value={state.password}
                        onChange={(e) =>
                          machine.set("password", e.target.value)
                        }
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
                    <span className="font-bold">ایوالیا</span>، شما تمامی{" "}
                    <span className="font-semibold">شرایط استفاده</span> و{" "}
                    <span className="font-semibold">حریم خصوصی</span> را به طور
                    کامل می‌پذیرید.
                  </p>
                </div>
              </CardFooter>
            </Card>
          </form>
        </Form>
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
