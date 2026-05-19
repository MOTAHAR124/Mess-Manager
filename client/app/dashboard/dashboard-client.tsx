"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { StatusStack } from "@/components/app/status-stack";
import { getDashboardSummary } from "@/lib/next-api";
import { configHint, getRuntimeConfig, listenRuntimeChange, RuntimeConfig } from "@/lib/runtime-config";

export default function DashboardClient() {
  const [config, setConfig] = useState<RuntimeConfig>({ messId: "", monthId: "" });
  const [summary, setSummary] = useState<{
    totalMembers: number;
    totalMeals: number;
    totalMealCost: number;
    totalDeposits: number;
    totalBalance: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSummary(cfg: RuntimeConfig) {
      if (!cfg.messId) {
        setSummary(null);
        return;
      }
      try {
        setError(null);
        const data = await getDashboardSummary(cfg.messId);
        setSummary(data ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard summary");
      }
    }

    const cfg = getRuntimeConfig();
    setConfig(cfg);
    void fetchSummary(cfg);

    return listenRuntimeChange((detail) => {
      setConfig(detail.config);
      void fetchSummary(detail.config);
    });
  }, []);

  const hint = configHint(config);

  return (
    <section className="space-y-5">
      <PageHeader
        title="Dashboard"
        description="High-level monthly view for meals, expenses, deposits, and balances."
      />
      <StatusStack hint={hint} error={error} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Members" value={String(summary?.totalMembers ?? 0)} hint="Active mess members" />
        <StatCard title="Total Meals" value={(summary?.totalMeals ?? 0).toFixed(2)} hint="Sum of breakfast/lunch/dinner" />
        <StatCard title="Deposit" value={`INR ${(summary?.totalDeposits ?? 0).toFixed(2)}`} hint="Total member contributions" />
        <StatCard title="Expense" value={`INR ${(summary?.totalMealCost ?? 0).toFixed(2)}`} hint="Current month spend" />
        <StatCard title="Balance" value={`INR ${(summary?.totalBalance ?? 0).toFixed(2)}`} hint="Deposit minus expense" />
      </div>
    </section>
  );
}
