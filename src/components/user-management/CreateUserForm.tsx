import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus, Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Role {
  id: string;
  name: string;
  display_name: string;
  description?: string;
}

interface CreateUserFormProps {
  onUserCreated: () => void;
}

export function CreateUserForm({ onUserCreated }: CreateUserFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    selectedRoles: [] as string[],
    status: 'active'
  });

  // Fetch available roles
  useEffect(() => {
    const fetchRoles = async () => {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .eq('status', 'active')
        .order('display_name');

      if (error) {
        console.error('Error fetching roles:', error);
        return;
      }

      setRoles(data || []);
    };

    if (open) {
      fetchRoles();
    }
  }, [open]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRoleToggle = (roleId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedRoles: prev.selectedRoles.includes(roleId)
        ? prev.selectedRoles.filter(id => id !== roleId)
        : [...prev.selectedRoles, roleId]
    }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      toast.error("Please fill in all required fields");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }

    if (formData.selectedRoles.length === 0) {
      toast.error("Please select at least one role");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone
          }
        }
      });

      if (authError) {
        toast.error(authError.message);
        return;
      }

      if (!authData.user) {
        toast.error("Failed to create user");
        return;
      }

      // Wait a moment for the user profile to be created by trigger
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user profile exists, if not create it
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', authData.user.id)
        .single();

      if (!existingProfile) {
        console.log('User profile not found, creating manually...');
        // Create user profile manually (don't include full_name as it's generated)
        const { error: createProfileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            email: formData.email,
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            status: formData.status
          });

        if (createProfileError) {
          console.error('Error creating profile:', createProfileError);
          toast.error("Failed to create user profile");
          return;
        }
      } else {
        // Update existing user profile with additional info (don't update full_name as it's generated)
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({
            phone: formData.phone,
            status: formData.status
          })
          .eq('id', authData.user.id);

        if (profileError) {
          console.error('Error updating profile:', profileError);
        }
      }

      // Assign roles to user using database function
      if (formData.selectedRoles.length > 0) {
        console.log('Assigning roles to user:', authData.user!.id);
        console.log('Selected roles:', formData.selectedRoles);

        const { data: rolesResult, error: rolesError } = await supabase.rpc('assign_user_roles_simple', {
          target_user_id: authData.user!.id,
          role_ids: formData.selectedRoles
        });

        console.log('Role assignment response:', { rolesResult, rolesError });

        if (rolesError) {
          console.error('Error calling assign_user_roles_simple function:', rolesError);
          toast.warning("User created but failed to assign some roles. Please assign roles manually.");
        } else if (rolesResult && !rolesResult.success) {
          console.error('Role assignment failed:', rolesResult);
          toast.warning(`User created but failed to assign roles: ${rolesResult.error || 'Unknown error'}`);
        } else {
          console.log('Roles assigned successfully:', rolesResult);
          toast.success(`User created successfully with ${rolesResult.assigned_count} role(s) assigned`);
        }
      } else {
        console.log('No roles selected for user');
        toast.success("User created successfully");
      }

      // Reset form and close dialog
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: '',
        selectedRoles: [],
        status: 'active'
      });
      setOpen(false);

      // Wait a moment before refreshing to ensure all database operations are complete
      setTimeout(() => {
        onUserCreated();
      }, 1500);

    } catch (error) {
      console.error('Error creating user:', error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Add a new user to the system and assign appropriate roles
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Password */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                    disabled={loading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Roles */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Roles & Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {roles.map((role) => (
                  <div key={role.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id={role.id}
                      checked={formData.selectedRoles.includes(role.id)}
                      onCheckedChange={() => handleRoleToggle(role.id)}
                      disabled={loading}
                    />
                    <div className="flex-1">
                      <Label htmlFor={role.id} className="font-medium cursor-pointer">
                        {role.display_name}
                      </Label>
                      {role.description && (
                        <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

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
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create User
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
