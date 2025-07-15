import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2,
  Users,
  Lock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionGuard } from '@/components/auth/AuthGuard';
import { toast } from 'sonner';

interface Role {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  is_system_role: boolean;
  status: 'active' | 'inactive';
  created_at: string;
  user_count?: number;
  permission_count?: number;
}

export function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { canCreateRoles, canUpdateRoles, canDeleteRoles } = usePermissions();

  const fetchRoles = async () => {
    try {
      setLoading(true);
      
      // Fetch roles with user count and permission count
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select(`
          *,
          user_roles(count),
          role_permissions(count)
        `)
        .order('created_at', { ascending: false });

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
        toast.error("Failed to fetch roles");
        return;
      }

      // Process the data to include counts
      const processedRoles = rolesData.map(role => ({
        ...role,
        user_count: role.user_roles?.[0]?.count || 0,
        permission_count: role.role_permissions?.[0]?.count || 0
      }));

      setRoles(processedRoles);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = async (roleId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('roles')
        .update({ status: newStatus })
        .eq('id', roleId);

      if (error) {
        toast.error("Failed to update role status");
        return;
      }

      toast.success("Role status updated successfully");

      fetchRoles();
    } catch (error) {
      console.error('Error updating role status:', error);
      toast.error("An unexpected error occurred");
    }
  };

  const handleDeleteRole = async (roleId: string, roleName: string) => {
    if (!confirm(`Are you sure you want to delete the role "${roleName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', roleId);

      if (error) {
        toast.error("Failed to delete role");
        return;
      }

      toast.success("Role deleted successfully");

      fetchRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error("An unexpected error occurred");
    }
  };

  const filteredRoles = roles.filter(role =>
    role.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role Management
          </CardTitle>
          <PermissionGuard permission="roles.create">
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </PermissionGuard>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Roles List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading roles...</p>
          </div>
        ) : filteredRoles.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No roles found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRoles.map((role) => (
              <div key={role.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-gray-900">{role.display_name}</h3>
                    <Badge className={getStatusColor(role.status)}>
                      {role.status}
                    </Badge>
                    {role.is_system_role && (
                      <Badge variant="outline" className="text-xs">
                        <Lock className="h-3 w-3 mr-1" />
                        System Role
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {role.description || 'No description provided'}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {role.user_count} users
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      {role.permission_count} permissions
                    </span>
                    <span>Created: {new Date(role.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <PermissionGuard permission="roles.update">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Role
                      </DropdownMenuItem>
                    </PermissionGuard>
                    
                    <PermissionGuard permission="roles.manage_permissions">
                      <DropdownMenuItem>
                        <Shield className="h-4 w-4 mr-2" />
                        Manage Permissions
                      </DropdownMenuItem>
                    </PermissionGuard>

                    {!role.is_system_role && (
                      <>
                        <PermissionGuard permission="roles.update">
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(
                              role.id, 
                              role.status === 'active' ? 'inactive' : 'active'
                            )}
                          >
                            {role.status === 'active' ? 'Deactivate' : 'Activate'} Role
                          </DropdownMenuItem>
                        </PermissionGuard>

                        <PermissionGuard permission="roles.delete">
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteRole(role.id, role.display_name)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Role
                          </DropdownMenuItem>
                        </PermissionGuard>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
