import { useState } from 'react';
import { useMonthQuery } from '@/hooks/useMonth';
import { useMessStore } from '@/stores/messStore';
import { 
  Calendar, 
  ChevronRight, 
  CheckCircle, 
  Clock, 
  BarChart3,
  CalendarDays,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

export default function HistoryPage() {
  const { activeMonth, messId } = useMessStore();
  const { getMonthsQuery, createMonthMutation, deleteMonthMutation, switchMonthMutation } = useMonthQuery();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [monthName, setMonthName] = useState(format(new Date(), 'MMMM yyyy'));
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-01'));
  const [endDate, setEndDate] = useState(format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), 'yyyy-MM-dd'));

  if (getMonthsQuery.isLoading && !getMonthsQuery.data) {
    return <HistorySkeleton />;
  }

  const months = getMonthsQuery.data || [];
  const handleCreateMonth = async () => {
    if (!messId) return;

    try {
      await createMonthMutation.mutateAsync({
        messId,
        name: monthName.trim(),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      });
      toast({
        title: 'Month created',
        description: `${monthName.trim()} is now available in your workspace.`,
      });
      setIsCreateDialogOpen(false);
    } catch (e: unknown) { const error = e as Error & { response?: { data?: { message?: string } } };
      toast({
        variant: 'destructive',
        title: 'Could not create month',
        description: error.message || 'Month creation failed.',
      });
    }
  };

  const handleDeleteMonth = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMonthMutation.mutateAsync(deleteTarget.id);
      toast({
        title: 'Month deleted',
        description: `${deleteTarget.name} has been removed.`,
      });
      setDeleteTarget(null);
    } catch (e: unknown) { const error = e as Error & { response?: { data?: { message?: string } } };
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: error.message || 'Could not delete the month.',
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 leading-tight">All Months</h1>
          <p className="text-sm text-gray-500 font-medium">Browse every billing cycle in your mess workspace.</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-100 gap-2">
          <CalendarDays size={18} />
          <span>Start New Month</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {months.map((month) => {
          const isActive = month.id === activeMonth?.id;
          const status = month.status;

          return (
            <div 
              key={month.id} 
              className={cn(
                "group relative p-6 bg-white rounded-3xl border transition-all duration-300 hover:shadow-xl",
                isActive ? "border-red-200 shadow-md ring-1 ring-red-100" : "border-gray-50 hover:border-gray-200"
              )}
            >
              <div className="flex items-start justify-between mb-6">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                  isActive ? "bg-red-600 text-white" : "bg-gray-50 text-gray-400 group-hover:bg-gray-100"
                )}>
                  <Calendar size={24} />
                </div>
                {isActive ? (
                  <span className="bg-green-50 text-green-600 text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-1 uppercase tracking-tighter">
                    <CheckCircle size={12} /> Active
                  </span>
                ) : (
                  <span className="bg-gray-50 text-gray-400 text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-1 uppercase tracking-tighter">
                    <Clock size={12} /> {status}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors uppercase tracking-tight">
                  {month.name}
                </h3>
                <p className="text-xs text-gray-400 font-medium">
                  {format(new Date(month.startDate), 'MMM dd')} - {format(new Date(month.endDate), 'MMM dd')}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-300 uppercase">Records</span>
                    <span className="text-sm font-bold text-gray-700">Detailed Data</span>
                 </div>
                 <div className="flex items-center gap-2">
                    {!isActive && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => switchMonthMutation.mutate(month.id)}
                        className="w-10 h-10 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <ChevronRight size={20} />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTarget({ id: month.id, name: month.name })}
                      className="w-10 h-10 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={18} />
                    </Button>
                 </div>
              </div>

              {isActive && (
                <div className="absolute top-0 right-0 p-2">
                   <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
                </div>
              )}
            </div>
          );
        })}

        {months.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4 bg-white rounded-3xl border border-dashed border-gray-200">
             <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto text-gray-200">
                <BarChart3 size={40} />
             </div>
             <p className="text-gray-400 font-bold">No month history found yet.</p>
          </div>
        )}
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">Delete month?</h2>
            <p className="mt-2 text-sm text-gray-600">
              This will permanently delete {deleteTarget.name} and all of its meals, costs, deposits, and settlement data.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button onClick={handleDeleteMonth} className="bg-red-600 hover:bg-red-700">
                Yes, delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {isCreateDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">Create new month</h2>
            <p className="mt-2 text-sm text-gray-600">
              Choose a unique month name and the billing period dates.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Month name</label>
                <input
                  value={monthName}
                  onChange={(e) => setMonthName(e.target.value)}
                  className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm font-medium"
                  placeholder="April 2026"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Start date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">End date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateMonth}
                disabled={!monthName.trim() || !startDate || !endDate || createMonthMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                Create month
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HistorySkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <Skeleton className="h-20 rounded-3xl w-full" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-3xl w-full" />)}
      </div>
    </div>
  );
}
