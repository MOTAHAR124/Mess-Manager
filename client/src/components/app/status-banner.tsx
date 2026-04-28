"use client";

export function StatusBanner({ message, type = "error" }: { message: string; type?: "error" | "success" | "info" }) {
  const cls =
    type === "error"
      ? "border-rose-200 bg-rose-50/90 text-rose-700"
      : type === "success"
      ? "border-emerald-200 bg-emerald-50/90 text-emerald-700"
      : "border-sky-200 bg-sky-50/90 text-sky-700";

  return <p className={`rounded-xl border px-4 py-3 text-sm font-semibold shadow-sm ${cls}`}>{message}</p>;
}
