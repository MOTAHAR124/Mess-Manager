import { useSettlement } from '@/hooks/useSettlement';
import { useMessStore } from '@/stores/messStore';
import { useSettlementStore } from '@/stores/settlementStore';
import { Download, RefreshCw, Calculator, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { reportService } from '@/services/reportService';

/**
 * Settlement Page
 * 
 * Displays the final member breakdown and allows for re-calculation
 * and report generation.
 */

export default function SettlementPage() {
  const { activeMonth } = useMessStore();
  const { isLoading, calculateMutation } = useSettlement(activeMonth?.id);
  const { currentSettlement, getDebts } = useSettlementStore();

  const handleCalculate = () => {
    if (activeMonth?.id) {
      calculateMutation.mutate(activeMonth.id);
    }
  };

  const handleDownloadPdf = async () => {
    if (activeMonth?.id) {
      try {
        await reportService.downloadSettlementPdf(activeMonth.id);
      } catch (err) {
        console.error('Failed to download PDF:', err);
      }
    }
  };

  if ((isLoading && !currentSettlement) || !activeMonth) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const memberData = currentSettlement?.memberBalances || {};
  const debts = getDebts();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 leading-tight">Settlement</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Overview for {activeMonth.name}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button 
            onClick={handleCalculate}
            disabled={calculateMutation.isPending}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 font-bold transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={calculateMutation.isPending ? 'animate-spin' : ''} />
            Recalculate
          </button>
          <button 
            onClick={handleDownloadPdf}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 font-bold transition-colors"
          >
            <Download size={18} />
            Download PDF
          </button>
          <Link to="/dashboard" className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all w-full sm:w-auto shadow-md">
            Back to Dashboard <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600 uppercase tracking-wider mb-1">Meal Rate</p>
          <p className="text-2xl font-bold text-red-600">{(currentSettlement?.mealRate || 0).toFixed(4)}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600 uppercase tracking-wider mb-1">Total Mess Consumption</p>
          <p className="text-2xl font-bold text-gray-900">{currentSettlement?.totalCost || 0} ৳</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600 uppercase tracking-wider mb-1">Total Collective Meals</p>
          <p className="text-2xl font-bold text-gray-900">{currentSettlement?.totalMeals || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Balance Table */}
        <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Calculator size={20} className="text-gray-400" /> Member Breakdown
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                  <th className="pb-3 px-2">Member</th>
                  <th className="pb-3 px-2 text-center">Meals</th>
                  <th className="pb-3 px-2 text-right">Consumption</th>
                  <th className="pb-3 px-2 text-right">Deposited</th>
                  <th className="pb-3 px-2 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {Object.keys(memberData).map((memberId) => {
                  const m = memberData[memberId];
                  return (
                    <tr key={memberId} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-2">
                        <p className="font-semibold text-gray-900">Member {memberId.slice(-4)}</p>
                      </td>
                      <td className="py-4 px-2 text-center text-gray-700">
                        {m.meals}
                      </td>
                      <td className="py-4 px-2 text-right text-gray-700">
                        {m.cost.toFixed(2)} ৳
                      </td>
                      <td className="py-4 px-2 text-right text-gray-700">
                        {m.deposit.toFixed(2)} ৳
                      </td>
                      <td className={`py-4 px-2 text-right font-bold ${m.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {m.balance.toFixed(2)} ৳
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Debt Settlements */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Payment Transfers</h2>
          <div className="space-y-4">
            {debts.map((debt, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-lg flex flex-col gap-2 border border-gray-100">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-red-600 font-bold uppercase tracking-tighter">Pay From</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-green-600 font-bold uppercase tracking-tighter">Pay To</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-600 break-all w-[40%]">Member {debt.from.slice(-4)}</p>
                  <p className="font-bold text-gray-900 text-lg">{debt.amount.toFixed(2)} ৳</p>
                  <p className="text-xs text-gray-600 text-right break-all w-[40%]">Member {debt.to.slice(-4)}</p>
                </div>
              </div>
            ))}
            {debts.length === 0 && (
              <div className="py-12 text-center text-gray-500 italic">
                All accounts are balanced.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
