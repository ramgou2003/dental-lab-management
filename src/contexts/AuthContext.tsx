import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { authCache } from '@/utils/authCache';
import { sessionManager } from '@/utils/sessionManager';

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  status: 'active' | 'inactive' | 'suspended' | 'disabled';
  created_at: string;
  updated_at: string;
  last_login?: string;
}

interface UserRole {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  userRoles: UserRole[];
  userPermissions: string[];
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (roleName: string) => boolean;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Optimized fetch user profile and roles in parallel
  const fetchUserData = async (userId: string) => {
    try {
      console.log('Fetching user data for:', userId);

      // Fetch all data in parallel with shorter timeouts
      const [profileResult, rolesResult] = await Promise.allSettled([
        // Profile fetch with 3-second timeout
        Promise.race([
          supabase
            .from('user_profiles')
            .select('id, email, first_name, last_name, full_name, phone, avatar_url, status, created_at, updated_at, last_login')
            .eq('id', userId)
            .single(),
          new Promise<any>((_, reject) =>
            setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
          )
        ]),

        // Roles and permissions fetch with 3-second timeout (combined query)
        Promise.race([
          supabase
            .from('user_roles')
            .select(`
              role_id,
              roles!inner (
                id,
                name,
                display_name,
                description,
                role_permissions (
                  permissions (
                    name
                  )
                )
              )
            `)
            .eq('user_id', userId)
            .eq('status', 'active'),
          new Promise<any>((_, reject) =>
            setTimeout(() => reject(new Error('Roles fetch timeout')), 3000)
          )
        ])
      ]);

      // Process results and cache data
      let profileData = null;
      let rolesData = [];
      let permissionsData: string[] = [];

      // Process profile result
      if (profileResult.status === 'fulfilled') {
        const { data: profile, error: profileError } = profileResult.value;
        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          if (profileError.code === 'PGRST116') {
            console.log('User profile not found, user may need profile creation');
          }
        } else {
          console.log('User profile fetched:', profile);
          profileData = profile;
          setUserProfile(profile);
        }
      } else {
        console.error('Profile fetch failed:', profileResult.reason);
      }

      // Process roles result
      if (rolesResult.status === 'fulfilled') {
        const { data: rolesResponse, error: rolesError } = rolesResult.value;
        if (rolesError) {
          console.error('Error fetching user roles:', rolesError);
          setUserRoles([]);
          setUserPermissions([]);
        } else {
          console.log('User roles fetched:', rolesResponse);

          // Process roles and permissions in one go
          const roles: UserRole[] = (rolesResponse || []).map((userRole: any) => {
            const rolePermissions = (userRole.roles.role_permissions || [])
              .map((rp: any) => rp.permissions?.name)
              .filter(Boolean);

            return {
              id: userRole.roles.id,
              name: userRole.roles.name,
              display_name: userRole.roles.display_name,
              description: userRole.roles.description,
              permissions: rolePermissions
            };
          });

          setUserRoles(roles);
          rolesData = roles;

          // Collect all unique permissions
          const allPermissions = roles.flatMap(role => role.permissions);
          const uniquePermissions = [...new Set(allPermissions)];
          setUserPermissions(uniquePermissions);
          permissionsData = uniquePermissions;

          console.log('User permissions set:', uniquePermissions);
        }
      } else {
        console.error('Roles fetch failed:', rolesResult.reason);
        setUserRoles([]);
        setUserPermissions([]);
      }

      // Cache the user data for faster subsequent loads
      try {
        authCache.save(profileData, rolesData, permissionsData);
      } catch (cacheError) {
        console.warn('Failed to cache user data:', cacheError);
      }

      // Update last login asynchronously (don't wait for it)
      supabase
        .from('user_profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId)
        .then(() => console.log('Last login updated'))
        .catch(error => console.error('Error updating last login:', error));

    } catch (error) {
      console.error('Error fetching user data:', error);
      // Clear cache on error to prevent future issues
      authCache.clear();
      // Set fallback values to allow app to function
      setUserProfile(null);
      setUserRoles([]);
      setUserPermissions([]);
    }
  };

