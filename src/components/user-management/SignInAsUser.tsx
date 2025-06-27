import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserCheck, Loader2, AlertTriangle, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SignInAsUserProps {
  userId: string;
  userName: string;
  userEmail: string;
  asDropdownItem?: boolean;
}

export function SignInAsUser({ 
  userId, 
  userName, 
  userEmail, 
  asDropdownItem = false 
}: SignInAsUserProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('Administrative support');
  const { canImpersonate, startImpersonation } = useAuth();

  // Don't render if user can't impersonate
  if (!canImpersonate()) {
    return null;
  }

  const handleSignInAs = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for impersonation");
      return;
    }

    setLoading(true);

    try {
      console.log('SignInAsUser: Starting impersonation for user:', userId, 'with reason:', reason.trim());

      const result = await startImpersonation(userId, reason.trim());

      console.log('SignInAsUser: Impersonation result:', result);

      if (result.success) {
        toast.success(`Now signed in as ${userName}`);
        setOpen(false);
        setReason('Administrative support');

        // Redirect to dashboard or refresh page
        window.location.href = '/dashboard';
      } else {
        console.error('SignInAsUser: Impersonation failed:', result.error);
        toast.error(result.error || 'Failed to start impersonation');
      }
    } catch (error) {
      console.error('SignInAsUser: Error in sign in as:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const TriggerComponent = asDropdownItem ? (
    <DropdownMenuItem
      onSelect={(e) => {
        e.preventDefault();
        setOpen(true);
      }}
      className="text-blue-600"
    >
      <UserCheck className="h-4 w-4 mr-2" />
      Sign in as User
    </DropdownMenuItem>
  ) : (
    <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
      <UserCheck className="h-4 w-4 mr-2" />
      Sign in as
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {TriggerComponent}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Sign in as User
          </DialogTitle>
          <DialogDescription>
            You are about to impersonate this user. This action will be logged for security purposes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Target User</h4>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Name:</span> {userName}</p>
              <p><span className="font-medium">Email:</span> {userEmail}</p>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 mb-1">Important Notice</p>
                <ul className="text-yellow-700 space-y-1">
                  <li>• You will have full access to this user's account</li>
                  <li>• All actions will be logged and audited</li>
                  <li>• Use this feature responsibly</li>
                  <li>• You can return to your admin account anytime</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Reason Input */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Impersonation *</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Troubleshooting user issue, providing support..."
              disabled={loading}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              This reason will be recorded in the audit log
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSignInAs}
              disabled={loading || !reason.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Sign in as {userName.split(' ')[0]}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
