import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateUserForm } from '@/components/user-management/CreateUserForm';
import { EditUserForm } from '@/components/user-management/EditUserForm';
import { RoleManagement } from '@/components/user-management/RoleManagement';
import { UserRoleAssignment } from '@/components/user-management/UserRoleAssignment';
import {
  Users,
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  UserCheck,
  UserX,
  UserMinus,
  AlertTriangle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/contexts/AuthContext';
import { PermissionGuard } from '@/components/auth/AuthGuard';
import { toast } from 'sonner';
import {
  deleteUserCompletely,
  previewUserDeletion,
  validateUserDeletion,
  showUserDeletionConfirmation
} from '@/utils/userDeletion';

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended' | 'disabled';
  created_at: string;
  last_login?: string;
  roles: Array<{
    id: string;
    name: string;
    display_name: string;
  }>;
  allRoleAssignments: Array<{
    role_id: string;
    status: string;
  }>;
}

export function UserManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { canCreateUsers, canUpdateUsers, canDeleteUsers, canManageUserRoles } = usePermissions();
  const { userRoles } = useAuth();

  // Helper function to check if a user is a super admin
  const isSuperAdmin = (user: UserProfile): boolean => {
    return user.roles.some(role => role.name === 'super_admin');
  };

  // Helper function to check if current user is a super admin
  const isCurrentUserSuperAdmin = (): boolean => {
    return userRoles.some(role => role.name === 'super_admin');
  };

  // Helper function to check if current user can edit a specific user
  const canEditUser = (user: UserProfile): boolean => {
    // Super admins can edit anyone except other super admins (unless they are also super admin)
    if (isSuperAdmin(user)) {
      return isCurrentUserSuperAdmin();
    }
    // Non-super admin users can be edited by anyone with permissions
    return true;
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          user_roles (
            id,
            role_id,
            status,
            roles (
              id,
              name,
              display_name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        toast.error("Failed to fetch users");
        return;
      }

      // Process the data to group roles by user
      const processedUsers = data.reduce((acc: UserProfile[], user) => {
        const existingUser = acc.find(u => u.id === user.id);

        if (existingUser) {
          // Add role to existing user
          if (user.user_roles && Array.isArray(user.user_roles)) {
            user.user_roles.forEach(userRole => {
              if (userRole.roles && userRole.status === 'active') {
                existingUser.roles.push(userRole.roles);
              }
              if (userRole.roles) {
                existingUser.allRoleAssignments.push({
                  role_id: userRole.role_id,
                  status: userRole.status
                });
              }
            });
          }
        } else {
          // Create new user entry
          let userRoles: any[] = [];
          let allRoleAssignments: any[] = [];

          if (user.user_roles && Array.isArray(user.user_roles)) {
            userRoles = user.user_roles
              .filter(userRole => userRole.roles && userRole.status === 'active')
              .map(userRole => userRole.roles);

            allRoleAssignments = user.user_roles
              .filter(userRole => userRole.roles)
              .map(userRole => ({
                role_id: userRole.role_id,
                status: userRole.status
              }));
          }

          acc.push({
            ...user,
            roles: userRoles,
            allRoleAssignments: allRoleAssignments
          });
        }

        return acc;
      }, []);

      setUsers(processedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      case 'disabled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      // Find the user to check if they are a super admin
      const userToUpdate = users.find(u => u.id === userId);

      if (userToUpdate && !canEditUser(userToUpdate)) {
        toast.error("You cannot modify super admin accounts");
        return;
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({ status: newStatus })
        .eq('id', userId);

      if (error) {
        toast.error("Failed to update user status");
        return;
      }

      // If user is being deactivated, force logout
      if (newStatus !== 'active') {
        await forceUserLogout(userId, `Account status changed to ${newStatus}`);
      }

      toast.success("User status updated successfully");

      // Refresh users list
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error("An unexpected error occurred");
    }
  };

  const forceUserLogout = async (userId: string, reason: string) => {
    try {
      const { error } = await supabase.rpc('force_user_logout', {
        target_user_id: userId,
        reason: reason
      });

      if (error) {
        console.error('Error forcing user logout:', error);
        // Don't show error to admin, as the status change was successful
      } else {
        console.log('User logout forced successfully');
      }
    } catch (error) {
      console.error('Error in force logout:', error);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      // Check if user can be deleted
      if (!canEditUser(userToDelete)) {
        toast.error("You cannot delete super admin accounts");
        return;
      }

      // Validate user deletion and show warnings
      const validation = await validateUserDeletion(userToDelete.id);

      if (!validation.canDelete) {
        toast.error("Cannot delete user: " + validation.blockers.join(', '));
        return;
      }

      // Show warnings if any
      if (validation.warnings.length > 0) {
        const warningMessage = "⚠️ Deletion will affect:\n" + validation.warnings.join('\n');
        const confirmed = window.confirm(
          warningMessage + "\n\nDo you want to continue?"
        );
        if (!confirmed) {
          return;
        }
      }

      // Preview deletion details
      const preview = await previewUserDeletion(userToDelete.id);
      console.log('Deletion preview:', preview);

      // Perform comprehensive deletion
      await deleteUserCompletely(userToDelete.id, userToDelete.email);

      // Refresh users list
      fetchUsers();
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      // Error handling is done in deleteUserCompletely function
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteDialog = (user: UserProfile) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 p-6">
      <PageHeader 
        title="User Management" 
        subtitle="Manage user accounts, roles, and permissions"
        icon={Users}
      />

      <div className="space-y-6">
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Roles
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <PermissionGuard permission="users.create">
                <CreateUserForm onUserCreated={fetchUsers} />
              </PermissionGuard>
            </div>

            {/* Users List */}
            <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No users found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-indigo-600 text-white">
                          {getInitials(user.first_name, user.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{user.full_name}</h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getStatusColor(user.status)}>
                            {user.status}
                          </Badge>
                          {user.roles.map((role) => (
                            <Badge
                              key={role.id}
                              variant="outline"
                              className={`text-xs ${
                                role.name === 'super_admin'
                                  ? 'border-red-200 bg-red-50 text-red-700 font-semibold'
                                  : ''
                              }`}
                            >
                              {role.name === 'super_admin' && <Shield className="h-3 w-3 mr-1" />}
                              {role.display_name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {canEditUser(user) ? (
                          <>
                            <PermissionGuard permission="users.manage_roles">
                              <UserRoleAssignment
                                userId={user.id}
                                userName={user.full_name}
                                currentRoles={user.allRoleAssignments || []}
                                onRolesUpdated={fetchUsers}
                                asDropdownItem={true}
                              />
                            </PermissionGuard>

                            <PermissionGuard permission="users.update">
                              <EditUserForm
                                user={user}
                                onUserUpdated={fetchUsers}
                                asDropdownItem={true}
                              />
                            </PermissionGuard>

                            <PermissionGuard permission="users.change_status">
                              {user.status === 'active' ? (
                                <DropdownMenuItem onClick={() => handleStatusChange(user.id, 'suspended')}>
                                  <UserMinus className="h-4 w-4 mr-2" />
                                  Suspend User
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleStatusChange(user.id, 'active')}>
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Activate User
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuItem onClick={() => handleStatusChange(user.id, 'disabled')}>
                                <UserX className="h-4 w-4 mr-2" />
                                Disable User
                              </DropdownMenuItem>
                            </PermissionGuard>

                            <PermissionGuard permission="users.delete">
                              <DropdownMenuItem
                                className="text-red-600"
                                onSelect={(e) => {
                                  e.preventDefault();
                                  openDeleteDialog(user);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </PermissionGuard>
                          </>
                        ) : (
                          <DropdownMenuItem disabled className="text-gray-400">
                            <Shield className="h-4 w-4 mr-2" />
                            Protected Account
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles">
            <RoleManagement />
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete User Account
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <p>Are you sure you want to <strong className="text-red-600">PERMANENTLY DELETE</strong> user:</p>
                <div className="bg-gray-50 p-3 rounded-lg mt-2 mb-3">
                  <p><strong>Name:</strong> {userToDelete?.full_name}</p>
                  <p><strong>Email:</strong> {userToDelete?.email}</p>
                  <p><strong>Status:</strong> {userToDelete?.status}</p>
                </div>

                <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                  <p className="font-semibold text-red-800 mb-2">⚠️ This action will PERMANENTLY:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                    <li>Delete the user from all database tables</li>
                    <li>Remove their authentication account</li>
                    <li>Delete all associated roles and permissions</li>
                    <li>Remove all user activity logs and audit trails</li>
                    <li>Clear all references to this user in the system</li>
                    <li>Immediately revoke all access to the platform</li>
                  </ul>
                  <p className="mt-2 font-semibold text-red-800">This action CANNOT be undone!</p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete User
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