  // Initialize auth state with cached data for instant loading
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    // Clear any potentially corrupted cache on startup
    try {
      const cachedData = authCache.load();
      if (cachedData) {
        console.log('Loading cached user data for instant startup:', cachedData);
        setUserProfile(cachedData.userProfile);
        setUserRoles(cachedData.userRoles || []);
        setUserPermissions(cachedData.userPermissions || []);
        setInitialLoadComplete(true);
      }
    } catch (cacheError) {
      console.warn('Error loading cached data, clearing cache:', cacheError);
      authCache.clear();
    }

    // Set a shorter timeout to prevent infinite loading
    timeoutId = setTimeout(() => {
      console.warn('Authentication initialization timeout - forcing loading to false');
      setLoading(false);
      setInitialLoadComplete(true);
    }, 3000); // Reduced to 3 seconds

    // Initialize session manager for automatic token refresh (silently, non-blocking)
    setTimeout(() => {
      sessionManager.initialize().catch(error => {
        console.warn('SessionManager initialization failed, continuing without advanced features:', error);
      });
    }, 2000); // Delay to ensure auth context is fully ready

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // If we have cached data, set loading to false immediately
        if (cachedData) {
          setLoading(false);
          setInitialLoadComplete(true);

          // Fetch fresh data in background (don't wait for it)
          fetchUserData(session.user.id).catch(error => {
            console.error('Background user data fetch failed:', error);
          });
        } else {
          // No cached data, fetch normally with timeout
          try {
            await Promise.race([
              fetchUserData(session.user.id),
              new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Fetch timeout')), 2000) // Reduced to 2 seconds
              )
            ]);
          } catch (error) {
            console.error('Error fetching user data on init:', error);
            // Set minimal data to allow app to function
            setUserProfile(null);
            setUserRoles([]);
            setUserPermissions([]);
          }
          setInitialLoadComplete(true);
        }
      } else {
        // No session, clear cached data
        authCache.clear();
        setUserProfile(null);
        setUserRoles([]);
        setUserPermissions([]);
        setInitialLoadComplete(true);
      }

      clearTimeout(timeoutId);
      setLoading(false);
    }).catch((error) => {
      console.error('Error getting session:', error);
      clearTimeout(timeoutId);
      setLoading(false);
      setInitialLoadComplete(true);
    });

    // Listen for auth changes with improved token refresh handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session ? 'Session exists' : 'No session');

        // Handle different auth events
        switch (event) {
          case 'SIGNED_IN':
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user && initialLoadComplete) {
              fetchUserData(session.user.id).catch(error => {
                console.error('Error fetching user data on sign in:', error);
              });
            }
            break;

          case 'SIGNED_OUT':
            // User signed out, clear everything
            authCache.clear();
            setSession(null);
            setUser(null);
            setUserProfile(null);
            setUserRoles([]);
            setUserPermissions([]);
            break;

          case 'TOKEN_REFRESHED':
            // Token refreshed successfully, update session but don't refetch user data
            setSession(session);
            setUser(session?.user ?? null);
            console.log('Token refreshed successfully');
            break;

          case 'USER_UPDATED':
            setSession(session);
            setUser(session?.user ?? null);
            break;

          default:
            setSession(session);
            setUser(session?.user ?? null);
        }

        if (initialLoadComplete) {
          setLoading(false);
        }
      }
    );

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
      sessionManager.cleanup();
    };
  }, [initialLoadComplete]);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  // Sign up function
  const signUp = async (email: string, password: string, userData: any) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });

    return { error };
  };

  // Sign out function
  const signOut = async () => {
    // Clear cached data on sign out
    authCache.clear();
    await supabase.auth.signOut();
  };

  // Check if user has specific permission
  const hasPermission = (permission: string): boolean => {
    return userPermissions.includes(permission);
  };

  // Check if user has specific role
  const hasRole = (roleName: string): boolean => {
    return userRoles.some(role => role.name === roleName);
  };

  // Refresh user data
  const refreshUserData = async () => {
    if (user) {
      await fetchUserData(user.id);
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    userRoles,
    userPermissions,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    hasPermission,
    hasRole,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
