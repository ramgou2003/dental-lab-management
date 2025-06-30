import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export type AuthState = 
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'
  | 'session_expired'
  | 'reconnecting'
  | 'verifying';

export function useAuthState() {
  const { user, loading, session } = useAuth();
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [previousUser, setPreviousUser] = useState(user);

  useEffect(() => {
    // If we're loading, show loading state
    if (loading) {
      setAuthState('loading');
      return;
    }

    // If we have a user and session, we're authenticated
    if (user && session) {
      setAuthState('authenticated');
      setPreviousUser(user);
      return;
    }

    // If we don't have a user but we had one before, session expired
    if (!user && previousUser) {
      setAuthState('session_expired');
      return;
    }

    // If we never had a user, we're just unauthenticated
    if (!user && !previousUser) {
      setAuthState('unauthenticated');
      return;
    }

    // Default to unauthenticated
    setAuthState('unauthenticated');
  }, [user, loading, session, previousUser]);

  return {
    authState,
    isLoading: authState === 'loading',
    isAuthenticated: authState === 'authenticated',
    isUnauthenticated: authState === 'unauthenticated',
    isSessionExpired: authState === 'session_expired',
    isReconnecting: authState === 'reconnecting',
    isVerifying: authState === 'verifying',
  };
}
