import { useState } from 'react';
import { useDeposit } from '@/hooks/useDeposit';
import { useMessStore } from '@/stores/messStore';
import { useDepositStore } from '@/stores/depositStore';
import { Plus, Trash2, Wallet, UserCircle, History, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export default function DepositsPage() {
  const { activeMonth, messId, members } = useMessStore();
  const { isLoading, createDepositMutation, updateDepositMutation, deleteDepositMutation } = useDeposit(activeMonth?.id || '');
  const { deposits } = useDepositStore();

  const [amount, setAmount] = useState('');
  const [memberId, setMemberId] = useState('');
  const [method, setMethod] = useState('CASH');
  const [editingDepositId, setEditingDepositId] = useState<string | null>(null);

  const handleAddDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMonth || !messId || !memberId) return;

    await createDepositMutation.mutateAsync({
      monthId: activeMonth.id,
      messId: messId,
      memberId: memberId,
      amount: parseFloat(amount),
      date: new Date().toISOString(),
      details: `Method: ${method}`,
    });

    setAmount('');
  };

  const handleEditDeposit = (deposit: import("@/types/common").Deposit) => {
    setEditingDepositId(deposit.id);
    setAmount(String(deposit.amount));
    setMemberId(deposit.memberId);
    setMethod((deposit.details || '').replace('Method: ', '') || 'CASH');
  };

  const handleUpdateDeposit = async () => {
    if (!editingDepositId || !activeMonth || !messId || !memberId) return;
    await updateDepositMutation.mutateAsync({
      id: editingDepositId,
      data: {
        memberId,
        amount: parseFloat(amount),
        date: new Date().toISOString(),
        details: `Method: ${method}`,
      },
    });
    setEditingDepositId(null);
    setAmount('');
    setMemberId('');
  };

  if (isLoading && deposits.length === 0) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 leading-tight">Deposits</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Record member contributions for {activeMonth?.name}</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Link to="/settlement" className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all w-full sm:w-auto shadow-md">
            View Settlement <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Record Deposit Form */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-green-500" /> Record Contribution
          </h2>
          <form onSubmit={editingDepositId ? (e) => { e.preventDefault(); void handleUpdateDeposit(); } : handleAddDeposit} className="space-y-4">
             <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Select Member</label>
              <select
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-semibold"
                required
              >
                <option value="">Choose a member...</option>
                {members.map(m => (
                  <option key={m.userId} value={m.userId}>{m.user.firstName} {m.user.lastName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Amount (৳)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-bold text-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Payment Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
              >
                <option value="CASH">Cash</option>
                <option value="BKASH">bKash</option>
                <option value="ROCKET">Rocket</option>
                <option value="NAGAD">Nagad</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={createDepositMutation.isPending}
              className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold transition-all shadow-md shadow-green-100 disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
            >
              <Plus size={20} /> {editingDepositId ? 'Update Deposit' : 'Record Deposit'}
            </button>
            {editingDepositId && (
              <button
                type="button"
                onClick={() => {
                  setEditingDepositId(null);
                  setAmount('');
                  setMemberId('');
                }}
                className="w-full py-3 border border-gray-200 rounded-xl font-bold"
              >
                Cancel Edit
              </button>
            )}
          </form>
        </div>

        {/* Deposits History */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <History size={20} className="text-gray-400" />
            <h2 className="text-lg font-bold text-gray-900">Recent Contributions</h2>
          </div>
          <div className="space-y-4">
            {deposits.map((deposit) => {
              const member = members.find(m => m.userId === deposit.memberId);
              return (
                <div
                  key={deposit.id}
                  className="group flex items-center justify-between p-4 border border-gray-50 rounded-2xl hover:bg-gray-50/50 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 font-bold">
                      <UserCircle size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{member?.user.firstName || 'Unknown'} {member?.user.lastName}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-2">
                        <span>{format(new Date(deposit.date), 'PPp')}</span>
                        {deposit.details && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-green-700">{deposit.details}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <p className="text-xl font-bold text-green-600">+ {deposit.amount} ৳</p>
                    <button
                      onClick={() => handleEditDeposit(deposit)}
                      className="p-2.5 hover:bg-blue-50 rounded-xl text-blue-600 transition-all opacity-0 group-hover:opacity-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteDepositMutation.mutate(deposit.id)}
                      className="p-2.5 hover:bg-red-50 rounded-xl text-red-600 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
            {deposits.length === 0 && (
              <div className="py-20 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 text-gray-300 mb-4">
                  <Wallet size={32} />
                </div>
                <p className="text-gray-500 font-medium">No deposits recorded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
