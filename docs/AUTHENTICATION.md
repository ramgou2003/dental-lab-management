# Authentication & Role-Based Access Control (RBAC)

This document describes the comprehensive authentication and authorization system implemented in the Dental Lab Management application.

## 🏗️ System Architecture

### Database Schema

The authentication system uses 6 core tables:

1. **`user_profiles`** - Extended user information
2. **`roles`** - System and custom roles
3. **`user_roles`** - User-role assignments (many-to-many)
4. **`permissions`** - Granular permission definitions
5. **`role_permissions`** - Role-permission assignments (many-to-many)
6. **`audit_logs`** - Activity tracking and security monitoring

### System Roles

| Role | Description | User Count | Permission Count |
|------|-------------|------------|------------------|
| **Super Admin** | Full system access, cannot be deleted | - | 31 permissions |
| **Admin** | Manage users, roles, and system settings | - | 30 permissions |
| **Dentist** | Create lab scripts, manage patients, view reports | - | 12 permissions |
| **Lab Technician** | Process lab scripts, create lab reports | - | 6 permissions |
| **Receptionist** | Manage appointments, basic patient info | - | 8 permissions |
| **Viewer** | Read-only access to assigned modules | - | 6 permissions |

### Permission Modules

- **Users** (6 permissions) - User account management
- **Roles** (5 permissions) - Role and permission management
- **Patients** (4 permissions) - Patient information management
- **Lab Scripts** (5 permissions) - Lab script workflow
- **Reports** (4 permissions) - Report generation and viewing
- **Appointments** (4 permissions) - Appointment scheduling
- **Dashboard** (1 permission) - Dashboard access
- **System** (2 permissions) - System settings and audit logs

## 🚀 Getting Started

### 1. Initial Setup

1. **Database Setup**: The database schema is automatically created when the application starts
2. **Create First Admin User**:
   ```sql
   -- Run in Supabase SQL Editor
   -- See docs/admin-setup.sql for complete setup script
   ```

### 2. Creating Users

#### Through Admin Interface (Recommended)
1. Login as an admin user
2. Navigate to **User Management** → **Users** tab
3. Click **Add User**
4. Fill in user details and assign roles
5. User receives login credentials

#### Through Supabase Dashboard
1. Go to Supabase Dashboard → Authentication → Users
2. Click **Add User**
3. Enter email and password
4. User profile is automatically created via trigger
5. Assign roles through the admin interface

### 3. Role Management

#### Viewing Roles
- Navigate to **User Management** → **Roles** tab
- View all system and custom roles
- See user count and permission count for each role

#### Creating Custom Roles
1. Click **Create Role** (admin only)
2. Define role name, display name, and description
3. Assign specific permissions
4. Save and assign to users

#### Managing Permissions
- System roles have predefined permissions
- Custom roles can have any combination of permissions
- Permissions are organized by module and action

## 🔐 Security Features

### Authentication
- **Supabase Auth** integration for secure user management
- **JWT tokens** for session management
- **Password policies** with minimum requirements
- **Session timeout** and automatic logout

### Authorization
- **Role-based access control** with granular permissions
- **Route protection** - Pages require specific permissions
- **Component-level protection** - UI elements show/hide based on permissions
- **API-level protection** - Row Level Security (RLS) policies

### Audit & Monitoring
- **User activity logging** - Login/logout events
- **Permission changes** - Role assignments and modifications
- **Data access tracking** - Who accessed what and when
- **Failed access attempts** - Security monitoring

## 🛠️ Development Guide

### Using Authentication in Components

```tsx
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionGuard } from '@/components/auth/AuthGuard';

function MyComponent() {
  const { user, userProfile } = useAuth();
  const { canCreateUsers, isAdmin } = usePermissions();

  return (
    <div>
      <h1>Welcome, {userProfile?.full_name}</h1>
      
      <PermissionGuard permission="users.create">
        <button>Create User</button>
      </PermissionGuard>
      
      {isAdmin() && (
        <div>Admin-only content</div>
      )}
    </div>
  );
}
```

### Route Protection

```tsx
import { withAuthGuard } from '@/components/auth/AuthGuard';

// Protect entire page
const ProtectedPage = withAuthGuard(MyPage, {
  requireAuth: true,
  permission: 'users.read',
  role: 'admin'
});

// Or use AuthGuard component
<AuthGuard requireAuth={true}>
  <PermissionGuard permission="users.read">
    <MyPage />
  </PermissionGuard>
</AuthGuard>
```

### Available Hooks

#### `useAuth()`
```tsx
const {
  user,              // Supabase user object
  userProfile,       // Extended user profile
  userRoles,         // User's assigned roles
  userPermissions,   // Flattened permissions array
  session,           // Current session
  loading,           // Loading state
  signIn,            // Login function
  signUp,            // Registration function
  signOut,           // Logout function
  hasPermission,     // Check specific permission
  hasRole,           // Check specific role
  refreshUserData    // Refresh user data
} = useAuth();
```

#### `usePermissions()`
```tsx
const {
  // Permission checks
  canCreateUsers,
  canReadUsers,
  canUpdateUsers,
  canDeleteUsers,
  
  // Role checks
  isAdmin,
  isDentist,
  isLabTechnician,
  
  // Combined checks
  canManageUsers,
  canAccessUserManagement
} = usePermissions();
```

## 📊 Admin Interface

### User Management
- **View all users** with status and role information
- **Create new users** with role assignment
- **Edit user profiles** and contact information
- **Manage user roles** - assign/remove roles
- **Change user status** - activate/deactivate/suspend
- **Delete users** (with proper permissions)

### Role Management
- **View all roles** with user and permission counts
- **Create custom roles** with specific permissions
- **Edit role details** and descriptions
- **Manage role permissions** - assign/remove permissions
- **Activate/deactivate roles**
- **Delete custom roles** (system roles protected)

### Security Monitoring
- **User activity logs** - login history and actions
- **Permission usage analytics** - who uses what
- **Role assignment history** - changes over time
- **Failed access attempts** - security alerts

## 🔧 Configuration

### Environment Variables
```env
# Supabase Configuration (already configured)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Settings
- **Email confirmation**: Disabled for admin-created users
- **Password requirements**: Minimum 6 characters
- **Session timeout**: 24 hours (configurable)
- **JWT expiry**: 1 hour with refresh

## 🚨 Troubleshooting

### Common Issues

1. **User can't login**
   - Check user status (active/inactive/suspended)
   - Verify email and password
   - Check Supabase Auth logs

2. **Permission denied errors**
   - Verify user has required role
   - Check role has required permission
   - Refresh user data

3. **User not seeing admin features**
   - Confirm user has admin role
   - Check role permissions
   - Clear browser cache

### Debug Queries

```sql
-- Check user permissions
SELECT * FROM get_user_permissions('user-id-here');

-- Verify role assignments
SELECT * FROM user_roles WHERE user_id = 'user-id-here';

-- Check permission inheritance
SELECT user_has_permission('user-id-here', 'users.create');
```

## 📈 Future Enhancements

- **Multi-factor authentication** (MFA)
- **Single sign-on** (SSO) integration
- **Advanced password policies**
- **IP-based access restrictions**
- **Advanced audit reporting**
- **Role templates** for quick setup
- **Bulk user operations**
- **API key management**

## 📞 Support

For authentication-related issues:
1. Check this documentation
2. Review Supabase Auth logs
3. Use debug queries in `docs/admin-setup.sql`
4. Contact system administrator

---

**Security Note**: Always follow the principle of least privilege when assigning roles and permissions. Regularly review user access and remove unnecessary permissions.
