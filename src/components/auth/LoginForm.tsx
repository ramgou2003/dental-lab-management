import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Loader2, LogIn, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  // Check for account inactive reason from URL params
  const urlParams = new URLSearchParams(location.search);
  const reason = urlParams.get('reason');
  const isAccountInactive = reason === 'account_inactive';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await signIn(email, password);

      if (error) {
        setError(error.message);
        toast.error(`Login Failed: ${error.message}`);
      } else {
        toast.success("Welcome back! You have been successfully logged in.");

        // Small delay to ensure auth context is fully updated
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 100);
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';

      // Only show error if it's not related to session manager initialization
      if (!errorMessage.includes('SessionManager') && !errorMessage.includes('subscription')) {
        setError(errorMessage);
        toast.error(`Login Failed: ${errorMessage}`);
      } else {
        // Session manager errors shouldn't prevent login
        console.warn('Session manager error during login, continuing anyway:', err);
        toast.success("Welcome back! You have been successfully logged in.");
        navigate(from, { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 py-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Company Logo */}
        <div className="text-center animate-fade-in">
          <img
            src="/logo-wide.png"
            alt="NYDI - Dental Lab Management"
            className="mx-auto h-16 w-auto mb-6 drop-shadow-sm hover:drop-shadow-md transition-all duration-300"
            onError={(e) => {
              // Fallback to text logo if image fails to load
              e.currentTarget.style.display = 'none';
              const fallback = document.createElement('div');
              fallback.className = 'text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-6';
              fallback.textContent = 'NYDI';
              e.currentTarget.parentNode?.appendChild(fallback);
            }}
          />
        </div>

        <Card className="backdrop-blur-sm bg-white/95 shadow-xl border-0 ring-1 ring-gray-200/50 animate-slide-up hover:shadow-2xl transition-all duration-300">
          <CardHeader className="space-y-6 pb-8">
            <div className="text-center space-y-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Sign in to your dental lab management account
              </CardDescription>
            </div>
          </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {isAccountInactive && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">
                  Your account has been deactivated. Please contact your administrator to reactivate your account.
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="h-12 px-4 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg transition-colors"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="h-12 px-4 pr-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-colors"
                />
                <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                  Remember me
                </Label>
              </div>
              <Link
                to="/contact-admin"
                className="text-sm text-indigo-600 hover:text-indigo-500 font-medium transition-colors"
              >
                Need help?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  Sign In
                </>
              )}
            </Button>
          </form>
        </CardContent>

        {/* Footer */}
        <div className="px-8 pb-8 pt-4 border-t border-gray-100">
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/contact-admin"
                className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors"
              >
                Contact your administrator
              </Link>
            </p>

            <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
              <span>© 2024 NYDI</span>
              <span>•</span>
              <Link to="/contact-admin" className="hover:text-gray-700 transition-colors">
                Support
              </Link>
              <span>•</span>
              <span>Dental Lab Management</span>
            </div>
          </div>
        </div>
      </Card>
      </div>
    </div>
  );
}
