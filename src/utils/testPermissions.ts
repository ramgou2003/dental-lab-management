// Test utility for verifying permission system
// This file helps verify that permissions are working correctly

export interface PermissionTest {
  permission: string;
  description: string;
  expectedRoles: string[];
  component?: string;
  route?: string;
}

export const PERMISSION_TESTS: PermissionTest[] = [
  // Dashboard permissions
  {
    permission: 'dashboard.access',
    description: 'Access main dashboard',
    expectedRoles: ['super_admin', 'admin', 'dentist', 'lab_technician', 'cad_designer', 'receptionist', 'viewer'],
    route: '/dashboard'
  },

  // User management permissions
  {
    permission: 'users.create',
    description: 'Create new users',
    expectedRoles: ['super_admin', 'admin'],
    component: 'CreateUserForm'
  },
  {
    permission: 'users.read',
    description: 'View user information',
    expectedRoles: ['super_admin', 'admin'],
    route: '/user-management'
  },
  {
    permission: 'users.update',
    description: 'Edit user profiles',
    expectedRoles: ['super_admin', 'admin'],
    component: 'EditUserForm'
  },
  {
    permission: 'users.delete',
    description: 'Delete user accounts',
    expectedRoles: ['super_admin', 'admin'],
    component: 'DeleteUserButton'
  },
  {
    permission: 'users.manage_roles',
    description: 'Assign/remove user roles',
    expectedRoles: ['super_admin', 'admin'],
    component: 'UserRoleAssignment'
  },

  // Role management permissions
  {
    permission: 'roles.create',
    description: 'Create new roles',
    expectedRoles: ['super_admin', 'admin'],
    component: 'CreateRoleForm'
  },
  {
    permission: 'roles.read',
    description: 'View roles and permissions',
    expectedRoles: ['super_admin', 'admin'],
    component: 'RoleManagement'
  },
  {
    permission: 'roles.update',
    description: 'Edit role details',
    expectedRoles: ['super_admin', 'admin'],
    component: 'EditRoleForm'
  },
  {
    permission: 'roles.delete',
    description: 'Delete custom roles',
    expectedRoles: ['super_admin', 'admin'],
    component: 'DeleteRoleButton'
  },

  // Patient permissions
  {
    permission: 'patients.create',
    description: 'Create new patients',
    expectedRoles: ['super_admin', 'admin', 'dentist', 'receptionist'],
    component: 'AddPatientButton'
  },
  {
    permission: 'patients.read',
    description: 'View patient information',
    expectedRoles: ['super_admin', 'admin', 'dentist', 'lab_technician', 'cad_designer', 'receptionist', 'viewer'],
    route: '/patients'
  },
  {
    permission: 'patients.update',
    description: 'Edit patient information',
    expectedRoles: ['super_admin', 'admin', 'dentist', 'receptionist'],
    component: 'EditPatientForm'
  },
  {
    permission: 'patients.delete',
    description: 'Delete patient records',
    expectedRoles: ['super_admin', 'admin', 'dentist'],
    component: 'DeletePatientButton'
  },

  // Lab script permissions
  {
    permission: 'lab_scripts.create',
    description: 'Create new lab scripts',
    expectedRoles: ['super_admin', 'admin', 'dentist'],
    component: 'NewLabScriptButton'
  },
  {
    permission: 'lab_scripts.read',
    description: 'View lab scripts',
    expectedRoles: ['super_admin', 'admin', 'dentist', 'lab_technician', 'cad_designer', 'receptionist', 'viewer'],
    route: '/lab/lab-scripts'
  },
  {
    permission: 'lab_scripts.update',
    description: 'Edit lab scripts',
    expectedRoles: ['super_admin', 'admin', 'dentist', 'lab_technician', 'cad_designer'],
    component: 'EditLabScriptButton'
  },
  {
    permission: 'lab_scripts.delete',
    description: 'Delete lab scripts',
    expectedRoles: ['super_admin', 'admin', 'dentist'],
    component: 'DeleteLabScriptButton'
  },

  // CAD permissions
  {
    permission: 'cad.create',
    description: 'Create CAD designs',
    expectedRoles: ['super_admin', 'admin', 'cad_designer'],
    component: 'CreateCADButton'
  },
  {
    permission: 'cad.read',
    description: 'View CAD designs',
    expectedRoles: ['super_admin', 'admin', 'cad_designer'],
    component: 'ViewCADButton'
  },
  {
    permission: 'cad.update',
    description: 'Edit CAD designs',
    expectedRoles: ['super_admin', 'admin', 'cad_designer'],
    component: 'EditCADButton'
  },
  {
    permission: 'cad.delete',
    description: 'Delete CAD designs',
    expectedRoles: ['super_admin', 'admin', 'cad_designer'],
    component: 'DeleteCADButton'
  },
  {
    permission: 'cad.export',
    description: 'Export CAD files',
    expectedRoles: ['super_admin', 'admin', 'cad_designer'],
    component: 'ExportCADButton'
  },
  {
    permission: 'cad.approve',
    description: 'Approve CAD designs',
    expectedRoles: ['super_admin', 'admin', 'cad_designer'],
    component: 'ApproveCADButton'
  },

  // Appointment permissions
  {
    permission: 'appointments.create',
    description: 'Create appointments',
    expectedRoles: ['super_admin', 'admin', 'dentist', 'receptionist'],
    component: 'CreateAppointmentButton'
  },
  {
    permission: 'appointments.read',
    description: 'View appointments',
    expectedRoles: ['super_admin', 'admin', 'dentist', 'receptionist', 'viewer'],
    route: '/appointments'
  },
  {
    permission: 'appointments.update',
    description: 'Edit appointments',
    expectedRoles: ['super_admin', 'admin', 'dentist', 'receptionist'],
    component: 'EditAppointmentButton'
  },
  {
    permission: 'appointments.delete',
    description: 'Delete appointments',
    expectedRoles: ['super_admin', 'admin', 'dentist', 'receptionist'],
    component: 'DeleteAppointmentButton'
  },

  // Report permissions
  {
    permission: 'reports.lab.create',
    description: 'Create lab reports',
    expectedRoles: ['super_admin', 'admin', 'lab_technician'],
    component: 'CreateLabReportButton'
  },
  {
    permission: 'reports.lab.read',
    description: 'View lab reports',
    expectedRoles: ['super_admin', 'admin', 'dentist', 'lab_technician', 'cad_designer', 'viewer'],
    component: 'ViewLabReportButton'
  },
  {
    permission: 'reports.clinical.create',
    description: 'Create clinical reports',
    expectedRoles: ['super_admin', 'admin', 'dentist'],
    component: 'CreateClinicalReportButton'
  },
  {
    permission: 'reports.clinical.read',
    description: 'View clinical reports',
    expectedRoles: ['super_admin', 'admin', 'dentist', 'viewer'],
    component: 'ViewClinicalReportButton'
  },

  // System permissions
  {
    permission: 'system.settings',
    description: 'Access system settings',
    expectedRoles: ['super_admin'],
    component: 'SystemSettingsButton'
  },
  {
    permission: 'system.audit_logs',
    description: 'View audit logs',
    expectedRoles: ['super_admin', 'admin'],
    component: 'AuditLogsButton'
  }
];

