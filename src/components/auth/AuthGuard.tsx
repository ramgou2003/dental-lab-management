import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { AuthLoadingAnimation, AuthVerifyingAnimation } from './AuthLoadingAnimation';

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

  // Show beautiful loading animation for authentication
  if (loading && !forceLoad) {
    return <AuthVerifyingAnimation />;
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If user is authenticated but trying to access auth pages (login, signup)
  if (!requireAuth && user) {
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
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-3 relative">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 absolute inset-0" />
            <div className="absolute inset-1 bg-white rounded-full shadow-inner"></div>
            <div className="absolute inset-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full animate-pulse"></div>
          </div>
          <p className="text-sm text-gray-600 animate-fade-in">Checking permissions...</p>
        </div>
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
