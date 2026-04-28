"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import { StatusStack } from "@/components/app/status-stack";
import { createMeal, deleteMeal, getMeals, getMembers, updateMeal } from "@/lib/next-api";
import { configHint, getRuntimeConfig, listenRuntimeChange, RuntimeConfig } from "@/lib/runtime-config";
import { MessMember } from "@/types/common";

type MealRow = {
  id: string;
  memberId: string;
  breakfast: number;
  lunch: number;
  dinner: number;
  date: string;
};

export default function MealsPage() {
  const [config, setConfig] = useState<RuntimeConfig>({ messId: "", monthId: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [meals, setMeals] = useState<MealRow[]>([]);
  const [members, setMembers] = useState<MessMember[]>([]);

  const [memberId, setMemberId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [breakfast, setBreakfast] = useState("0");
  const [lunch, setLunch] = useState("0");
  const [dinner, setDinner] = useState("0");

  const [editingMealId, setEditingMealId] = useState<string | null>(null);

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
      const [mealData, memberData] = await Promise.all([getMeals(cfg.monthId), getMembers(cfg.messId)]);
      setMeals(mealData || []);
      setMembers(memberData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load meals");
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
    setEditingMealId(null);
    setMemberId("");
    setDate(new Date().toISOString().slice(0, 10));
    setBreakfast("0");
    setLunch("0");
    setDinner("0");
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!config.monthId || !config.messId || !memberId) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const payload = {
        breakfast: Number(breakfast) || 0,
        lunch: Number(lunch) || 0,
        dinner: Number(dinner) || 0,
      };

      if (editingMealId) {
        await updateMeal(editingMealId, payload);
        setSuccess("Meal updated successfully.");
      } else {
        await createMeal({
          monthId: config.monthId,
          messId: config.messId,
          memberId,
          date: new Date(date).toISOString(),
          ...payload,
        });
        setSuccess("Meal created successfully.");
      }

      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save meal");
    } finally {
      setLoading(false);
    }
  }

  function onEdit(meal: MealRow) {
    setEditingMealId(meal.id);
    setMemberId(meal.memberId);
    setDate(new Date(meal.date).toISOString().slice(0, 10));
    setBreakfast(String(meal.breakfast));
    setLunch(String(meal.lunch));
    setDinner(String(meal.dinner));
  }

  async function onDelete(id: string) {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await deleteMeal(id);
      setSuccess("Meal deleted successfully.");
      if (editingMealId === id) resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete meal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-5">
      <PageHeader
        title="Meals"
        description="Track per-member meal entries for breakfast, lunch, and dinner."
      />
      <StatusStack hint={hint} error={error} success={success} />

      <form onSubmit={onSubmit} className="card grid gap-3 p-4 md:grid-cols-6">
        <select value={memberId} onChange={(e) => setMemberId(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2" required disabled={!!editingMealId}>
          <option value="">Select member</option>
          {members.map((m) => (
            <option key={m.id} value={m.userId}>{m.user.firstName} {m.user.lastName}</option>
          ))}
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2" required disabled={!!editingMealId} />
        <input type="number" min="0" step="0.5" value={breakfast} onChange={(e) => setBreakfast(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Breakfast" />
        <input type="number" min="0" step="0.5" value={lunch} onChange={(e) => setLunch(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Lunch" />
        <input type="number" min="0" step="0.5" value={dinner} onChange={(e) => setDinner(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Dinner" />
        <div className="flex gap-2">
          <button disabled={loading} className="w-full rounded-lg bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-500 disabled:opacity-60">
            {editingMealId ? "Update" : "Add"}
          </button>
          {editingMealId && (
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
              <th className="px-4 py-3 text-right font-bold text-slate-700">Breakfast</th>
              <th className="px-4 py-3 text-right font-bold text-slate-700">Lunch</th>
              <th className="px-4 py-3 text-right font-bold text-slate-700">Dinner</th>
              <th className="px-4 py-3 text-right font-bold text-slate-700">Total</th>
              <th className="px-4 py-3 text-right font-bold text-slate-700">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {meals.map((meal) => {
              const total = meal.breakfast + meal.lunch + meal.dinner;
              return (
                <tr key={meal.id}>
                  <td className="px-4 py-3">{new Date(meal.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-medium text-slate-700">{memberNameMap.get(meal.memberId) || meal.memberId}</td>
                  <td className="px-4 py-3 text-right">{meal.breakfast.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">{meal.lunch.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">{meal.dinner.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-bold">{total.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => onEdit(meal)} className="rounded-md bg-sky-100 px-2 py-1 text-xs font-bold text-sky-700">Edit</button>
                    <button onClick={() => void onDelete(meal.id)} className="rounded-md bg-rose-100 px-2 py-1 text-xs font-bold text-rose-700">Delete</button>
                  </td>
                </tr>
              );
            })}
            {meals.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">No meals available for this month.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
