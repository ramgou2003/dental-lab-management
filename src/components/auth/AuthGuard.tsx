import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function AuthGuard({
  children,
  requireAuth = true,
  redirectTo = '/login'
}: AuthGuardProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [forceLoad, setForceLoad] = useState(false);

  // Force load after 1 second to prevent infinite loading (much shorter now)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.warn('AuthGuard: Forcing load after timeout');
        setForceLoad(true);
      }
    }, 1000); // Reduced to 1 second

    return () => clearTimeout(timer);
  }, [loading]);

  // Show minimal loading only for very brief periods
  if (loading && !forceLoad) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If user is authenticated but trying to access auth pages (login, signup)
  // Allow access to new-patient page even for authenticated users
  if (!requireAuth && user && location.pathname !== '/new-patient') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: string;
  role?: string;
  fallback?: React.ReactNode;
  requireAll?: boolean; // If true, user must have ALL specified permissions/roles
}

export function PermissionGuard({ 
  children, 
  permission, 
  role, 
  fallback = null,
  requireAll = false 
}: PermissionGuardProps) {
  const { hasPermission, hasRole, loading } = useAuth();

  // Show loading while checking permissions
  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
      </div>
    );
  }

  let hasAccess = true;

  // Check permission
  if (permission) {
    const permissions = Array.isArray(permission) ? permission : [permission];
    if (requireAll) {
      hasAccess = permissions.every(p => hasPermission(p));
    } else {
      hasAccess = permissions.some(p => hasPermission(p));
    }
  }

  // Check role
  if (role && hasAccess) {
    const roles = Array.isArray(role) ? role : [role];
    if (requireAll) {
      hasAccess = roles.every(r => hasRole(r));
    } else {
      hasAccess = roles.some(r => hasRole(r));
    }
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Higher-order component for route protection
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    requireAuth?: boolean;
    permission?: string | string[];
    role?: string | string[];
    redirectTo?: string;
  } = {}
) {
  return function AuthGuardedComponent(props: P) {
    return (
      <AuthGuard 
        requireAuth={options.requireAuth} 
        redirectTo={options.redirectTo}
      >
        <PermissionGuard 
          permission={options.permission} 
          role={options.role}
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  <strong className="font-bold">Access Denied</strong>
                  <span className="block sm:inline"> You don't have permission to access this page.</span>
                </div>
              </div>
            </div>
          }
        >
          <Component {...props} />
        </PermissionGuard>
      </AuthGuard>
    );
  };
}
