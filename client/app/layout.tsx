import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app/app-shell";

export const metadata: Metadata = {
  title: "Meso",
  description: "Mess management system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
