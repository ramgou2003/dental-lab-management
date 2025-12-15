import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Shield, Save, Loader2, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Permission {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  module: string;
}

interface Role {
  id: string;
  name: string;
  display_name: string;
  is_system_role: boolean;
}

interface ManageRolePermissionsDialogProps {
  role: Role;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPermissionsUpdated: () => void;
}

export function ManageRolePermissionsDialog({ 
  role, 
  open, 
  onOpenChange, 
  onPermissionsUpdated 
}: ManageRolePermissionsDialogProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (open && role) {
      fetchPermissionsAndRolePermissions();
    }
  }, [open, role]);

  const fetchPermissionsAndRolePermissions = async () => {
    setLoading(true);
    try {
      // Fetch all permissions
      const { data: allPermissions, error: permError } = await supabase
        .from('permissions')
        .select('*')
        .order('module', { ascending: true })
        .order('action', { ascending: true });

      if (permError) {
        console.error('Error fetching permissions:', permError);
        toast.error('Failed to fetch permissions');
        return;
      }

      setPermissions(allPermissions || []);

      // Fetch current role permissions
      const { data: rolePerms, error: rolePermError } = await supabase
        .from('role_permissions')
        .select('permission_id')
        .eq('role_id', role.id);

      if (rolePermError) {
        console.error('Error fetching role permissions:', rolePermError);
        toast.error('Failed to fetch role permissions');
        return;
      }

      setSelectedPermissions(rolePerms?.map(rp => rp.permission_id) || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSelectAll = (module: string) => {
    const modulePermIds = permissions.filter(p => p.module === module).map(p => p.id);
    const allSelected = modulePermIds.every(id => selectedPermissions.includes(id));
    
    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(id => !modulePermIds.includes(id)));
    } else {
      setSelectedPermissions(prev => [...new Set([...prev, ...modulePermIds])]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Delete existing role permissions
      const { error: deleteError } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', role.id);

      if (deleteError) {
        console.error('Error deleting permissions:', deleteError);
        toast.error('Failed to update permissions');
        return;
      }

      // Insert new permissions
      if (selectedPermissions.length > 0) {
        const newPermissions = selectedPermissions.map(permId => ({
          role_id: role.id,
          permission_id: permId
        }));

        const { error: insertError } = await supabase
          .from('role_permissions')
          .insert(newPermissions);

        if (insertError) {
          console.error('Error inserting permissions:', insertError);
          toast.error('Failed to update permissions');
          return;
        }
      }

      toast.success('Permissions updated successfully');
      onOpenChange(false);
      onPermissionsUpdated();
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  // Group permissions by module
  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) {
      acc[perm.module] = [];
    }
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  const moduleDisplayNames: Record<string, string> = {
    dashboard: 'Dashboard',
    patients: 'Patients',
    appointments: 'Appointments',
    consultation: 'Consultation',
    lab_scripts: 'Lab Scripts',
    cad: 'CAD/CAM',
    reports: 'Reports',
    users: 'User Management',
    roles: 'Role Management',
    system: 'System'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-600" />
            Manage Permissions - {role.display_name}
          </DialogTitle>
          <DialogDescription>
            Select the permissions to assign to this role
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(([module, modulePerms]) => {
                const allSelected = modulePerms.every(p => selectedPermissions.includes(p.id));
                const someSelected = modulePerms.some(p => selectedPermissions.includes(p.id));

                return (
                  <div key={module} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">
                        {moduleDisplayNames[module] || module}
                      </h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectAll(module)}
                      >
                        {allSelected ? 'Deselect All' : 'Select All'}
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {modulePerms.map(perm => (
                        <label
                          key={perm.id}
                          className="flex items-start gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer"
                        >
                          <Checkbox
                            checked={selectedPermissions.includes(perm.id)}
                            onCheckedChange={() => handlePermissionToggle(perm.id)}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {perm.display_name}
                            </p>
                            {perm.description && (
                              <p className="text-xs text-gray-500">{perm.description}</p>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t mt-4">
          <div className="text-sm text-gray-500">
            {selectedPermissions.length} permission(s) selected
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Permissions
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

