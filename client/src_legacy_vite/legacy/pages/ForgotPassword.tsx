import { useState } from 'react';
import { Link } from 'react-router-dom';
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
import { Mail, Loader2, ArrowLeft, Send, Lock } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      const response = await authService.forgotPassword(values.email);
      if (response.success) {
        setIsSubmitted(true);
        toast({
          title: 'Email sent!',
          description: 'If an account exists, you will receive a reset link.',
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
        description: error.response?.data?.message || 'Failed to send reset link',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-outfit">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[15%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 mb-4 transition-transform hover:scale-105 duration-300">
            <span className="text-primary-foreground font-black text-3xl">M</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground text-center">
            Security <span className="text-primary">First</span>
          </h2>
        </div>

        <Card className="glass-card sm:rounded-2xl border-none shadow-2xl relative">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary/30 via-primary to-primary/30 sm:rounded-t-2xl" />
          
          <CardHeader className="space-y-1 pt-8">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Lock className="w-6 h-6 text-primary" />
              Reset Password
            </CardTitle>
            <CardDescription>
              We'll send a recovery link to your inbox
            </CardDescription>
          </CardHeader>
          
          <CardContent className="grid gap-6">
            {!isSubmitted ? (
              <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      placeholder="name@example.com"
                      className="pl-10 h-11 bg-background/50 border-muted"
                      {...form.register('email')}
                    />
                  </div>
                  {form.formState.errors.email && (
                    <p className="text-xs text-destructive mt-1 font-medium">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-bold shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all group"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Link...
                    </>
                  ) : (
                    <>
                      Send Reset Instructions
                      <Send className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold">Check your inbox</h3>
                <p className="text-muted-foreground text-sm leading-relaxed px-4">
                  We've sent a password recovery link to <strong>{form.getValues('email')}</strong>.
                  Please check your spam folder if you don't see it.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4 border-muted hover:bg-accent/50"
                  onClick={() => setIsSubmitted(false)}
                >
                  Try another email
                </Button>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="pb-8">
            <Link
              to="/login"
              className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors flex items-center justify-center w-full gap-2 group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
              Back to Login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