// Helper function to get permissions for a role
export function getPermissionsForRole(roleName: string): string[] {
  return PERMISSION_TESTS
    .filter(test => test.expectedRoles.includes(roleName))
    .map(test => test.permission);
}

// Helper function to get roles that have a specific permission
export function getRolesWithPermission(permission: string): string[] {
  const test = PERMISSION_TESTS.find(t => t.permission === permission);
  return test ? test.expectedRoles : [];
}

// Validation function to check if permission assignment is correct
export function validatePermissionAssignment(roleName: string, permissions: string[]): {
  valid: boolean;
  missing: string[];
  extra: string[];
} {
  const expectedPermissions = getPermissionsForRole(roleName);
  const missing = expectedPermissions.filter(p => !permissions.includes(p));
  const extra = permissions.filter(p => !expectedPermissions.includes(p));
  
  return {
    valid: missing.length === 0 && extra.length === 0,
    missing,
    extra
  };
}

// Test summary
export function getTestSummary() {
  const totalPermissions = PERMISSION_TESTS.length;
  const routeProtectedPages = PERMISSION_TESTS.filter(t => t.route).length;
  const componentProtections = PERMISSION_TESTS.filter(t => t.component).length;
  const modules = [...new Set(PERMISSION_TESTS.map(t => t.permission.split('.')[0]))];
  
  return {
    totalPermissions,
    routeProtectedPages,
    componentProtections,
    modules: modules.length,
    moduleNames: modules
  };
}
