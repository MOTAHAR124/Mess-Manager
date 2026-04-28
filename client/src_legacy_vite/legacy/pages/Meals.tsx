import { useMemo, useState } from 'react';
import { format, eachDayOfInterval } from 'date-fns';
import { Check, Download, Pencil, Plus, Trash2, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMeal } from '@/hooks/useMeal';
import { useDeposit } from '@/hooks/useDeposit';
import { useCost } from '@/hooks/useCost';
import { useMessStore } from '@/stores/messStore';
import { useMealStore } from '@/stores/mealStore';
import { useDepositStore } from '@/stores/depositStore';
import { useCostStore } from '@/stores/costStore';
import { reportService } from '@/services/reportService';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { CostType, type MessMember } from '@/types/common';

type CurrentMonthTab = 'meals' | 'deposits' | 'mealCosts' | 'individualCosts' | 'sharedCosts';

const TAB_ITEMS: { key: CurrentMonthTab; label: string }[] = [
  { key: 'meals', label: 'Meal List' },
  { key: 'deposits', label: 'Deposit List' },
  { key: 'mealCosts', label: 'Meal Costs' },
  { key: 'individualCosts', label: 'Individual Costs' },
  { key: 'sharedCosts', label: 'Shared Costs' },
];

export default function MealsPage() {
  const { activeMonth, members } = useMessStore();
  const monthId = activeMonth?.id || '';
  const { isLoading, updateMealMutation, deleteMealMutation } = useMeal(monthId);
  useDeposit(monthId);
  useCost(monthId);

  const { meals } = useMealStore();
  const { deposits } = useDepositStore();
  const { costs } = useCostStore();

  const [activeTab, setActiveTab] = useState<CurrentMonthTab>('meals');
  const [visibleDays, setVisibleDays] = useState(5);
  const [editingCell, setEditingCell] = useState<{ date: string; memberId: string } | null>(null);
  const [editValues, setEditValues] = useState({ breakfast: 0, lunch: 0, dinner: 0 });

  const dates = useMemo(() => {
    if (!activeMonth?.startDate || !activeMonth?.endDate) return [];
    return eachDayOfInterval({
      start: new Date(activeMonth.startDate),
      end: new Date(activeMonth.endDate),
    }).reverse();
  }, [activeMonth]);

  const visibleDateRows = dates.slice(0, visibleDays);

  const mealsMap = useMemo(() => {
    const map: Record<string, Record<string, import("@/types/common").Meal>> = {};
    meals.forEach((meal) => {
      const dateKey = format(new Date(meal.date), 'yyyy-MM-dd');
      if (!map[dateKey]) map[dateKey] = {};
      map[dateKey][meal.memberId] = meal;
    });
    return map;
  }, [meals]);

  const mealCosts = useMemo(
    () => costs.filter((cost) => cost.category?.toLowerCase() === 'meal' || cost.name.toLowerCase().includes('meal')),
    [costs],
  );
  const individualCosts = useMemo(() => costs.filter((cost) => cost.type === CostType.INDIVIDUAL), [costs]);
  const sharedCosts = useMemo(() => costs.filter((cost) => cost.type === CostType.SHARED), [costs]);

  const handleEdit = (date: Date, memberId: string, currentMeals?: import("@/types/common").Meal) => {
    setEditingCell({ date: format(date, 'yyyy-MM-dd'), memberId });
    setEditValues({
      breakfast: currentMeals?.breakfast || 0,
      lunch: currentMeals?.lunch || 0,
      dinner: currentMeals?.dinner || 0,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingCell) return;

    try {
      const existingMeal = mealsMap[editingCell.date]?.[editingCell.memberId];
      if (!existingMeal) {
        toast({
          title: 'Missing meal entry',
          description: 'Create a meal entry for this date before editing it.',
        });
        return;
      }

      await updateMealMutation.mutateAsync({
        mealId: existingMeal.id,
        data: editValues,
      });

      setEditingCell(null);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: 'Could not update the meal entry.',
      });
    }
  };

  const handleDownloadPdf = async () => {
    if (!monthId) return;
    try {
      await reportService.downloadSettlementPdf(monthId);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Download failed',
        description: 'Could not generate the PDF for this month.',
      });
    }
  };

  if (isLoading && meals.length === 0) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-[560px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 leading-tight">Current Month Workspace</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">{activeMonth?.name || 'Current active month'}</p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <Button
            onClick={handleDownloadPdf}
            className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 font-bold text-gray-700 hover:bg-gray-50"
          >
            <Download size={18} className="mr-2" />
            Download PDF
          </Button>
          <Link to="/costs" className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all w-full sm:w-auto shadow-md">
            Record Expenses <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-1 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {TAB_ITEMS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-colors',
                activeTab === tab.key ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-700',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'meals' && (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-4 py-4 text-xs font-black uppercase tracking-wide text-gray-500">Date</th>
                  <th className="px-4 py-4 text-xs font-black uppercase tracking-wide text-gray-500">Daily Total</th>
                  {members.map((member) => (
                    <th key={member.id} className="min-w-[150px] px-4 py-4 text-xs font-black uppercase tracking-wide text-gray-500">
                      {getMemberName(member)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleDateRows.map((date: Date) => {
                  const dateKey = format(date, 'yyyy-MM-dd');
                  const dailyMeals = mealsMap[dateKey] || {};
                  const totalMeals = Object.values(dailyMeals).reduce((sum: number, meal: import("@/types/common").Meal) => sum + meal.breakfast + meal.lunch + meal.dinner, 0);

                  return (
                    <tr key={dateKey} className="border-b border-gray-100 align-top last:border-b-0">
                      <td className="px-4 py-5 text-sm font-bold text-gray-600">{format(date, 'dd MMM')}</td>
                      <td className="px-4 py-5">
                        <div className="space-y-1 text-sm font-bold text-gray-700">
                          <p>Total: {totalMeals.toFixed(1)}</p>
                        </div>
                      </td>
                      {members.map((member) => {
                        const meal = dailyMeals[member.userId];
                        const isEditing = editingCell?.date === dateKey && editingCell?.memberId === member.userId;

                        return (
                          <td key={member.id} className="px-4 py-5">
                            {isEditing ? (
                              <div className="w-[94px] rounded-xl border border-red-200 bg-white p-2 shadow-lg">
                                <div className="space-y-1">
                                  <input type="number" step="0.5" value={editValues.breakfast} onChange={(e) => setEditValues({ ...editValues, breakfast: parseFloat(e.target.value) || 0 })} className="w-full rounded border border-gray-200 px-2 py-1 text-xs font-bold" />
                                  <input type="number" step="0.5" value={editValues.lunch} onChange={(e) => setEditValues({ ...editValues, lunch: parseFloat(e.target.value) || 0 })} className="w-full rounded border border-gray-200 px-2 py-1 text-xs font-bold" />
                                  <input type="number" step="0.5" value={editValues.dinner} onChange={(e) => setEditValues({ ...editValues, dinner: parseFloat(e.target.value) || 0 })} className="w-full rounded border border-gray-200 px-2 py-1 text-xs font-bold" />
                                </div>
                                <div className="mt-2 flex gap-1">
                                  <button onClick={handleSaveEdit} className="rounded bg-green-600 p-1 text-white"><Check size={12} /></button>
                                  <button onClick={() => setEditingCell(null)} className="rounded bg-gray-400 p-1 text-white"><X size={12} /></button>
                                </div>
                              </div>
                            ) : meal ? (
                              <div className="group relative space-y-0.5 text-sm">
                                <p className="font-semibold text-gray-700">B: {meal.breakfast.toFixed(1)}</p>
                                <p className="font-semibold text-gray-700">L: {meal.lunch.toFixed(1)}</p>
                                <p className="font-semibold text-gray-700">D: {meal.dinner.toFixed(1)}</p>
                                <p className="border-t border-gray-100 pt-1 font-black text-gray-900">T: {(meal.breakfast + meal.lunch + meal.dinner).toFixed(1)}</p>
                                <div className="mt-2 flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => handleEdit(date, member.userId, meal)} className="text-gray-500 hover:text-gray-900"><Pencil size={14} /></button>
                                  <button onClick={() => deleteMealMutation.mutate(meal.id)} className="text-gray-500 hover:text-red-600"><Trash2 size={14} /></button>
                                </div>
                              </div>
                            ) : (
                              <button onClick={() => handleEdit(date, member.userId)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 text-gray-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600">
                                <Plus size={14} />
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {dates.length > visibleDays && (
            <div className="flex justify-center bg-gray-50/50 p-6">
              <Button
                variant="outline"
                onClick={() => setVisibleDays((current: number) => current + 5)}
                className="h-12 rounded-2xl border-2 border-gray-900 px-12 font-black uppercase tracking-widest hover:bg-gray-900 hover:text-white"
              >
                Load 5 More Days
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'deposits' && (
        <DataTableCard
          columns={['Date', 'Member', 'Amount', 'Method']}
          rows={deposits.map((deposit) => [
            format(new Date(deposit.date), 'dd MMM'),
            resolveMemberName(deposit.memberId, members),
            `${deposit.amount.toFixed(2)} ৳`,
            deposit.method || 'Cash',
          ])}
          emptyText="No deposits recorded for this month."
        />
      )}

      {activeTab === 'mealCosts' && (
        <DataTableCard
          columns={['Date', 'Cost Name', 'Amount', 'Type']}
          rows={mealCosts.map((cost) => [
            format(new Date(cost.createdAt), 'dd MMM'),
            cost.name,
            `${cost.amount.toFixed(2)} ৳`,
            cost.type,
          ])}
          emptyText="No meal-related costs recorded for this month."
        />
      )}

      {activeTab === 'individualCosts' && (
        <DataTableCard
          columns={['Date', 'Cost Name', 'Member', 'Amount']}
          rows={individualCosts.map((cost) => [
            format(new Date(cost.createdAt), 'dd MMM'),
            cost.name,
            resolveMemberName(cost.memberId, members),
            `${cost.amount.toFixed(2)} ৳`,
          ])}
          emptyText="No individual costs recorded for this month."
        />
      )}

      {activeTab === 'sharedCosts' && (
        <DataTableCard
          columns={['Date', 'Cost Name', 'Amount', 'Notes']}
          rows={sharedCosts.map((cost) => [
            format(new Date(cost.createdAt), 'dd MMM'),
            cost.name,
            `${cost.amount.toFixed(2)} ৳`,
            cost.details || '-',
          ])}
          emptyText="No shared costs recorded for this month."
        />
      )}
    </div>
  );
}

function DataTableCard({
  columns,
  rows,
  emptyText,
}: {
  columns: string[];
  rows: string[][];
  emptyText: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              {columns.map((column) => (
                <th key={column} className="px-4 py-4 text-xs font-black uppercase tracking-wide text-gray-500">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? rows.map((row, index) => (
              <tr key={`${row[0]}-${index}`} className="border-b border-gray-100 last:border-b-0">
                {row.map((cell, cellIndex) => (
                  <td key={`${cell}-${cellIndex}`} className="px-4 py-4 text-sm font-medium text-gray-700">
                    {cell}
                  </td>
                ))}
              </tr>
            )) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-gray-500">
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function resolveMemberName(memberId: string | undefined, members: MessMember[]) {
  if (!memberId) return 'Not assigned';
  const member = members.find((item) => item.userId === memberId || item.id === memberId);
  return member ? getMemberName(member) : 'Unknown member';
}

function getMemberName(member: MessMember) {
  return `${member.user.firstName} ${member.user.lastName}`.trim();
}
