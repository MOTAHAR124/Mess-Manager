"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { ArrowRight, CheckCircle, Lock, ShieldCheck } from "lucide-react";
import { resetPassword } from "@/lib/next-api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = useMemo(() => params.get("token") || "", [params]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!token) {
      setError("No reset token found in URL.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await resetPassword({ token, newPassword: password });
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen flex-col justify-center bg-background py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="glass-card relative overflow-hidden border-none shadow-2xl sm:rounded-2xl">
            <div className="absolute inset-x-0 top-0 h-1.5 rounded-t-2xl bg-green-500" />
            <div className="space-y-6 px-8 py-12 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 scale-110 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-3xl font-black tracking-tight">Security Updated</h3>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Your new password has been verified and applied successfully.
              </p>
              <button
                onClick={() => router.push("/login")}
                className="group mt-8 h-12 w-full rounded-md bg-primary text-lg font-bold text-primary-foreground shadow-lg shadow-primary/20"
              >
                <span className="inline-flex items-center">
                  Sign In Now
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-background py-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute left-0 top-0 -z-10 h-full w-full overflow-hidden">
        <div className="absolute right-[10%] top-[30%] h-[35%] w-[35%] rounded-full bg-primary/5 blur-[110px]" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mb-8 flex flex-col items-center justify-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20 transition-transform duration-300 hover:scale-105">
            <span className="text-3xl font-black text-primary-foreground">M</span>
          </div>
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-foreground">
            Set New <span className="text-primary">Password</span>
          </h2>
        </div>

        {!token ? (
          <div className="glass-card space-y-4 border-none p-8 text-center shadow-2xl sm:rounded-2xl">
            <ShieldCheck className="mx-auto h-12 w-12 opacity-50" />
            <h1 className="text-xl font-semibold">Invalid Session</h1>
            <p className="text-sm text-muted-foreground">This reset link is invalid or has expired. Please request a new one.</p>
            <Link href="/forgot-password" className="mt-4 block w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              Request Reset Link
            </Link>
          </div>
        ) : (
          <div className="glass-card relative border-none shadow-2xl sm:rounded-2xl">
            <div className="absolute inset-x-0 top-0 h-1.5 rounded-t-2xl bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
            <div className="space-y-1 px-6 pb-0 pt-8">
              <h1 className="text-2xl font-bold">Secure Reset</h1>
              <p className="text-sm text-muted-foreground">Please enter your new complex password</p>
            </div>

            <div className="grid gap-6 px-6 py-6">
              <form noValidate onSubmit={onSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="h-11 w-full rounded-md border border-muted bg-background/50 pl-10 pr-3 text-sm"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="h-11 w-full rounded-md border border-muted bg-background/50 px-3 text-sm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                {error && <p className="text-xs font-medium text-destructive">{error}</p>}

                <button
                  type="submit"
                  className="mt-4 h-11 w-full rounded-md bg-primary text-base font-bold text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:shadow-primary/30 active:scale-95"
                  disabled={isLoading}
                >
                  {isLoading ? "Updating Security..." : "Save Password"}
                </button>
              </form>
            </div>

            <div className="px-6 pb-8">
              <p className="w-full px-4 text-center text-xs text-muted-foreground">
                Make sure your password is unique and includes numbers or symbols for better protection.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
