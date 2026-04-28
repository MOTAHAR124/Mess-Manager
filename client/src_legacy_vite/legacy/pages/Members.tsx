import { useState } from 'react';
import { useMessQuery } from '@/hooks/useMess';
import { useMessStore } from '@/stores/messStore';
import { 
  UserPlus, 
  Trash2, 
  Users, 
  Mail, 
  ShieldCheck, 
  User,
  Loader2,
  AlertCircle,
  Pencil,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { memberService } from '@/services/memberService';
import { Role } from '@/types/common';

export default function MembersPage() {
  const { getMembersQuery, addMemberMutation, removeMemberMutation } = useMessQuery();
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingFirstName, setEditingFirstName] = useState('');
  const [editingLastName, setEditingLastName] = useState('');
  const [editingRole, setEditingRole] = useState<Role>(Role.MEMBER);
  const { messId } = useMessStore();

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messId) return;

    try {
      await addMemberMutation.mutateAsync({
        email: newMemberEmail,
        firstName,
        lastName,
        messId,
      });
      setNewMemberEmail('');
      setFirstName('');
      setLastName('');
      toast({
        title: "Member added",
        description: `${firstName || newMemberEmail} was added to the mess successfully.`,
      });
    } catch (e: unknown) { const err = e as Error & { response?: { data?: { message?: string } } };
      toast({
        variant: "destructive",
        title: "Request failed",
        description: err.message || "Could not add the member.",
      });
    }
  };

  if (getMembersQuery.isLoading && !getMembersQuery.data) {
    return <MembersSkeleton />;
  }

  const memberList = getMembersQuery.data || [];
  const startEdit = (member: import("@/types/common").MessMember) => {
    setEditingMemberId(member.id);
    setEditingFirstName(member.user.firstName);
    setEditingLastName(member.user.lastName);
    setEditingRole(member.role);
  };

  const handleUpdateMember = async () => {
    if (!editingMemberId) return;

    try {
      await memberService.updateMember(editingMemberId, {
        firstName: editingFirstName,
        lastName: editingLastName,
        role: editingRole,
      });
      await getMembersQuery.refetch();
      toast({
        title: 'Member updated',
        description: 'The member information has been saved.',
      });
      setEditingMemberId(null);
    } catch (e: unknown) { const error = e as Error & { response?: { data?: { message?: string } } };
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error.message || 'Could not update the member.',
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 leading-tight">Members</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Manage everyone who belongs to this mess.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Link to="/meals" className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all w-full sm:w-auto shadow-md">
            Manage Meals <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Member Section */}
        <div className="lg:col-span-1">
           <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 sticky top-8">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-6">
                <UserPlus size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Add Member</h2>
              <p className="text-sm text-gray-500 mb-8">Create a member directly with name and email. No invite flow is required.</p>
              
              <form onSubmit={handleAddMember} className="space-y-4">
                <div className="flex gap-3">
                  <Input 
                    placeholder="First name" 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-12 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-red-500 transition-all font-bold"
                  />
                  <Input 
                    placeholder="Last name" 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-12 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-red-500 transition-all font-bold"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input 
                    type="email" 
                    placeholder="Email address" 
                    value={newMemberEmail} 
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    className="pl-12 h-12 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-red-500 transition-all font-bold"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={addMemberMutation.isPending}
                  className="w-full h-12 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-100 transition-all"
                >
                  {addMemberMutation.isPending ? <Loader2 className="animate-spin" /> : 'Add Member'}
                </Button>
              </form>

              <div className="mt-8 p-4 bg-orange-50 rounded-2xl border border-orange-100 flex gap-3">
                 <AlertCircle className="text-orange-500 shrink-0" size={20} />
                 <p className="text-[11px] text-orange-700 font-medium leading-relaxed">
                   A directly added member can log in with the same email and access this mess without a separate invitation step.
                 </p>
              </div>
           </div>
        </div>

        {/* Members List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                      <Users size={20} />
                   </div>
                   <h2 className="text-xl font-bold text-gray-900">Member Directory</h2>
                </div>
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">
                  Total {memberList.length}
                </span>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {memberList.map((member: import("@/types/common").MessMember) => (
                  <div key={member.id} className="group p-5 bg-white rounded-2xl border border-gray-50 hover:border-red-100 hover:shadow-xl hover:shadow-red-50/20 transition-all flex flex-col justify-between">
                    <div className="flex items-start justify-between mb-4">
                       <div className="w-12 h-12 bg-gradient-to-tr from-gray-100 to-gray-50 rounded-xl flex items-center justify-center text-lg font-black text-gray-400 group-hover:from-red-600 group-hover:to-orange-500 group-hover:text-white transition-all duration-500 shadow-inner">
                          {member.user.firstName.charAt(0)}
                       </div>
                       {member.role === 'MANAGER' ? (
                         <div className="bg-red-50 text-red-600 text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-1 uppercase tracking-tighter">
                            <ShieldCheck size={12} /> Manager
                         </div>
                       ) : (
                         <div className="bg-sky-50 text-sky-600 text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-1 uppercase tracking-tighter">
                            <User size={12} /> Member
                         </div>
                       )}
                    </div>
                    
                    <div className="space-y-2">
                      {editingMemberId === member.id ? (
                        <>
                          <div className="flex gap-2">
                            <Input value={editingFirstName} onChange={(e) => setEditingFirstName(e.target.value)} />
                            <Input value={editingLastName} onChange={(e) => setEditingLastName(e.target.value)} />
                          </div>
                          <select
                            value={editingRole}
                            onChange={(e) => setEditingRole(e.target.value as Role)}
                            className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm font-medium"
                          >
                            <option value={Role.MEMBER}>Member</option>
                            <option value={Role.MANAGER}>Manager</option>
                          </select>
                        </>
                      ) : (
                        <>
                          <h4 className="font-bold text-gray-900 group-hover:text-red-600 transition-colors uppercase tracking-tight">{member.user.firstName} {member.user.lastName}</h4>
                          <p className="text-xs text-gray-400 font-medium truncate">{member.user.email}</p>
                        </>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                       <div className="text-[10px] font-bold text-gray-300">ID: {member.id.slice(-8).toUpperCase()}</div>
                       <div className="flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all translate-y-0 lg:translate-y-2 lg:group-hover:translate-y-0 duration-300">
                          {editingMemberId === member.id ? (
                            <Button variant="ghost" size="sm" className="text-green-600" onClick={handleUpdateMember}>
                              Save
                            </Button>
                          ) : (
                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50" onClick={() => startEdit(member)}>
                              <Pencil size={16} />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50">
                             <Trash2 size={16} onClick={() => removeMemberMutation.mutate(member.id)} />
                          </Button>
                       </div>
                    </div>
                  </div>
                ))}
             </div>

             {memberList.length === 0 && (
               <div className="py-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto text-gray-200">
                    <Users size={40} />
                  </div>
                  <p className="text-gray-400 font-bold">No members have been added yet.</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MembersSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <Skeleton className="h-20 rounded-3xl w-full" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Skeleton className="h-[400px] rounded-3xl w-full" />
        <Skeleton className="lg:col-span-2 h-[400px] rounded-3xl w-full" />
      </div>
    </div>
  );
}
