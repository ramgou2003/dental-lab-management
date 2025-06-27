import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export class SessionManager {
  private static instance: SessionManager;
  private refreshTimer: NodeJS.Timeout | null = null;
  private isRefreshing = false;
  private activityTimer: NodeJS.Timeout | null = null;
  private statusCheckTimer: NodeJS.Timeout | null = null;
  private lastActivity = Date.now();
  private currentUserId: string | null = null;
  private realtimeChannel: any = null;

  private constructor() {
    this.setupActivityTracking();
  }

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  /**
   * Initialize session management with automatic token refresh
   */
  public async initialize(): Promise<void> {
    try {
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('SessionManager: Error getting session:', error);
        return;
      }

      if (session?.user) {
        this.currentUserId = session.user.id;
        this.scheduleTokenRefresh(session);

        // Start monitoring with a small delay to ensure auth context is ready
        setTimeout(() => {
          this.startUserStatusMonitoring();
        }, 1000);
      }

      // Listen for auth state changes
      supabase.auth.onAuthStateChange((event, session) => {
        console.log('SessionManager: Auth state changed:', event, session ? 'Session exists' : 'No session');

        try {
          if (event === 'SIGNED_IN' && session?.user) {
            this.currentUserId = session.user.id;
            this.scheduleTokenRefresh(session);

            // Start monitoring with a small delay
            setTimeout(() => {
              this.startUserStatusMonitoring();
            }, 1000);
          } else if (event === 'SIGNED_OUT') {
            this.currentUserId = null;
            this.clearRefreshTimer();
            this.stopUserStatusMonitoring();
          } else if (event === 'TOKEN_REFRESHED' && session) {
            console.log('SessionManager: Token refreshed, updating session tracking');
            this.scheduleTokenRefresh(session);

            // Ensure user ID is maintained after token refresh
            if (session.user && !this.currentUserId) {
              this.currentUserId = session.user.id;
              console.log('SessionManager: Restored user ID after token refresh');
            }
          }
        } catch (authError) {
          console.error('SessionManager: Error handling auth state change:', authError);
        }
      });

    } catch (error) {
      console.error('SessionManager: Error initializing session manager:', error);
    }
  }

  /**
   * Schedule token refresh before expiry
   */
  private scheduleTokenRefresh(session: any): void {
    this.clearRefreshTimer();

    if (!session?.expires_at) return;

    // Calculate time until token expires (refresh 1 hour before expiry for 24h tokens)
    const expiresAt = session.expires_at * 1000; // Convert to milliseconds
    const now = Date.now();
    const timeUntilRefresh = expiresAt - now - (60 * 60 * 1000); // 1 hour before expiry

    if (timeUntilRefresh > 0) {
      console.log(`SessionManager: Scheduling token refresh in ${Math.round(timeUntilRefresh / 1000 / 60)} minutes`);

      this.refreshTimer = setTimeout(async () => {
        await this.refreshToken();
      }, timeUntilRefresh);
    } else {
      // Token is already expired or will expire soon, refresh immediately
      console.log('SessionManager: Token expires soon, refreshing immediately');
      this.refreshToken();
    }
  }

  /**
   * Manually refresh the authentication token
   */
  public async refreshToken(): Promise<boolean> {
    if (this.isRefreshing) {
      console.log('SessionManager: Token refresh already in progress');
      return false;
    }

    this.isRefreshing = true;

    try {
      console.log('SessionManager: Refreshing token...');
      
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('SessionManager: Error refreshing token:', error);
        
        // If refresh fails, user might need to re-authenticate
        if (error.message?.includes('refresh_token_not_found') || 
            error.message?.includes('invalid_grant')) {
          console.log('SessionManager: Refresh token invalid, signing out user');
          await supabase.auth.signOut();
        }
        
        return false;
      }

      if (data.session) {
        console.log('SessionManager: Token refreshed successfully');
        this.scheduleTokenRefresh(data.session);
        return true;
      }

      return false;
    } catch (error) {
      console.error('SessionManager: Unexpected error during token refresh:', error);
      return false;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Clear the refresh timer
   */
  private clearRefreshTimer(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Check if current session is valid
   */
  public async isSessionValid(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return false;
      
      // Check if token is expired
      const now = Math.floor(Date.now() / 1000);
      return session.expires_at ? session.expires_at > now : false;
    } catch (error) {
      console.error('SessionManager: Error checking session validity:', error);
      return false;
    }
  }

  /**
   * Setup activity tracking for automatic session extension
   */
  private setupActivityTracking(): void {
    if (typeof window === 'undefined') return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    const updateActivity = () => {
      this.lastActivity = Date.now();
    };

    events.forEach(event => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    // Check activity every 5 minutes
    this.activityTimer = setInterval(() => {
      this.checkActivityAndRefresh();
    }, 5 * 60 * 1000);
  }

  /**
   * Check if user is active and refresh token if needed
   */
  private async checkActivityAndRefresh(): Promise<void> {
    const now = Date.now();
    const timeSinceActivity = now - this.lastActivity;

    // If user was active in the last 30 minutes, keep session alive
    if (timeSinceActivity < 30 * 60 * 1000) {
      const isValid = await this.isSessionValid();
      if (!isValid) {
        console.log('SessionManager: Session invalid, attempting refresh due to user activity');
        await this.refreshToken();
      }
    }
  }

  /**
   * Start monitoring user status for real-time account status changes
   */
  private startUserStatusMonitoring(): void {
    if (!this.currentUserId) return;

    try {
      // Set up real-time listening for user status changes
      this.setupRealtimeStatusListener();

      // Check user status every 30 seconds as backup
      this.statusCheckTimer = setInterval(async () => {
        try {
          await this.checkUserStatus();
        } catch (error) {
          console.warn('SessionManager: Error in status check:', error);
        }
      }, 30 * 1000);

      console.log('SessionManager: Started user status monitoring');
    } catch (error) {
      console.warn('SessionManager: Failed to start user status monitoring:', error);
    }
  }

  /**
   * Setup real-time listener for user status changes
   */
  private setupRealtimeStatusListener(): void {
    if (!this.currentUserId) return;

    try {
      // Listen for changes to the current user's profile
      this.realtimeChannel = supabase
        .channel('user-status-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'user_profiles',
            filter: `id=eq.${this.currentUserId}`
          },
          (payload) => {
            console.log('SessionManager: Real-time user status change detected:', payload);
            this.handleRealtimeStatusChange(payload);
          }
        )
        .subscribe((status) => {
          console.log('SessionManager: Real-time subscription status:', status);
          if (status === 'SUBSCRIPTION_ERROR') {
            console.warn('SessionManager: Real-time subscription failed, falling back to polling');
          }
        });

      // Also listen for force logout notifications
      const forceLogoutChannel = supabase
        .channel(`force-logout-${this.currentUserId}`)
        .on('broadcast', { event: 'force_logout' }, (payload) => {
          console.log('SessionManager: Force logout received:', payload);
          this.handleForceLogout(payload.payload);
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIPTION_ERROR') {
            console.warn('SessionManager: Force logout subscription failed');
          }
        });
    } catch (error) {
      console.error('SessionManager: Error setting up real-time listeners:', error);
      // Continue without real-time features if they fail
    }
  }

  /**
   * Handle real-time status changes
   */
  private async handleRealtimeStatusChange(payload: any): Promise<void> {
    const newRecord = payload.new;
    const oldRecord = payload.old;

    if (newRecord?.status !== 'active' && oldRecord?.status === 'active') {
      console.log('SessionManager: User status changed to inactive via real-time update');
      await this.handleInactiveAccount(newRecord.status);
    }
  }

  /**
   * Handle force logout notification
   */
  private async handleForceLogout(payload: any): Promise<void> {
    console.log('SessionManager: Processing force logout');

    const reason = payload.reason || 'Your session has been terminated by an administrator.';

    // Show message and logout
    toast.error(reason, {
      duration: 10000,
      action: {
        label: 'Contact Admin',
        onClick: () => {
          window.location.href = '/contact-admin';
        }
      }
    });

    // Cleanup and logout
    this.cleanup();
    await supabase.auth.signOut();

    setTimeout(() => {
      window.location.href = '/login?reason=force_logout';
    }, 2000);
  }

  /**
   * Stop monitoring user status
   */
  private stopUserStatusMonitoring(): void {
    if (this.statusCheckTimer) {
      clearInterval(this.statusCheckTimer);
      this.statusCheckTimer = null;
    }

    if (this.realtimeChannel) {
      supabase.removeChannel(this.realtimeChannel);
      this.realtimeChannel = null;
    }

    console.log('SessionManager: Stopped user status monitoring');
  }

  /**
   * Check current user's account status
   */
  private async checkUserStatus(): Promise<void> {
    if (!this.currentUserId) return;

    try {
      const { data: userProfile, error } = await supabase
        .from('user_profiles')
        .select('status')
        .eq('id', this.currentUserId)
        .single();

      if (error) {
        console.error('SessionManager: Error checking user status:', error);
        return;
      }

      if (userProfile?.status !== 'active') {
        console.log('SessionManager: User account is not active, signing out');
        await this.handleInactiveAccount(userProfile?.status);
      }
    } catch (error) {
      console.error('SessionManager: Error in status check:', error);
    }
  }

  /**
   * Handle inactive account by showing message and signing out
   */
  private async handleInactiveAccount(status: string): Promise<void> {
    // Stop all timers first
    this.cleanup();

    // Show appropriate message based on status
    let message = 'Your account has been deactivated. Please contact your administrator.';

    switch (status) {
      case 'inactive':
        message = 'Your account is inactive. Please contact your administrator to reactivate your account.';
        break;
      case 'suspended':
        message = 'Your account has been suspended. Please contact your administrator for assistance.';
        break;
      case 'disabled':
        message = 'Your account has been disabled. Please contact your administrator.';
        break;
    }

    // Show error toast
    toast.error(message, {
      duration: 10000, // Show for 10 seconds
      action: {
        label: 'Contact Admin',
        onClick: () => {
          // Redirect to contact admin page
          window.location.href = '/contact-admin';
        }
      }
    });

    // Sign out the user
    try {
      await supabase.auth.signOut();
      // Redirect to login with a message
      setTimeout(() => {
        window.location.href = '/login?reason=account_inactive';
      }, 2000);
    } catch (error) {
      console.error('SessionManager: Error signing out inactive user:', error);
      // Force redirect even if signout fails
      window.location.href = '/login?reason=account_inactive';
    }
  }

  /**
   * Clear activity timer
   */
  private clearActivityTimer(): void {
    if (this.activityTimer) {
      clearInterval(this.activityTimer);
      this.activityTimer = null;
    }
  }

  /**
   * Cleanup when component unmounts or app closes
   */
  public cleanup(): void {
    this.clearRefreshTimer();
    this.clearActivityTimer();
    this.stopUserStatusMonitoring();
  }
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance();
