import fs from "node:fs";
import path from "node:path";

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing env file: ${filePath}`);
  }
  return fs.readFileSync(filePath, "utf8");
}

function getEnvValue(raw, key) {
  const line = raw
    .split(/\r?\n/)
    .find((entry) => entry.trim().startsWith(`${key}=`));
  if (!line) return "";
  return line.slice(line.indexOf("=") + 1).trim();
}

function decodeJwtPayload(token) {
  const parts = token.split(".");
  if (parts.length < 2) {
    throw new Error("Invalid JWT token format");
  }

  const base64Url = parts[1];
  const padded = base64Url.padEnd(base64Url.length + ((4 - (base64Url.length % 4)) % 4), "=");
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  const json = Buffer.from(base64, "base64").toString("utf8");

  return JSON.parse(json);
}

function formatLocalDateFromUnix(seconds) {
  if (!Number.isFinite(seconds)) return "n/a";
  return new Date(seconds * 1000).toLocaleString();
}

function getStatusFromExp(seconds) {
  if (!Number.isFinite(seconds)) return "Unknown";
  return seconds * 1000 <= Date.now() ? "Expired" : "Valid";
}

function getTokenSource(rawToken) {
  if (!rawToken) return "none";
  return "env (runtime may switch to localStorage after login)";
}

try {
  const envPath = path.resolve(process.cwd(), ".env");
  const envRaw = readEnvFile(envPath);
  const token = getEnvValue(envRaw, "NEXT_PUBLIC_API_TOKEN");

  if (!token) {
    console.log("Session Debug\n\nStatus: Missing token\n\nSet NEXT_PUBLIC_API_TOKEN in client/.env");
    process.exit(0);
  }

  const payload = decodeJwtPayload(token);
  const exp = Number(payload.exp);

  console.log("Session Debug");
  console.log("");
  console.log(`Status: ${getStatusFromExp(exp)}`);
  console.log("");
  console.log(`Expires: ${formatLocalDateFromUnix(exp)}`);
  console.log("");
  console.log(`User ID: ${payload.userId || "n/a"}`);
  console.log("");
  console.log(`Email: ${payload.email || "n/a"}`);
  console.log("");
  console.log("Role: Unknown (role is not present in JWT payload)");
  console.log("");
  console.log(`Token Source: ${getTokenSource(token)}`);
} catch (error) {
  console.error("Session Debug failed:");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
