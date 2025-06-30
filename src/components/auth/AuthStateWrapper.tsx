import React from 'react';
import { useAuthState } from '@/hooks/useAuthState';
import { 
  AuthLoadingAnimation, 
  AuthVerifyingAnimation, 
  AuthReconnectingAnimation,
  AuthLostAnimation 
} from './AuthLoadingAnimation';

interface AuthStateWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthStateWrapper({ children, fallback }: AuthStateWrapperProps) {
  const { authState } = useAuthState();

  switch (authState) {
    case 'loading':
      return <AuthLoadingAnimation message="Initializing..." />;
    
    case 'verifying':
      return <AuthVerifyingAnimation />;
    
    case 'reconnecting':
      return <AuthReconnectingAnimation />;
    
    case 'session_expired':
      return <AuthLostAnimation />;
    
    case 'unauthenticated':
      return fallback ? <>{fallback}</> : <AuthLostAnimation />;
    
    case 'authenticated':
      return <>{children}</>;
    
    default:
      return <AuthLoadingAnimation message="Loading..." />;
  }
}

// Higher-order component version
export function withAuthStateWrapper<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    fallback?: React.ReactNode;
  }
) {
  return function WrappedComponent(props: P) {
    return (
      <AuthStateWrapper fallback={options?.fallback}>
        <Component {...props} />
      </AuthStateWrapper>
    );
  };
}

// Hook to manually trigger auth state changes
export function useAuthStateActions() {
  const { authState } = useAuthState();

  const triggerReconnect = () => {
    // This could trigger a reconnection attempt
    window.location.reload();
  };

  const goToLogin = () => {
    window.location.href = '/login';
  };

  return {
    authState,
    triggerReconnect,
    goToLogin,
  };
}
