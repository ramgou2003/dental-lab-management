import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  LogOut, 
  User, 
  Clock, 
  AlertTriangle,
  Loader2 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function ImpersonationBanner() {
  const [loading, setLoading] = useState(false);
  const { impersonation, userProfile, endImpersonation } = useAuth();

  // Don't render if not impersonating
  if (!impersonation.isImpersonating) {
    return null;
  }

  const handleEndImpersonation = async () => {
    setLoading(true);

    try {
      const result = await endImpersonation();

      if (result.success) {
        toast.success('Returned to your admin account');
        // Redirect to user management or dashboard
        window.location.href = '/user-management';
      } else {
        toast.error(result.error || 'Failed to end impersonation');
      }
    } catch (error) {
      console.error('Error ending impersonation:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString();
  };

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg border-b-2 border-red-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          {/* Left side - Impersonation info */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="bg-white/20 p-2 rounded-full">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-semibold text-sm">IMPERSONATION MODE</span>
                </div>
                <div className="text-xs opacity-90">
                  Admin session active - All actions are logged
                </div>
              </div>
            </div>

            <div className="hidden sm:block h-8 w-px bg-white/30"></div>

            {/* User info */}
            <div className="hidden sm:flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>
                  <span className="opacity-75">Signed in as:</span>{' '}
                  <span className="font-medium">{userProfile?.full_name}</span>
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>
                  <span className="opacity-75">Since:</span>{' '}
                  <span className="font-medium">{formatTime(impersonation.startedAt)}</span>
                </span>
              </div>

              {impersonation.originalAdmin && (
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>
                    <span className="opacity-75">Admin:</span>{' '}
                    <span className="font-medium">{impersonation.originalAdmin.full_name}</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleEndImpersonation}
              disabled={loading}
              variant="secondary"
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ending...
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Return to Admin
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Mobile view - simplified */}
        <div className="sm:hidden pb-3">
          <div className="text-xs space-y-1">
            <div>
              <span className="opacity-75">Impersonating:</span>{' '}
              <span className="font-medium">{userProfile?.full_name}</span>
            </div>
            {impersonation.originalAdmin && (
              <div>
                <span className="opacity-75">Admin:</span>{' '}
                <span className="font-medium">{impersonation.originalAdmin.full_name}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
