"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, Lock, Mail, User } from "lucide-react";
import { saveAuthSession } from "@/lib/auth-session";
import { register } from "@/lib/next-api";

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const payload = await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      saveAuthSession(payload);
      router.replace("/meals");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-background py-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute left-0 top-0 -z-10 h-full w-full overflow-hidden">
        <div className="absolute -left-[10%] -top-[10%] h-[40%] w-[40%] rounded-full bg-primary/2 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mb-8 flex flex-col items-center justify-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20 transition-transform duration-300 hover:-rotate-6">
            <span className="text-3xl font-black text-primary-foreground">M</span>
          </div>
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-foreground">
            Create <span className="text-primary">Account</span>
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">Join the premium Mess Management community</p>
        </div>

        <div className="glass-card relative border-none shadow-2xl sm:rounded-2xl">
          <div className="absolute inset-x-0 top-0 h-1.5 rounded-t-2xl bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
          <div className="space-y-1 px-6 pb-0 pt-8">
            <h1 className="text-2xl font-bold">Register</h1>
            <p className="text-sm text-muted-foreground">Create your profile to start syncing with your mess</p>
          </div>

          <div className="px-6 py-6">
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      placeholder="John"
                      className="h-11 w-full rounded-md border border-muted bg-background/50 pl-10 pr-3 text-sm"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      placeholder="Doe"
                      className="h-11 w-full rounded-md border border-muted bg-background/50 pl-10 pr-3 text-sm"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

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
                <label className="text-sm font-medium">Password</label>
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="h-11 w-full rounded-md border border-muted bg-background/50 pl-10 pr-3 text-sm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                  {loading ? "Creating account..." : "Sign Up"}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
                </span>
              </button>
            </form>
          </div>

          <div className="px-6 pb-8">
            <div className="w-full text-center text-sm text-muted-foreground">
              {"Already have an account? "}
              <Link
                href="/login"
                className="group inline-flex items-center gap-1 font-bold text-primary transition-colors hover:text-primary/80"
              >
                Sign in instead
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
