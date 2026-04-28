import { useDashboard } from '@/hooks/useDashboard';
import { useMessStore } from '@/stores/messStore';
import { useDashboardStore } from '@/stores/dashboardStore';
import { useAuthStore } from '@/stores/authStore';
import { useBazar } from '@/hooks/useBazar';
import { useState } from 'react';
import BazarModal from '@/components/modals/BazarModal';
import { format, isToday, isTomorrow } from 'date-fns';
import { 
  Utensils, 
  Wallet, 
  Receipt, 
  CreditCard, 
  Users, 
  ChevronRight,
  Printer,
  ShoppingCart,
  Calendar,
  Trash2,
  Plus
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { messId, messName } = useMessStore();
  const { isLoading } = useDashboard(messId || undefined);
  const { overview, membersSummary } = useDashboardStore();
  const { upcomingDatesQuery, myDatesQuery, removeAssignmentMutation } = useBazar();
  const [isBazarModalOpen, setIsBazarModalOpen] = useState(false);

  if (isLoading && !overview) {
    return <DashboardSkeleton />;
  }

  const myStats = membersSummary.find(m => m.id === user?.id) || {
    totalMeals: 0,
    totalDeposits: 0,
    totalMealCost: 0,
    balance: 0
  };

  const myUpcomingBazar = myDatesQuery.data?.[0];
  const upcomingBazarList = upcomingDatesQuery.data || [];

  const accountCards = [
    { label: 'Total Meals', value: myStats.totalMeals.toFixed(2), icon: Utensils, color: 'bg-sky-400', textColor: 'text-sky-400' },
    { label: 'Total Deposits', value: `${myStats.totalDeposits.toFixed(2)} ৳`, icon: Wallet, color: 'bg-teal-400', textColor: 'text-teal-400' },
    { label: 'Total Individual Costs', value: `${(myStats.totalMealCost || 0).toFixed(2)} ৳`, icon: Receipt, color: 'bg-rose-400', textColor: 'text-rose-400' },
    { label: 'My Balance', value: `${(myStats.balance || 0).toFixed(2)} ৳`, icon: CreditCard, color: 'bg-yellow-200', textColor: 'text-yellow-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 leading-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Overview of your active mess and personal summary</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Link to="/members" className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all w-full sm:w-auto shadow-md">
            Manage Members <ChevronRight size={18} />
          </Link>
        </div>
      </div>

      {/* Top Banner Row */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-red-600 rounded-full inline-block"></span>
              {messName || 'Bachelor Mess'}, {overview?.monthName || 'Active Month'} (Running)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 text-sm text-gray-600">
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                 <span>Mess Balance: <strong>{(overview?.totalBalance || 0).toFixed(2)} ৳</strong></span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                 <span>Overall Deposits: <strong>{(overview?.totalDeposits || 0).toFixed(2)} ৳</strong></span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                 <span>Total Meals: <strong>{(overview?.totalMeals || 0).toFixed(1)}</strong></span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                 <span>Meal Expenses: <strong>{(overview?.totalMealCost || 0).toFixed(2)} ৳</strong></span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                 <span>Current Meal Rate: <strong>{(overview?.averageMealCost || 0).toFixed(2)} ৳</strong></span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                 <span>Print Monthly Summary: <Printer size={16} className="inline ml-1 text-red-500 cursor-pointer" /></span>
               </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-50/50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
        </div>

        {/* My Account Summary Box */}
        <div className="flex-1 space-y-4">
           <h3 className="text-lg font-bold text-rose-600 flex items-center gap-2 ml-1">
             <span className="block w-1 h-4 bg-rose-600 rounded-full"></span>
             My Account Summary
           </h3>
           <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-4">
              {accountCards.map((card, idx) => (
                <div key={idx} className={cn(
                  "rounded-2xl p-4 flex flex-col justify-between h-32 shadow-sm border border-black/5 transition-transform hover:-translate-y-1 duration-300",
                  card.color
                )}>
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-bold text-gray-800/80 uppercase tracking-wider">{card.label}</span>
                    <card.icon size={18} className="text-gray-900/40" />
                  </div>
                  <p className="text-lg font-black text-gray-900 leading-none">{card.value}</p>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Bazar Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* My Next Bazar */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center relative overflow-hidden group">
           <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 mb-6 group-hover:scale-110 transition-transform duration-500">
             <ShoppingCart size={40} />
           </div>
           <h4 className="text-xl font-black text-gray-900 mb-2">My Bazar Schedule</h4>
           {myUpcomingBazar ? (
             <div className="space-y-4">
                <div className="bg-red-500 text-white px-6 py-2 rounded-xl font-black text-xl shadow-lg shadow-red-100">
                  {format(new Date(myUpcomingBazar.date), 'PPPP')}
                  <div className="text-[10px] mt-1 opacity-80 uppercase tracking-widest">
                    {isToday(new Date(myUpcomingBazar.date)) ? 'Today' : isTomorrow(new Date(myUpcomingBazar.date)) ? 'Tomorrow' : 'Upcoming'}
                  </div>
                </div>
                <p className="text-sm text-gray-500 font-medium">Please ensure you have the funds and list ready!</p>
             </div>
           ) : (
             <div className="space-y-4">
                <p className="text-gray-400 font-bold max-w-xs mx-auto">No shopping duties assigned to you yet.</p>
                <Button 
                  onClick={() => setIsBazarModalOpen(true)}
                  variant="outline" 
                  className="rounded-xl border-red-100 bg-red-50 hover:bg-red-100 text-red-600 font-bold px-8"
                >
                  <Plus size={18} className="mr-2" /> Assign Now
                </Button>
             </div>
           )}
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
        </div>

        {/* Global Bazar Schedule */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                    <Calendar size={20} />
                 </div>
                 <h2 className="text-xl font-bold text-gray-900">Upcoming Shopping Duties</h2>
              </div>
              <Button 
                onClick={() => setIsBazarModalOpen(true)}
                className="h-10 px-4 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-all text-sm"
              >
                Schedule Bazar
              </Button>
           </div>
           
           <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
              {upcomingBazarList.length > 0 ? upcomingBazarList.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-red-100 transition-all group">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center font-black text-gray-400 overflow-hidden">
                        {assignment.member?.user?.profilePicture ? <img src={assignment.member.user.profilePicture} alt="" className="w-full h-full object-cover" /> : assignment.member?.user?.firstName?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900 leading-tight">
                          {assignment.member ? `${assignment.member.user.firstName} ${assignment.member.user.lastName}`.trim() : 'Unassigned member'}
                        </p>
                        <p className="text-[11px] text-gray-500 font-bold">{format(new Date(assignment.date), 'EEEE, MMM do')}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      {isToday(new Date(assignment.date)) && (
                        <span className="text-[9px] font-black uppercase tracking-widest bg-orange-100 text-orange-600 px-2 py-1 rounded-lg border border-orange-200">Today</span>
                      )}
                      <button 
                        onClick={() => removeAssignmentMutation.mutate(assignment.id)}
                        className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all font-bold"
                        title="Remove assignment"
                      >
                         <Trash2 size={16} />
                      </button>
                   </div>
                </div>
              )) : (
                <div className="text-center py-10">
                   <p className="text-gray-400 font-bold text-sm">No shopping dates scheduled yet.</p>
                </div>
              )}
           </div>
        </div>
      </div>

      <BazarModal isOpen={isBazarModalOpen} onClose={() => setIsBazarModalOpen(false)} />

      {/* Members Grid */}
      <div className="space-y-6">
        <div className="text-center">
           <h3 className="text-rose-600 font-black text-2xl uppercase tracking-widest">Mess Members Statistics</h3>
           <p className="text-gray-400 text-xs font-bold mt-1">Total {membersSummary.length} Members Contributing</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {membersSummary.map((member) => (
            <div key={member.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-red-100 transition-all hover:shadow-xl hover:shadow-red-50/50 group">
              <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                     <Users size={20} />
                  </div>
                  <h4 className="font-black text-lg text-rose-600">{member.name}</h4>
                </div>
                <div className="flex items-center gap-1 text-[10px] bg-sky-50 text-sky-600 px-2 py-1 rounded-full font-black uppercase tracking-tight">
                   Active <ChevronRight size={10} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-[11px]">
                  <div className="space-y-0.5">
                    <p className="text-gray-400 font-bold">Total meals: <span className="text-gray-800">{member.totalMeals.toFixed(2)}</span></p>
                    <p className="text-gray-400 font-bold">Meal cost: <span className="text-gray-800">{(member.totalMealCost || 0).toFixed(2)} ৳</span></p>
                    <p className="text-gray-400 font-bold">Individual extra cost: <span className="text-gray-800">0.00 ৳</span></p>
                    <div className="mt-2 inline-block bg-rose-50 px-2 py-1 rounded-lg">
                      <p className="text-rose-600 font-black">Balance: {member.balance.toFixed(2)} ৳</p>
                    </div>
                  </div>
                  <div className="space-y-0.5 text-right lg:text-left">
                    <p className="text-gray-400 font-bold">Total deposits: <span className="text-gray-800">{member.totalDeposits.toFixed(2)} ৳</span></p>
                    <p className="text-gray-400 font-bold">Shared extra cost: <span className="text-gray-800">0.00 ৳</span></p>
                    <p className="text-gray-400 font-bold">Total cost: <span className="text-gray-800">{(member.totalMealCost || 0).toFixed(2)} ৳</span></p>
                  </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-48 rounded-2xl w-full" />
        <Skeleton className="h-48 rounded-2xl w-full" />
      </div>
      <Skeleton className="h-40 rounded-3xl max-w-xl mx-auto w-full" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 rounded-2xl w-full" />)}
      </div>
    </div>
  );
}
