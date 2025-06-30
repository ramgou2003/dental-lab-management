import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  AuthReconnectingAnimation, 
  AuthLostAnimation,
  AuthLoadingProfileAnimation 
} from './AuthLoadingAnimation';

type SessionState = 'stable' | 'reconnecting' | 'lost' | 'loading_profile';

export function SessionManager({ children }: { children: React.ReactNode }) {
  const { user, session, loading } = useAuth();
  const [sessionState, setSessionState] = useState<SessionState>('stable');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastConnectionCheck, setLastConnectionCheck] = useState(Date.now());

  // Monitor session health
  useEffect(() => {
    let healthCheckInterval: NodeJS.Timeout;
    let reconnectTimeout: NodeJS.Timeout;

    const checkSessionHealth = async () => {
      try {
        // Check if we have a session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('Session health check failed:', error);
          handleSessionIssue();
          return;
        }

        if (!currentSession && user) {
          // We had a user but lost the session
          console.warn('Session lost, attempting to reconnect...');
          handleSessionIssue();
          return;
        }

        // Session is healthy
        if (sessionState !== 'stable' && currentSession) {
          setSessionState('stable');
          setReconnectAttempts(0);
        }

        setLastConnectionCheck(Date.now());
      } catch (error) {
        console.error('Session health check error:', error);
        handleSessionIssue();
      }
    };

    const handleSessionIssue = () => {
      if (sessionState === 'stable') {
        setSessionState('reconnecting');
        attemptReconnection();
      }
    };

    const attemptReconnection = async () => {
      const maxAttempts = 3;
      const currentAttempt = reconnectAttempts + 1;

      if (currentAttempt > maxAttempts) {
        setSessionState('lost');
        return;
      }

      setReconnectAttempts(currentAttempt);

      try {
        // Try to refresh the session
        const { data, error } = await supabase.auth.refreshSession();
        
        if (error || !data.session) {
          // Reconnection failed, try again after delay
          reconnectTimeout = setTimeout(() => {
            attemptReconnection();
          }, 2000 * currentAttempt); // Exponential backoff
        } else {
          // Reconnection successful
          setSessionState('stable');
          setReconnectAttempts(0);
        }
      } catch (error) {
        console.error('Reconnection attempt failed:', error);
        // Try again after delay
        reconnectTimeout = setTimeout(() => {
          attemptReconnection();
        }, 2000 * currentAttempt);
      }
    };

    // Start health checks if we have a user
    if (user && session) {
      healthCheckInterval = setInterval(checkSessionHealth, 30000); // Check every 30 seconds
    }

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        switch (event) {
          case 'SIGNED_OUT':
            setSessionState('lost');
            break;
          case 'TOKEN_REFRESHED':
            if (sessionState !== 'stable') {
              setSessionState('stable');
              setReconnectAttempts(0);
            }
            break;
          case 'SIGNED_IN':
            setSessionState('loading_profile');
            // Give some time for profile to load
            setTimeout(() => {
              setSessionState('stable');
            }, 1500);
            break;
        }
      }
    );

    return () => {
      if (healthCheckInterval) clearInterval(healthCheckInterval);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      subscription.unsubscribe();
    };
  }, [user, session, sessionState, reconnectAttempts]);

  // Handle different session states
  switch (sessionState) {
    case 'reconnecting':
      return <AuthReconnectingAnimation />;
    
    case 'lost':
      return <AuthLostAnimation />;
    
    case 'loading_profile':
      return <AuthLoadingProfileAnimation />;
    
    case 'stable':
    default:
      return <>{children}</>;
  }
}

// Hook to manually trigger session recovery
export function useSessionRecovery() {
  const [isRecovering, setIsRecovering] = useState(false);

  const recoverSession = async () => {
    setIsRecovering(true);
    
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session recovery failed:', error);
        // Redirect to login
        window.location.href = '/login';
      } else {
        console.log('Session recovered successfully');
      }
    } catch (error) {
      console.error('Session recovery error:', error);
      window.location.href = '/login';
    } finally {
      setIsRecovering(false);
    }
  };

  const forceReload = () => {
    window.location.reload();
  };

  return {
    isRecovering,
    recoverSession,
    forceReload,
  };
}
