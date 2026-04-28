"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { saveStoredUser } from "@/lib/auth-session";
import { getCurrentUser } from "@/lib/next-api";
import { saveAuthToken, saveRefreshToken } from "@/lib/runtime-config";

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [message, setMessage] = useState("Finalizing sign-in...");

  useEffect(() => {
    void (async () => {
      const accessToken = params.get("accessToken") || "";
      const refreshToken = params.get("refreshToken") || "";

      if (!accessToken) {
        setMessage("Missing access token from callback. Please log in again.");
        return;
      }

      try {
        saveAuthToken(accessToken);
        saveRefreshToken(refreshToken);
        const profile = await getCurrentUser();
        saveStoredUser(profile);
        router.replace("/dashboard");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Failed to complete sign-in.");
      }
    })();
  }, [params, router]);

  return (
    <section className="mx-auto max-w-md">
      <div className="card p-5">
        <p className="text-sm text-slate-700">{message}</p>
      </div>
    </section>
  );
}
