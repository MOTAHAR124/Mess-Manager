import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/authStore';
import { userService } from '@/services/userService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Camera,
  Loader2,
  CheckCircle2
} from 'lucide-react';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      address: user?.address || '',
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    setIsUpdating(true);
    try {
      const response = await userService.updateProfile(data);
      if (response.success && response.data) {
        setUser(response.data);
        toast({
          title: 'Profile Updated',
          description: 'Your profile information has been successfully updated.',
        });
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (e: unknown) { const error = e as Error & { response?: { data?: { message?: string } } };
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : 'User';

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 leading-tight">Profile</h1>
          <p className="text-gray-500 font-medium">Update your personal information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center">
             <div className="relative group">
                <div className="w-24 h-24 bg-gradient-to-tr from-red-600 to-orange-500 rounded-3xl flex items-center justify-center text-white text-3xl font-bold border-4 border-gray-50 shadow-xl overflow-hidden group-hover:scale-105 transition-transform duration-300">
                  {user?.profilePicture ? <img src={user.profilePicture} alt="" className="w-full h-full object-cover" /> : displayName[0]}
                </div>
                <button className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl shadow-lg border border-gray-100 text-gray-600 hover:text-red-500 transition-colors">
                  <Camera size={16} />
                </button>
             </div>
             <h2 className="mt-6 text-xl font-bold text-gray-900">{displayName}</h2>
             <p className="text-gray-400 font-medium text-sm">Manager</p>
             
             <div className="mt-8 pt-8 border-t border-gray-50 w-full space-y-4">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                   <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                      <Mail size={14} />
                   </div>
                   <span className="truncate">{user?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                   <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={14} />
                   </div>
                   <span>Verified Account</span>
                </div>
             </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-black text-gray-400 uppercase tracking-wider">First Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <UserIcon className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <Input {...field} className="pl-10 h-10 rounded-xl bg-gray-50 border-transparent hover:bg-white hover:border-gray-200 focus:bg-white focus:border-red-500 transition-all font-bold" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-black text-gray-400 uppercase tracking-wider">Last Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <UserIcon className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <Input {...field} className="pl-10 h-10 rounded-xl bg-gray-50 border-transparent hover:bg-white hover:border-gray-200 focus:bg-white focus:border-red-500 transition-all font-bold" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black text-gray-400 uppercase tracking-wider">Phone Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 text-gray-400" size={18} />
                          <Input {...field} placeholder="+8801..." className="pl-10 h-10 rounded-xl bg-gray-50 border-transparent hover:bg-white hover:border-gray-200 focus:bg-white focus:border-red-500 transition-all font-bold" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black text-gray-400 uppercase tracking-wider">Home Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-2.5 text-gray-400" size={18} />
                          <Input {...field} placeholder="Dhaka, Bangladesh" className="pl-10 h-10 rounded-xl bg-gray-50 border-transparent hover:bg-white hover:border-gray-200 focus:bg-white focus:border-red-500 transition-all font-bold" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full md:w-auto h-11 px-8 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-100 transition-all disabled:opacity-70"
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
