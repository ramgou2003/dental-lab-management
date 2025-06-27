import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Shield, Loader2, Save } from 'lucide-react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Role {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  is_system_role: boolean;
}

interface UserRole {
  role_id: string;
  status: string;
}

interface UserRoleAssignmentProps {
  userId: string;
  userName: string;
  currentRoles: UserRole[];
  onRolesUpdated: () => void;
  asDropdownItem?: boolean;
}

export function UserRoleAssignment({
  userId,
  userName,
  currentRoles,
  onRolesUpdated,
  asDropdownItem = false
}: UserRoleAssignmentProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const { userRoles } = useAuth();

  // Helper function to check if current user is a super admin
  const isCurrentUserSuperAdmin = (): boolean => {
    return userRoles.some(role => role.name === 'super_admin');
  };

  // Helper function to check if the target user is a super admin
  const isTargetUserSuperAdmin = (): boolean => {
    return currentRoles.some(userRole => {
      const role = availableRoles.find(r => r.id === userRole.role_id);
      return role?.name === 'super_admin';
    });
  };

  // Initialize selected roles from current user roles
  useEffect(() => {
    const activeRoleIds = currentRoles
      .filter(ur => ur.status === 'active')
      .map(ur => ur.role_id);
    setSelectedRoles(activeRoleIds);
  }, [currentRoles]);

  // Fetch available roles when dialog opens
  useEffect(() => {
    const fetchRoles = async () => {
      if (!open) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('roles')
          .select('*')
          .eq('status', 'active')
          .order('display_name');

        if (error) {
          console.error('Error fetching roles:', error);
          toast.error("Failed to fetch roles");
          return;
        }

        setAvailableRoles(data || []);
      } catch (error) {
        console.error('Error fetching roles:', error);
        toast.error("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [open]);

  const handleRoleToggle = (roleId: string) => {
    // Check if trying to assign super admin role without being a super admin
    const role = availableRoles.find(r => r.id === roleId);
    if (role?.name === 'super_admin' && !isCurrentUserSuperAdmin()) {
      toast.error("Only super admins can assign super admin roles");
      return;
    }

    setSelectedRoles(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSave = async () => {
    setSaving(true);

    // Check if trying to modify a super admin user without being a super admin
    if (isTargetUserSuperAdmin() && !isCurrentUserSuperAdmin()) {
      toast.error("You cannot modify super admin role assignments");
      setSaving(false);
      return;
    }

    try {
      // Get all current role IDs (both active and inactive)
      const currentRoleIds = currentRoles.map(ur => ur.role_id);

      // Get currently active role IDs
      const currentActiveRoleIds = currentRoles
        .filter(ur => ur.status === 'active')
        .map(ur => ur.role_id);

      // Determine roles to add and remove
      const rolesToAdd = selectedRoles.filter(roleId => !currentRoleIds.includes(roleId));
      const rolesToRemove = currentActiveRoleIds.filter(roleId => !selectedRoles.includes(roleId));
      const rolesToReactivate = selectedRoles.filter(roleId => {
        const existingRole = currentRoles.find(ur => ur.role_id === roleId);
        return existingRole && existingRole.status === 'inactive';
      });

      // Remove roles (delete the rows completely)
      if (rolesToRemove.length > 0) {
        const { error: removeError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .in('role_id', rolesToRemove);

        if (removeError) {
          console.error('Error removing roles:', removeError);
          toast.error("Failed to remove some roles");
          return;
        }
      }

      // Add completely new roles
      if (rolesToAdd.length > 0) {
        const newUserRoles = rolesToAdd.map(roleId => ({
          user_id: userId,
          role_id: roleId,
          status: 'active'
        }));

        const { error: addError } = await supabase
          .from('user_roles')
          .insert(newUserRoles);

        if (addError) {
          console.error('Error adding roles:', addError);
          toast.error("Failed to add some roles");
          return;
        }
      }

      // Reactivate previously inactive roles
      if (rolesToReactivate.length > 0) {
        const { error: reactivateError } = await supabase
          .from('user_roles')
          .update({ status: 'active' })
          .eq('user_id', userId)
          .in('role_id', rolesToReactivate);

        if (reactivateError) {
          console.error('Error reactivating roles:', reactivateError);
          toast.error("Failed to reactivate some roles");
          return;
        }
      }

      toast.success("User roles updated successfully");

      setOpen(false);
      onRolesUpdated();

    } catch (error) {
      console.error('Error updating user roles:', error);
      toast.error("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {asDropdownItem ? (
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setOpen(true);
            }}
          >
            <Shield className="h-4 w-4 mr-2" />
            Manage Roles
          </DropdownMenuItem>
        ) : (
          <Button variant="ghost" size="sm">
            <Shield className="h-4 w-4 mr-2" />
            Manage Roles
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Roles for {userName}</DialogTitle>
          <DialogDescription>
            Select the roles you want to assign to this user
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-500">Loading roles...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-indigo-600" />
                  Available Roles
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Click on roles to assign or remove them from this user
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {availableRoles.map((role) => {
                  const isSuperAdminRole = role.name === 'super_admin';
                  const canAssignRole = !isSuperAdminRole || isCurrentUserSuperAdmin();
                  const isSelected = selectedRoles.includes(role.id);

                  return (
                    <Button
                      key={role.id}
                      variant="outline"
                      onClick={() => handleRoleToggle(role.id)}
                      disabled={saving || !canAssignRole}
                      className={`w-full h-auto p-4 justify-start text-left transition-all duration-200 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900 shadow-sm'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      } ${
                        !canAssignRole ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      <div className="flex items-start space-x-3 w-full">
                        {/* Selection Dot */}
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all duration-200 ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-500'
                            : 'border-gray-300 bg-white'
                        }`}>
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>

                        {/* Role Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-medium text-sm">
                              {role.display_name}
                            </span>
                            {role.is_system_role && (
                              <Badge variant="outline" className="text-xs">
                                System Role
                              </Badge>
                            )}
                            {isSuperAdminRole && (
                              <Badge variant="outline" className="text-xs border-red-200 bg-red-50 text-red-700">
                                <Shield className="h-3 w-3 mr-1" />
                                Super Admin
                              </Badge>
                            )}
                            {!canAssignRole && (
                              <Badge variant="outline" className="text-xs border-orange-200 bg-orange-50 text-orange-700">
                                Restricted
                              </Badge>
                            )}
                          </div>
                          {role.description && (
                            <p className="text-xs text-gray-500 leading-relaxed">
                              {role.description}
                            </p>
                          )}
                          {!canAssignRole && (
                            <p className="text-xs text-orange-600 mt-1">
                              Only super admins can assign this role
                            </p>
                          )}
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Current Selection Summary */}
            <Card className="border-indigo-200 bg-indigo-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  Selected Roles ({selectedRoles.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedRoles.length === 0 ? (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                      <Shield className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">No roles selected</p>
                    <p className="text-xs text-gray-400 mt-1">Click on roles above to assign them</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedRoles.map((roleId) => {
                      const role = availableRoles.find(r => r.id === roleId);
                      if (!role) return null;

                      const isSuperAdminRole = role.name === 'super_admin';

                      return (
                        <div key={roleId} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-indigo-200">
                          <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                          <span className="font-medium text-sm text-indigo-900">
                            {role.display_name}
                          </span>
                          {isSuperAdminRole && (
                            <Badge variant="outline" className="text-xs border-red-200 bg-red-50 text-red-700 ml-auto">
                              <Shield className="h-3 w-3 mr-1" />
                              Super Admin
                            </Badge>
                          )}
                          {role.is_system_role && !isSuperAdminRole && (
                            <Badge variant="outline" className="text-xs ml-auto">
                              System Role
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
