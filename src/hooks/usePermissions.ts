import { useAuth } from '@/contexts/AuthContext';

export function usePermissions() {
  const { userPermissions, hasPermission, hasRole, userRoles } = useAuth();

  // Permission checking functions
  const canCreateUsers = () => hasPermission('users.create');
  const canReadUsers = () => hasPermission('users.read');
  const canUpdateUsers = () => hasPermission('users.update');
  const canDeleteUsers = () => hasPermission('users.delete');
  const canManageUserRoles = () => hasPermission('users.manage_roles');
  const canChangeUserStatus = () => hasPermission('users.change_status');

  const canCreateRoles = () => hasPermission('roles.create');
  const canReadRoles = () => hasPermission('roles.read');
  const canUpdateRoles = () => hasPermission('roles.update');
  const canDeleteRoles = () => hasPermission('roles.delete');
  const canManageRolePermissions = () => hasPermission('roles.manage_permissions');

  const canCreatePatients = () => hasPermission('patients.create');
  const canReadPatients = () => hasPermission('patients.read');
  const canUpdatePatients = () => hasPermission('patients.update');
  const canDeletePatients = () => hasPermission('patients.delete');

  const canCreateLabScripts = () => hasPermission('lab_scripts.create');
  const canReadLabScripts = () => hasPermission('lab_scripts.read');
  const canUpdateLabScripts = () => hasPermission('lab_scripts.update');
  const canDeleteLabScripts = () => hasPermission('lab_scripts.delete');
  const canChangeLabScriptStatus = () => hasPermission('lab_scripts.change_status');

  const canCreateLabReports = () => hasPermission('reports.lab.create');
  const canReadLabReports = () => hasPermission('reports.lab.read');
  const canCreateClinicalReports = () => hasPermission('reports.clinical.create');
  const canReadClinicalReports = () => hasPermission('reports.clinical.read');

  const canCreateAppointments = () => hasPermission('appointments.create');
  const canReadAppointments = () => hasPermission('appointments.read');
  const canUpdateAppointments = () => hasPermission('appointments.update');
  const canDeleteAppointments = () => hasPermission('appointments.delete');

  const canCreateCAD = () => hasPermission('cad.create');
  const canReadCAD = () => hasPermission('cad.read');
  const canUpdateCAD = () => hasPermission('cad.update');
  const canDeleteCAD = () => hasPermission('cad.delete');
  const canExportCAD = () => hasPermission('cad.export');
  const canApproveCAD = () => hasPermission('cad.approve');

  const canAccessDashboard = () => hasPermission('dashboard.access');
  const canAccessSystemSettings = () => hasPermission('system.settings');
  const canViewAuditLogs = () => hasPermission('system.audit_logs');

  // Role checking functions
  const isSuperAdmin = () => hasRole('super_admin');
  const isAdmin = () => hasRole('admin');
  const isDentist = () => hasRole('dentist');
  const isLabTechnician = () => hasRole('lab_technician');
  const isCADDesigner = () => hasRole('cad_designer');
  const isReceptionist = () => hasRole('receptionist');
  const isViewer = () => hasRole('viewer');

  // Combined permission checks
  const canManageUsers = () => canCreateUsers() || canUpdateUsers() || canDeleteUsers() || canManageUserRoles();
  const canManageRoles = () => canCreateRoles() || canUpdateRoles() || canDeleteRoles() || canManageRolePermissions();
  const canManagePatients = () => canCreatePatients() || canUpdatePatients() || canDeletePatients();
  const canManageLabScripts = () => canCreateLabScripts() || canUpdateLabScripts() || canDeleteLabScripts();
  const canManageAppointments = () => canCreateAppointments() || canUpdateAppointments() || canDeleteAppointments();
  const canManageCAD = () => canCreateCAD() || canUpdateCAD() || canDeleteCAD() || canApproveCAD();

  // Check if user has admin privileges
  const isAdminUser = () => isSuperAdmin() || isAdmin();

  // Check if user can access admin sections
  const canAccessUserManagement = () => canReadUsers() && isAdminUser();
  const canAccessRoleManagement = () => canReadRoles() && isAdminUser();

  return {
    // Raw data
    userPermissions,
    userRoles,
    hasPermission,
    hasRole,

    // User permissions
    canCreateUsers,
    canReadUsers,
    canUpdateUsers,
    canDeleteUsers,
    canManageUserRoles,
    canChangeUserStatus,

    // Role permissions
    canCreateRoles,
    canReadRoles,
    canUpdateRoles,
    canDeleteRoles,
    canManageRolePermissions,

    // Patient permissions
    canCreatePatients,
    canReadPatients,
    canUpdatePatients,
    canDeletePatients,

    // Lab script permissions
    canCreateLabScripts,
    canReadLabScripts,
    canUpdateLabScripts,
    canDeleteLabScripts,
    canChangeLabScriptStatus,

    // Report permissions
    canCreateLabReports,
    canReadLabReports,
    canCreateClinicalReports,
    canReadClinicalReports,

    // Appointment permissions
    canCreateAppointments,
    canReadAppointments,
    canUpdateAppointments,
    canDeleteAppointments,

    // CAD permissions
    canCreateCAD,
    canReadCAD,
    canUpdateCAD,
    canDeleteCAD,
    canExportCAD,
    canApproveCAD,

    // System permissions
    canAccessDashboard,
    canAccessSystemSettings,
    canViewAuditLogs,

    // Role checks
    isSuperAdmin,
    isAdmin,
    isDentist,
    isLabTechnician,
    isCADDesigner,
    isReceptionist,
    isViewer,

    // Combined checks
    canManageUsers,
    canManageRoles,
    canManagePatients,
    canManageLabScripts,
    canManageAppointments,
    canManageCAD,
    isAdminUser,
    canAccessUserManagement,
    canAccessRoleManagement,
  };
}
