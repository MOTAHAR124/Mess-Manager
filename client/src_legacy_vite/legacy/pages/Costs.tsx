import { useState } from 'react';
import { useCost } from '@/hooks/useCost';
import { useMessStore } from '@/stores/messStore';
import { useCostStore } from '@/stores/costStore';
import { Plus, Trash2, Receipt, Tags, Share2, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { CostType } from '@/types/common';

export default function CostsPage() {
  const { activeMonth, messId, members } = useMessStore();
  const { isLoading, createCostMutation, updateCostMutation, deleteCostMutation } = useCost(activeMonth?.id || '');
  const { costs } = useCostStore();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('GROCERY');
  const [type, setType] = useState<CostType>(CostType.SHARED);
  const [memberId, setMemberId] = useState('');
  const [editingCostId, setEditingCostId] = useState<string | null>(null);

  const handleAddCost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMonth || !messId) return;
    if (type === CostType.INDIVIDUAL && !memberId) return;

    await createCostMutation.mutateAsync({
      monthId: activeMonth.id,
      messId: messId,
      name: description,
      amount: parseFloat(amount),
      details: `${category}: ${description}`,
      type,
      memberId: type === CostType.INDIVIDUAL ? memberId : undefined,
    });

    setAmount('');
    setDescription('');
    setMemberId('');
  };

  const handleEditCost = (cost: import("@/types/common").Cost) => {
    setEditingCostId(cost.id);
    setAmount(String(cost.amount));
    setDescription(cost.name);
    setType(cost.type);
    setMemberId(cost.memberId || '');
  };

  const handleUpdateCost = async () => {
    if (!editingCostId || !activeMonth || !messId) return;
    await updateCostMutation.mutateAsync({
      id: editingCostId,
      data: {
        monthId: activeMonth.id,
        messId,
        name: description,
        amount: parseFloat(amount),
        details: `${category}: ${description}`,
        type,
        memberId: type === CostType.INDIVIDUAL ? memberId : undefined,
      },
    });
    setEditingCostId(null);
    setAmount('');
    setDescription('');
    setMemberId('');
  };

  if (isLoading && costs.length === 0) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 leading-tight">Expenses</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Trace and log costs for {activeMonth?.name}</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Link to="/deposits" className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all w-full sm:w-auto shadow-md">
            Record Deposits <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Cost Form */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Plus size={20} className="text-red-500" /> Log New Expense
          </h2>
          <form onSubmit={editingCostId ? (e) => { e.preventDefault(); void handleUpdateCost(); } : handleAddCost} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Amount (৳)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Marketing, Rent, Utilities..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              >
                <option value="GROCERY">Grocery</option>
                <option value="MARKETING">Marketing</option>
                <option value="UTILITIES">Utilities</option>
                <option value="RENT">Rent</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Cost Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType(CostType.SHARED)}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition-all ${
                    type === CostType.SHARED 
                    ? 'bg-red-50 border-red-200 text-red-600' 
                    : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <Share2 size={16} /> Shared
                </button>
                <button
                  type="button"
                  onClick={() => setType(CostType.INDIVIDUAL)}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition-all ${
                    type === CostType.INDIVIDUAL 
                    ? 'bg-red-50 border-red-200 text-red-600' 
                    : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <User size={16} /> Personal
                </button>
              </div>
            </div>
            {type === CostType.INDIVIDUAL && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Member</label>
                <select
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                  required
                >
                  <option value="">Choose a member...</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.userId}>
                      {member.user.firstName} {member.user.lastName}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button
              type="submit"
              disabled={createCostMutation.isPending || (type === CostType.INDIVIDUAL && !memberId)}
              className="w-full py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold transition-all shadow-md shadow-red-100 disabled:opacity-50 mt-2"
            >
              {editingCostId ? 'Update Expense' : 'Add Expense'}
            </button>
            {editingCostId && (
              <button
                type="button"
                onClick={() => {
                  setEditingCostId(null);
                  setAmount('');
                  setDescription('');
                  setMemberId('');
                }}
                className="w-full py-3 border border-gray-200 rounded-xl font-bold"
              >
                Cancel Edit
              </button>
            )}
          </form>
        </div>

        {/* Expenses List */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <Receipt size={20} className="text-gray-400" />
            <h2 className="text-lg font-bold text-gray-900">Expense History</h2>
          </div>
          <div className="space-y-3">
            {costs.map((cost) => (
              <div
                key={cost.id}
                className="group flex items-center justify-between p-4 border border-gray-50 rounded-2xl hover:bg-gray-50/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:shadow-sm transition-all">
                    <Tags size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{cost.name}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      {cost.details && (
                        <>
                          <span className="bg-gray-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter text-[10px]">
                            {cost.details}
                          </span>
                          <span>•</span>
                        </>
                      )}
                      <span className={cost.type === 'SHARED' ? 'text-blue-600 font-semibold' : 'text-orange-600 font-semibold'}>
                        {cost.type}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <p className="text-lg font-bold text-gray-900">{cost.amount} ৳</p>
                  <button
                    onClick={() => handleEditCost(cost)}
                    className="p-2.5 hover:bg-blue-50 rounded-xl text-blue-600 transition-all opacity-0 group-hover:opacity-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteCostMutation.mutate(cost.id)}
                    className="p-2.5 hover:bg-red-50 rounded-xl text-red-600 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {costs.length === 0 && (
              <div className="py-20 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 text-gray-300 mb-4">
                  <Receipt size={32} />
                </div>
                <p className="text-gray-500 font-medium">No expenses recorded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
