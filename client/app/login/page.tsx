"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { saveAuthSession } from "@/lib/auth-session";
import { login } from "@/lib/next-api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const payload = await login({ email: email.trim().toLowerCase(), password });
      saveAuthSession(payload);
      router.replace(payload.user.hasActiveMonth ? "/dashboard" : "/meals");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  function onGoogleLogin() {
    setError(null);
    setGoogleLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
    const apiOrigin = apiUrl.replace(/\/api\/v1\/?$/, "");
    window.location.href = `${apiOrigin}/api/v1/auth/google`;
  }

  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-background py-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute left-0 top-0 -z-10 h-full w-full overflow-hidden">
        <div className="absolute -left-[10%] -top-[10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mb-8 flex flex-col items-center justify-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20 transition-transform duration-300 hover:rotate-6">
            <span className="text-3xl font-black text-primary-foreground">M</span>
          </div>
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-foreground">
            Meso <span className="text-primary">Sync</span>
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">Premium Mess Management System</p>
        </div>

        <div className="glass-card relative border-none shadow-2xl sm:rounded-2xl">
          <div className="absolute inset-x-0 top-0 h-1.5 rounded-t-2xl bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
          <div className="space-y-1 px-6 pb-0 pt-8">
            <h1 className="text-2xl font-bold">Sign In</h1>
            <p className="text-sm text-muted-foreground">Enter your credentials to access your mess dashboard</p>
          </div>

          <div className="grid gap-6 px-6 py-6">
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    className="h-11 w-full rounded-md border border-muted bg-background/50 pl-10 pr-3 text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Password</label>
                  <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="h-11 w-full rounded-md border border-muted bg-background/50 pl-10 pr-3 text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <button
                type="submit"
                className="group h-11 w-full rounded-md bg-primary text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-primary/30"
                disabled={loading}
              >
                <span className="inline-flex items-center">
                  {loading ? "Authenticating..." : "Sign In"}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
                </span>
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 font-medium text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onGoogleLogin}
              disabled={googleLoading}
              className="flex h-11 items-center justify-center gap-3 rounded-md border border-muted font-medium transition-all duration-300 hover:border-primary/20 hover:bg-accent/50 active:scale-95"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {googleLoading ? "Redirecting..." : "Google Account"}
            </button>
          </div>

          <div className="flex flex-col gap-4 px-6 pb-8">
            <div className="w-full text-center text-sm text-muted-foreground">
              {"Don't have an account? "}
              <Link
                href="/register"
                className="group inline-flex items-center gap-1 font-bold text-primary transition-colors hover:text-primary/80"
              >
                Create one now
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
