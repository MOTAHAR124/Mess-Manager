import { NextResponse } from "next/server";
import { MANAGER_SESSION_COOKIE } from "@/lib/manager-auth";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(MANAGER_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
