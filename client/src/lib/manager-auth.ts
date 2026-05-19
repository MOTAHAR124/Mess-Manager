import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const MANAGER_SESSION_COOKIE = "meso_manager_session";
const INVALID_MANAGER_CREDENTIALS = "Invalid Manager Credentials";

export type ManagerSession = {
  email: string;
  role: "MANAGER";
};

export type ManagerCredentialValidation =
  | { valid: true }
  | { valid: false; message: string };

export function getInvalidManagerCredentialsMessage(message = INVALID_MANAGER_CREDENTIALS) {
  return message;
}

export function normalizeManagerEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getManagerEmails() {
  return (process.env.NEXT_PUBLIC_MANAGER_EMAIL || "")
    .split(",")
    .map(normalizeManagerEmail)
    .filter(Boolean);
}

export function validateManagerCredentials(email: string, password: string): ManagerCredentialValidation {
  const managerPassword = process.env.MANAGER_PASSWORD || "";
  const managerEmails = getManagerEmails();
  const normalizedEmail = normalizeManagerEmail(email);

  if (!managerPassword || managerEmails.length === 0) {
    return { valid: false, message: "Manager credentials are not configured" };
  }

  if (!managerEmails.includes(normalizedEmail)) {
    return { valid: false, message: "Invalid manager email" };
  }

  if (!secureCompare(password, managerPassword)) {
    return { valid: false, message: "Invalid manager password" };
  }

  return { valid: true };
}

export function createManagerSessionToken(email: string) {
  const normalizedEmail = normalizeManagerEmail(email);
  const encodedEmail = Buffer.from(normalizedEmail).toString("base64url");
  return `${encodedEmail}.${signManagerEmail(normalizedEmail)}`;
}

export async function getManagerSession(): Promise<ManagerSession | null> {
  if (!process.env.MANAGER_PASSWORD) return null;

  const cookieStore = await cookies();
  const token = cookieStore.get(MANAGER_SESSION_COOKIE)?.value;
  if (!token) return null;

  const separatorIndex = token.indexOf(".");
  if (separatorIndex === -1) return null;

  const encodedEmail = token.slice(0, separatorIndex);
  const signature = token.slice(separatorIndex + 1);
  if (!encodedEmail || !signature) return null;

  const email = normalizeManagerEmail(Buffer.from(encodedEmail, "base64url").toString("utf8"));
  const managerEmails = getManagerEmails();
  if (!managerEmails.includes(email)) return null;

  const expectedSignature = signManagerEmail(email);
  if (!secureCompare(signature, expectedSignature)) return null;

  return { email, role: "MANAGER" };
}

function signManagerEmail(email: string) {
  const secret = process.env.MANAGER_PASSWORD || "";
  return createHmac("sha256", secret).update(email).digest("hex");
}

function secureCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}
