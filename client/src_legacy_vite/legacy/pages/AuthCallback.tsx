import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');

      if (accessToken && refreshToken) {
        try {
          // Initialize session
          // We need to fetch the user profile since only tokens are in the URL
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);

          const response = await authService.getMe();
          
          if (response.success && response.data) {
            login({
              success: true,
              accessToken,
              refreshToken,
              user: response.data,
              expiresIn: 3600 // Default or extract if possible
            });
            
            toast({
              title: 'Welcome back!',
              description: 'Successfully signed in with Google.',
            });
            
            // Redirect to dashboard or onboarding based on user state
            if (response.data.hasActiveMonth) {
              navigate('/dashboard');
            } else {
              navigate('/onboarding');
            }
          } else {
            throw new Error('Failed to fetch user profile');
          }
        } catch (error) {
          console.error('Auth callback error:', error);
          toast({
            variant: 'destructive',
            title: 'Authentication failed',
            description: 'Could not complete Google sign-in. Please try again.',
          });
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, login, navigate, toast]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h2 className="text-xl font-semibold text-foreground">Completing sign-in...</h2>
        <p className="text-muted-foreground">Please wait while we secure your session.</p>
      </div>
    </div>
  );
}
