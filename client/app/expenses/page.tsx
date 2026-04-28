"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import { StatusStack } from "@/components/app/status-stack";
import { createExpense, deleteExpense, getExpenses, getMembers, updateExpense } from "@/lib/next-api";
import { configHint, getRuntimeConfig, listenRuntimeChange, RuntimeConfig } from "@/lib/runtime-config";
import { Cost, MessMember } from "@/types/common";

export default function ExpensesPage() {
  const [config, setConfig] = useState<RuntimeConfig>({ messId: "", monthId: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Cost[]>([]);
  const [members, setMembers] = useState<MessMember[]>([]);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"SHARED" | "INDIVIDUAL">("SHARED");
  const [memberId, setMemberId] = useState("");
  const [details, setDetails] = useState("");
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

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
      const [expenseData, memberData] = await Promise.all([
        getExpenses(cfg.monthId),
        getMembers(cfg.messId),
      ]);
      setExpenses(expenseData || []);
      setMembers(memberData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load expenses");
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
    setEditingExpenseId(null);
    setName("");
    setAmount("");
    setType("SHARED");
    setMemberId("");
    setDetails("");
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!config.monthId || !config.messId) return;
    if (type === "INDIVIDUAL" && !memberId) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      if (editingExpenseId) {
        if (type === "SHARED") {
          setError("Shared expense update is not supported by backend yet. Delete and recreate instead.");
          return;
        }

        await updateExpense(editingExpenseId, {
          name,
          amount: Number(amount),
          type,
          memberId: type === "INDIVIDUAL" ? memberId : undefined,
          details,
        });
        setSuccess("Expense updated successfully.");
      } else {
        await createExpense({
          monthId: config.monthId,
          messId: config.messId,
          name,
          amount: Number(amount),
          type,
          memberId: type === "INDIVIDUAL" ? memberId : undefined,
          details,
        });
        setSuccess("Expense created successfully.");
      }

      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save expense");
    } finally {
      setLoading(false);
    }
  }

  function onEdit(expense: Cost) {
    if (expense.type === "SHARED") {
      setError("Shared expense update is not supported by backend yet. Delete and recreate instead.");
      return;
    }

    setEditingExpenseId(expense.id);
    setName(expense.name);
    setAmount(String(expense.amount));
    setType(expense.type as "SHARED" | "INDIVIDUAL");
    setMemberId(expense.memberId || "");
    setDetails(expense.details || "");
  }

  async function onDelete(id: string) {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await deleteExpense(id);
      setSuccess("Expense deleted successfully.");
      if (editingExpenseId === id) resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete expense");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-5">
      <PageHeader
        title="Expenses"
        description="Shared and individual expenses with per-member allocation."
      />
      <StatusStack hint={hint} error={error} success={success} />

      <form onSubmit={onSubmit} className="card grid gap-3 p-4 md:grid-cols-6">
        <input value={name} onChange={(e) => setName(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Expense title" required />
        <input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Amount" required />
        <select value={type} onChange={(e) => setType(e.target.value as "SHARED" | "INDIVIDUAL")} className="rounded-lg border border-slate-300 px-3 py-2">
          <option value="SHARED">SHARED</option>
          <option value="INDIVIDUAL">INDIVIDUAL</option>
        </select>
        <select value={memberId} onChange={(e) => setMemberId(e.target.value)} disabled={type !== "INDIVIDUAL"} className="rounded-lg border border-slate-300 px-3 py-2">
          <option value="">Select member (optional for shared)</option>
          {members.map((m) => (
            <option key={m.id} value={m.userId}>{m.user.firstName} {m.user.lastName}</option>
          ))}
        </select>
        <input value={details} onChange={(e) => setDetails(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Details" />
        <div className="flex gap-2">
          <button disabled={loading} className="w-full rounded-lg bg-rose-600 px-4 py-2 font-bold text-white hover:bg-rose-500 disabled:opacity-60">
            {editingExpenseId ? "Update" : "Add Expense"}
          </button>
          {editingExpenseId && (
            <button type="button" onClick={resetForm} className="rounded-lg bg-slate-200 px-3 py-2 text-sm font-bold text-slate-700">Cancel</button>
          )}
        </div>
      </form>

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-bold text-slate-700">Title</th>
              <th className="px-4 py-3 text-left font-bold text-slate-700">Type</th>
              <th className="px-4 py-3 text-left font-bold text-slate-700">Member</th>
              <th className="px-4 py-3 text-right font-bold text-slate-700">Amount</th>
              <th className="px-4 py-3 text-right font-bold text-slate-700">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {expenses.map((expense) => (
              <tr key={expense.id}>
                <td className="px-4 py-3 font-medium text-slate-700">{expense.name}</td>
                <td className="px-4 py-3 text-slate-600">{expense.type}</td>
                <td className="px-4 py-3 text-slate-600">{expense.memberId ? memberNameMap.get(expense.memberId) || expense.memberId : "ALL"}</td>
                <td className="px-4 py-3 text-right font-bold text-slate-900">BDT {expense.amount.toFixed(2)}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    onClick={() => onEdit(expense)}
                    disabled={expense.type === "SHARED"}
                    className="rounded-md bg-sky-100 px-2 py-1 text-xs font-bold text-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
                    title={expense.type === "SHARED" ? "Shared expense edit is not supported yet" : "Edit expense"}
                  >
                    Edit
                  </button>
                  <button onClick={() => void onDelete(expense.id)} className="rounded-md bg-rose-100 px-2 py-1 text-xs font-bold text-rose-700">Delete</button>
                </td>
              </tr>
            ))}
            {expenses.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">No expenses available for this month.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
