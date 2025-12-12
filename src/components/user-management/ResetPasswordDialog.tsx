import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Eye, EyeOff, KeyRound, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ResetPasswordDialogProps {
  userId: string;
  userName: string;
  userEmail: string;
  asDropdownItem?: boolean;
}

export function ResetPasswordDialog({ 
  userId, 
  userName, 
  userEmail,
  asDropdownItem = false 
}: ResetPasswordDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.newPassword || !formData.confirmPassword) {
      toast.error("Please fill in all fields");
      return false;
    }

    if (formData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Call a database function to reset the password
      // This will use a secure server-side function to update the password
      const { data, error } = await supabase.rpc('admin_reset_user_password', {
        target_user_id: userId,
        new_password: formData.newPassword
      });

      if (error) {
        console.error('Error resetting password:', error);

        // If the function doesn't exist, we'll need to create it
        if (error.message.includes('function') && error.message.includes('does not exist')) {
          toast.error("Password reset function not configured. Please contact system administrator.");
          console.error('Database function "admin_reset_user_password" needs to be created.');
        } else {
          toast.error(`Failed to reset password: ${error.message}`);
        }
        return;
      }

      toast.success(`Password reset successfully for ${userName}`);

      // Reset form and close dialog
      setFormData({
        newPassword: '',
        confirmPassword: '',
      });
      setOpen(false);

    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      newPassword: '',
      confirmPassword: '',
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {asDropdownItem ? (
        <DialogTrigger asChild>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setOpen(true);
            }}
          >
            <KeyRound className="h-4 w-4 mr-2" />
            Reset Password
          </DropdownMenuItem>
        </DialogTrigger>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <KeyRound className="h-4 w-4" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Reset Password</p>
          </TooltipContent>
        </Tooltip>
      )}

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-indigo-600" />
            Reset Password
          </DialogTitle>
          <DialogDescription>
            Reset password for <span className="font-semibold">{userName}</span> ({userEmail}).
            Enter a new password for this user.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {/* Warning Alert */}
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-800">
              This will immediately change the user's password. Make sure to communicate the new password securely to the user.
            </p>
          </div>

          <div className="space-y-4 py-2">
            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password *</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  placeholder="Enter new password"
                  disabled={loading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={loading}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500">Minimum 6 characters</p>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm new password"
                  disabled={loading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

