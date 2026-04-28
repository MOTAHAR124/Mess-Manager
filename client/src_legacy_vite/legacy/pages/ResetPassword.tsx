import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Lock, Loader2, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data: { password: string; confirmPassword: string }) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const token = searchParams.get('token');

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) {
      toast({
        variant: 'destructive',
        title: 'Invalid Link',
        description: 'No reset token found in URL.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.resetPassword({
        token,
        newPassword: values.password,
      });
      if (response.success) {
        setIsSuccess(true);
        toast({
          title: 'Password reset successful!',
          description: 'Your security has been updated.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.message || 'Something went wrong',
        });
      }
    } catch (e: unknown) { const error = e as Error & { response?: { data?: { message?: string } } };
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to reset password',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-outfit">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="glass-card sm:rounded-2xl border-none shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-green-500 sm:rounded-t-2xl" />
            <div className="text-center py-12 px-8 space-y-6">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 transform scale-110">
                <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-3xl font-black tracking-tight">Security Updated</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Your new password has been verified and applied successfully.
              </p>
              <Button 
                onClick={() => navigate('/login')}
                className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20 mt-8 group"
              >
                Sign In Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-outfit">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[30%] right-[10%] w-[35%] h-[35%] bg-primary/5 rounded-full blur-[110px]" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 mb-4 transition-transform hover:scale-105 duration-300">
            <span className="text-primary-foreground font-black text-3xl">M</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground text-center">
            Set New <span className="text-primary">Password</span>
          </h2>
        </div>

        {!token ? (
           <Card className="glass-card sm:rounded-2xl border-none shadow-2xl p-8 text-center space-y-4">
              <ShieldCheck className="w-12 h-12 text-destructive mx-auto opacity-50" />
              <CardTitle className="text-xl">Invalid Session</CardTitle>
              <CardDescription>
                This reset link is invalid or has expired. Please request a new one.
              </CardDescription>
              <Button asChild className="w-full mt-4">
                <Link to="/forgot-password">Request Reset Link</Link>
              </Button>
           </Card>
        ) : (
          <Card className="glass-card sm:rounded-2xl border-none shadow-2xl relative">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary/40 via-primary to-primary/40 sm:rounded-t-2xl" />
            
            <CardHeader className="space-y-1 pt-8">
              <CardTitle className="text-2xl font-bold">Secure Reset</CardTitle>
              <CardDescription>
                Please enter your new complex password
              </CardDescription>
            </CardHeader>
            
            <CardContent className="grid gap-6">
              <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 h-11 bg-background/50 border-muted"
                      {...form.register('password')}
                    />
                  </div>
                  {form.formState.errors.password && (
                    <p className="text-xs text-destructive mt-1 font-medium">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="h-11 bg-background/50 border-muted"
                    {...form.register('confirmPassword')}
                  />
                  {form.formState.errors.confirmPassword && (
                    <p className="text-xs text-destructive mt-1 font-medium">
                      {form.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-bold shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95 mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating Security...
                    </>
                  ) : (
                    <>
                      Save Password
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            
            <CardFooter className="pb-8">
              <p className="text-xs text-center text-muted-foreground w-full px-4">
                Make sure your password is unique and includes numbers or symbols for better protection.
              </p>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
