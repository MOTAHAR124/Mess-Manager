"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import { StatusStack } from "@/components/app/status-stack";
import { calculateSettlement, getMembers, getSettlement } from "@/lib/next-api";
import { configHint, getRuntimeConfig, listenRuntimeChange, RuntimeConfig } from "@/lib/runtime-config";
import { MessMember, Settlement } from "@/types/common";

export default function SettlementPage() {
  const [config, setConfig] = useState<RuntimeConfig>({ messId: "", monthId: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [settlement, setSettlement] = useState<Settlement | null>(null);
  const [members, setMembers] = useState<MessMember[]>([]);

  const hint = configHint(config);

  const memberNameMap = useMemo(() => {
    const map = new Map<string, string>();
    members.forEach((m) => map.set(m.userId, `${m.user.firstName} ${m.user.lastName}`.trim()));
    return map;
  }, [members]);

  async function load(activeConfig?: RuntimeConfig) {
    const cfg = activeConfig ?? config;
    if (!cfg.monthId || !cfg.messId) return;
    try {
      setLoading(true);
      setError(null);
      const [settlementData, memberData] = await Promise.all([
        getSettlement(cfg.monthId),
        getMembers(cfg.messId),
      ]);
      setSettlement(settlementData ?? null);
      setMembers(memberData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settlement");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const cfg = getRuntimeConfig();
    setConfig(cfg);
    void load(cfg);

    return listenRuntimeChange((detail) => {
      setConfig(detail.config);
      void load(detail.config);
    });
  }, []);

  async function onRecalculate() {
    if (!config.monthId) return;
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const updated = await calculateSettlement(config.monthId);
      setSettlement(updated ?? null);
      setSuccess("Settlement recalculated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to recalculate settlement");
    } finally {
      setLoading(false);
    }
  }

  const memberRows = settlement?.memberBalances ? Object.entries(settlement.memberBalances) : [];
  const toNumber = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : 0);

  return (
    <section className="space-y-5">
      <PageHeader
        title="Settlement"
        description="Meal-rate based final balances for each member."
        action={(
          <button
            onClick={() => void onRecalculate()}
            disabled={loading}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            Recalculate
          </button>
        )}
      />

      <StatusStack hint={hint} error={error} success={success} />

      <div className="grid gap-4 md:grid-cols-4">
        <div className="card p-4">
          <p className="text-xs font-bold uppercase text-slate-500">Total Meals</p>
          <p className="mt-2 text-2xl font-extrabold">{(settlement?.totalMeals ?? 0).toFixed(2)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-bold uppercase text-slate-500">Meal Rate</p>
          <p className="mt-2 text-2xl font-extrabold">INR {(settlement?.mealRate ?? 0).toFixed(4)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-bold uppercase text-slate-500">Total Expense</p>
          <p className="mt-2 text-2xl font-extrabold">INR {(settlement?.totalCost ?? 0).toFixed(2)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-bold uppercase text-slate-500">Total Deposit</p>
          <p className="mt-2 text-2xl font-extrabold">INR {(settlement?.totalDeposit ?? 0).toFixed(2)}</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-bold text-slate-700">Member</th>
              <th className="px-4 py-3 text-right font-bold text-slate-700">Meals</th>
              <th className="px-4 py-3 text-right font-bold text-slate-700">Cost</th>
              <th className="px-4 py-3 text-right font-bold text-slate-700">Deposit</th>
              <th className="px-4 py-3 text-right font-bold text-slate-700">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {memberRows.map(([memberId, row]) => (
              <tr key={memberId}>
                <td className="px-4 py-3 font-medium text-slate-700">{memberNameMap.get(memberId) || memberId}</td>
                <td className="px-4 py-3 text-right">{toNumber(row?.meals).toFixed(2)}</td>
                <td className="px-4 py-3 text-right">INR {toNumber(row?.cost).toFixed(2)}</td>
                <td className="px-4 py-3 text-right">INR {toNumber(row?.deposit).toFixed(2)}</td>
                <td className={`px-4 py-3 text-right font-bold ${toNumber(row?.balance) >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                  INR {toNumber(row?.balance).toFixed(2)}
                </td>
              </tr>
            ))}
            {memberRows.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">No settlement data available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
