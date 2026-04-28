import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMessQuery } from '@/hooks/useMess';
import { useMonthQuery } from '@/hooks/useMonth';
import { useAuthStore } from '@/stores/authStore';
import { useMessStore } from '@/stores/messStore';
import { Home, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';

/**
 * Onboarding Page
 * 
 * Guides new users through the setup of their Mess and the initial billing month.
 */

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const { messId, activeMonth } = useMessStore();
  const { createMessMutation } = useMessQuery();
  const { createMonthMutation } = useMonthQuery();

  const [step, setStep] = useState<'mess' | 'month'>('mess');
  const [messName, setMessName] = useState('');
  const [monthName, setMonthName] = useState('');

  useEffect(() => {
    if (activeMonth || user?.hasActiveMonth) {
      navigate('/dashboard', { replace: true });
      return;
    }

    if (messId) {
      setStep('month');
    } else {
      setStep('mess');
    }
  }, [activeMonth, messId, navigate, user?.hasActiveMonth]);

  const handleCreateMess = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMessMutation.mutateAsync({ name: messName });
      setStep('month');
    } catch (err) {
      console.error('Mess creation failed', err);
    }
  };

  const handleCreateMonth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const currentMessId = messId || createMessMutation.data?.id;
      if (!currentMessId) {
        throw new Error('Mess must be created before creating a month');
      }

      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      await createMonthMutation.mutateAsync({
        messId: currentMessId,
        name: monthName,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      
      // Update local user state to reflect active month status
      if (user && user.hasActiveMonth !== true) {
        setUser({ ...user, hasActiveMonth: true });
      }
      
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Month activation failed', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Progress Tracker */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className={`p-2 rounded-full ${step === 'mess' ? 'bg-red-600 text-white shadow-lg shadow-red-100' : 'bg-green-100 text-green-600'}`}>
            {step === 'mess' ? <Home size={24} /> : <CheckCircle2 size={24} />}
          </div>
          <div className="w-12 h-0.5 bg-gray-200"></div>
          <div className={`p-2 rounded-full ${step === 'month' ? 'bg-red-600 text-white shadow-lg shadow-red-100' : 'bg-gray-100 text-gray-300'}`}>
            <Calendar size={24} />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 p-10 border border-gray-100">
          {step === 'mess' ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Mess</h1>
              <p className="text-gray-500 mb-10 text-lg leading-relaxed">
                Start by giving your shared living space a unique name. This will be the home for your members and expenses.
              </p>

              <form noValidate onSubmit={handleCreateMess} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-gray-700 ml-1">
                    Mess Name
                  </label>
                  <input
                    type="text"
                    value={messName}
                    onChange={(e) => setMessName(e.target.value)}
                    placeholder="e.g., Eagle House, Silicon Valley Mess"
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white outline-none transition-all text-gray-900 font-medium"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={createMessMutation.isPending || !messName}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-red-600 text-white rounded-2xl hover:bg-red-700 disabled:opacity-50 font-bold text-lg shadow-lg shadow-red-100 transition-all active:scale-[0.98]"
                >
                  {createMessMutation.isPending ? 'Creating Mess...' : 'Continue'}
                  <ArrowRight size={20} />
                </button>
              </form>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">First Cycle</h1>
              <p className="text-gray-500 mb-10 text-lg leading-relaxed">
                Excellent! Now let's name your first billing month to start tracking attendance and costs.
              </p>

              <form noValidate onSubmit={handleCreateMonth} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-gray-700 ml-1">
                    Monthly Billing Period
                  </label>
                  <input
                    type="text"
                    value={monthName}
                    onChange={(e) => setMonthName(e.target.value)}
                    placeholder="e.g., April 2026, Startup Phase"
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white outline-none transition-all text-gray-900 font-medium"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={createMonthMutation.isPending || !monthName}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-red-600 text-white rounded-2xl hover:bg-red-700 disabled:opacity-50 font-bold text-lg shadow-lg shadow-red-100 transition-all active:scale-[0.98]"
                >
                  {createMonthMutation.isPending ? 'Activating Month...' : 'Start Managing'}
                  <ArrowRight size={20} />
                </button>
              </form>
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-center gap-2 text-sm text-gray-400">
            <CheckCircle2 size={16} className="text-green-500" />
            Join 10,000+ members managing their mess with Meso.
          </div>
        </div>
      </div>
    </div>
  );
}
