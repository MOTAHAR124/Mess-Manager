"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, Lock, Mail, Send } from "lucide-react";
import { forgotPassword } from "@/lib/next-api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await forgotPassword({ email: email.trim().toLowerCase() });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-background py-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute left-0 top-0 -z-10 h-full w-full overflow-hidden">
        <div className="absolute left-[15%] top-[20%] h-[30%] w-[30%] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mb-8 flex flex-col items-center justify-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20 transition-transform duration-300 hover:scale-105">
            <span className="text-3xl font-black text-primary-foreground">M</span>
          </div>
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-foreground">
            Security <span className="text-primary">First</span>
          </h2>
        </div>

        <div className="glass-card relative border-none shadow-2xl sm:rounded-2xl">
          <div className="absolute inset-x-0 top-0 h-1.5 rounded-t-2xl bg-gradient-to-r from-primary/30 via-primary to-primary/30" />

          <div className="space-y-1 px-6 pb-0 pt-8">
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <Lock className="h-6 w-6 text-primary" />
              Reset Password
            </h1>
            <p className="text-sm text-muted-foreground">{"We'll send a recovery link to your inbox"}</p>
          </div>

          <div className="grid gap-6 px-6 py-6">
            {!success ? (
              <form noValidate onSubmit={onSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className="h-11 w-full rounded-md border border-muted bg-background/50 pl-10 pr-3 text-sm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  {error && <p className="text-xs font-medium text-destructive">{error}</p>}
                </div>

                <button
                  type="submit"
                  className="group h-11 w-full rounded-md bg-primary text-base font-bold text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:shadow-primary/30"
                  disabled={loading}
                >
                  <span className="inline-flex items-center">
                    {loading ? "Sending Link..." : "Send Reset Instructions"}
                    {!loading && <Send className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />}
                  </span>
                </button>
              </form>
            ) : (
              <div className="space-y-4 py-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">Check your inbox</h3>
                <p className="px-4 text-sm leading-relaxed text-muted-foreground">
                  We&apos;ve sent a password recovery link to <strong>{email}</strong>.
                </p>
                <button
                  className="mt-4 rounded-md border border-muted px-4 py-2 text-sm transition-colors hover:bg-accent/50"
                  onClick={() => setSuccess(false)}
                  type="button"
                >
                  Try another email
                </button>
              </div>
            )}
          </div>

          <div className="px-6 pb-8">
            <Link
              href="/login"
              className="group flex w-full items-center justify-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
