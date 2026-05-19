import { NextRequest, NextResponse } from "next/server";
import {
  createManagerSessionToken,
  getInvalidManagerCredentialsMessage,
  MANAGER_SESSION_COOKIE,
  normalizeManagerEmail,
  validateManagerCredentials,
} from "@/lib/manager-auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };
  const email = normalizeManagerEmail(body.email || "");
  const password = body.password || "";

  const credentialValidation = validateManagerCredentials(email, password);

  if (!credentialValidation.valid) {
    return NextResponse.json(
      { message: getInvalidManagerCredentialsMessage(credentialValidation.message) },
      { status: 401 },
    );
  }

  const authResponse = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });
  const authPayload = await authResponse.json().catch(() => ({}));

  if (!authResponse.ok) {
    return NextResponse.json(
      { message: getInvalidManagerCredentialsMessage() },
      { status: 401 },
    );
  }

  const response = NextResponse.json({
    ...authPayload,
    data: authPayload.data
      ? {
          ...authPayload.data,
          user: { ...authPayload.data.user, authRole: "MANAGER" },
        }
      : undefined,
    user: authPayload.user ? { ...authPayload.user, authRole: "MANAGER" } : undefined,
  });

  response.cookies.set(MANAGER_SESSION_COOKIE, createManagerSessionToken(email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
