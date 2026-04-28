import { useState } from 'react';
import { useBazar } from '@/hooks/useBazar';
import { useMessQuery } from '@/hooks/useMess';
import { useMessStore } from '@/stores/messStore';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { ShoppingCart, CalendarDays, User, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface BazarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BazarModal({ isOpen, onClose }: BazarModalProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const { assignMemberMutation } = useBazar();
  const { getMembersQuery } = useMessQuery();
  const { activeMonth } = useMessStore();

  const handleAssign = async () => {
    if (!date || !selectedMemberId || !activeMonth) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select both a date and a member.",
      });
      return;
    }

    try {
      await assignMemberMutation.mutateAsync({
        monthId: activeMonth.id,
        date: date.toISOString(),
        memberId: selectedMemberId,
      });
      toast({
        title: "Assignment Successful",
        description: `Bazar duty assigned for ${format(date, 'PPP')}`,
      });
      onClose();
    } catch (e: unknown) { const error = e as Error & { response?: { data?: { message?: string } } };
      toast({
        variant: "destructive",
        title: "Assignment Failed",
        description: error.message || "An unexpected error occurred.",
      });
    }
  };

  const members = getMembersQuery.data || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
        <div className="bg-gradient-to-br from-red-600 to-orange-500 p-8 text-white relative">
           <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              <ShoppingCart size={28} />
              Assign Bazar Duty
            </DialogTitle>
          </DialogHeader>
          <p className="mt-2 text-red-50 text-sm font-medium opacity-90">Select a date and choose a member responsible for shopping.</p>
          <div className="absolute -right-6 -bottom-6 opacity-10">
             <ShoppingCart size={120} />
          </div>
        </div>

        <div className="p-8 space-y-8 bg-white">
          <div className="space-y-4">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <CalendarDays size={14} />
              Select Date
            </label>
            <div className="border border-gray-100 rounded-2xl p-2 bg-gray-50/50">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-xl mx-auto"
                disabled={(date: Date) => {
                   if (!activeMonth) return true;
                   const start = new Date(activeMonth.startDate);
                   const end = new Date(activeMonth.endDate);
                   return date < start || date > end;
                }}
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <User size={14} />
              Select Member
            </label>
            <Select onValueChange={setSelectedMemberId} value={selectedMemberId}>
              <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-gray-100 focus:ring-red-500 font-bold">
                <SelectValue placeholder="Choose a member" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-100">
                {members.map((member: import("@/types/common").MessMember) => (
                  <SelectItem key={member.id} value={member.id} className="font-bold py-3">
                    {member.user.firstName} {member.user.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1 h-12 rounded-xl font-bold border-gray-100 hover:bg-gray-50 transition-all"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAssign}
              disabled={assignMemberMutation.isPending}
              className="flex-1 h-12 rounded-xl font-black bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-100 transition-all"
            >
              {assignMemberMutation.isPending ? <Loader2 className="animate-spin" /> : 'Confirm Assignment'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
