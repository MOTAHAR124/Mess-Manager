"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import { StatusStack } from "@/components/app/status-stack";
import { createDeposit, deleteDeposit, getDeposits, getMembers, updateDeposit } from "@/lib/next-api";
import { configHint, getRuntimeConfig, listenRuntimeChange, RuntimeConfig } from "@/lib/runtime-config";
import { Deposit, MessMember } from "@/types/common";

export default function DepositsPage() {
  const [config, setConfig] = useState<RuntimeConfig>({ messId: "", monthId: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [members, setMembers] = useState<MessMember[]>([]);

  const [memberId, setMemberId] = useState("");
  const [amount, setAmount] = useState("");
  const [details, setDetails] = useState("Method: CASH");
  const [editingDepositId, setEditingDepositId] = useState<string | null>(null);

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
      const [depositData, memberData] = await Promise.all([getDeposits(cfg.monthId), getMembers(cfg.messId)]);
      setDeposits(depositData || []);
      setMembers(memberData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load deposits");
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

  const resetForm = () => {
    setEditingDepositId(null);
    setMemberId("");
    setAmount("");
    setDetails("Method: CASH");
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!config.monthId || !config.messId || !memberId) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      if (editingDepositId) {
        await updateDeposit(editingDepositId, {
          memberId,
          amount: Number(amount),
          date: new Date().toISOString(),
          details,
        });
        setSuccess("Deposit updated successfully.");
      } else {
        await createDeposit({
          monthId: config.monthId,
          messId: config.messId,
          memberId,
          amount: Number(amount),
          date: new Date().toISOString(),
          details,
        });
        setSuccess("Deposit created successfully.");
      }

      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save deposit");
    } finally {
      setLoading(false);
    }
  }

  function onEdit(deposit: Deposit) {
    setEditingDepositId(deposit.id);
    setMemberId(deposit.memberId);
    setAmount(String(deposit.amount));
    setDetails(deposit.details || "Method: CASH");
  }

  async function onDelete(id: string) {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await deleteDeposit(id);
      setSuccess("Deposit deleted successfully.");
      if (editingDepositId === id) resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete deposit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-5">
      <PageHeader
        title="Deposits"
        description="Member contribution records for the active month."
      />
      <StatusStack hint={hint} error={error} success={success} />

      <form onSubmit={onSubmit} className="card grid gap-3 p-4 md:grid-cols-4">
        <select value={memberId} onChange={(e) => setMemberId(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2" required>
          <option value="">Select member</option>
          {members.map((m) => (
            <option key={m.id} value={m.userId}>{m.user.firstName} {m.user.lastName}</option>
          ))}
        </select>
        <input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Amount" required />
        <input value={details} onChange={(e) => setDetails(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Details" />
        <div className="flex gap-2">
          <button disabled={loading} className="w-full rounded-lg bg-sky-600 px-4 py-2 font-bold text-white hover:bg-sky-500 disabled:opacity-60">
            {editingDepositId ? "Update" : "Record"}
          </button>
          {editingDepositId && (
            <button type="button" onClick={resetForm} className="rounded-lg bg-slate-200 px-3 py-2 text-sm font-bold text-slate-700">Cancel</button>
          )}
        </div>
      </form>

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-bold text-slate-700">Date</th>
              <th className="px-4 py-3 text-left font-bold text-slate-700">Member</th>
              <th className="px-4 py-3 text-left font-bold text-slate-700">Note</th>
              <th className="px-4 py-3 text-right font-bold text-slate-700">Amount</th>
              <th className="px-4 py-3 text-right font-bold text-slate-700">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {deposits.map((deposit) => (
              <tr key={deposit.id}>
                <td className="px-4 py-3">{new Date(deposit.date).toLocaleDateString()}</td>
                <td className="px-4 py-3 font-medium text-slate-700">{memberNameMap.get(deposit.memberId) || deposit.memberId}</td>
                <td className="px-4 py-3 text-slate-600">{deposit.details || "-"}</td>
                <td className="px-4 py-3 text-right font-bold text-slate-900">BDT {deposit.amount.toFixed(2)}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => onEdit(deposit)} className="rounded-md bg-sky-100 px-2 py-1 text-xs font-bold text-sky-700">Edit</button>
                  <button onClick={() => void onDelete(deposit.id)} className="rounded-md bg-rose-100 px-2 py-1 text-xs font-bold text-rose-700">Delete</button>
                </td>
              </tr>
            ))}
            {deposits.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">No deposits available for this month.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
