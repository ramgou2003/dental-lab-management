interface CachedUserData {
  userProfile: any;
  userRoles: any[];
  userPermissions: string[];
  timestamp: number;
}

const CACHE_KEY = 'auth_user_data';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const authCache = {
  // Save user data to localStorage
  save: (userProfile: any, userRoles: any[], userPermissions: string[]) => {
    try {
      // Validate inputs before caching
      if (!Array.isArray(userRoles)) {
        console.warn('Invalid userRoles provided to cache, using empty array');
        userRoles = [];
      }
      if (!Array.isArray(userPermissions)) {
        console.warn('Invalid userPermissions provided to cache, using empty array');
        userPermissions = [];
      }

      const cacheData: CachedUserData = {
        userProfile: userProfile || null,
        userRoles,
        userPermissions,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      console.log('User data cached successfully');
    } catch (error) {
      console.warn('Failed to cache user data:', error);
    }
  },

  // Load user data from localStorage
  load: (): CachedUserData | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) {
        console.log('No cached user data found');
        return null;
      }

      const data: CachedUserData = JSON.parse(cached);

      // Check if cache is still valid
      if (Date.now() - data.timestamp > CACHE_DURATION) {
        console.log('Cached user data expired, clearing cache');
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      // Validate cached data structure
      if (!data.userProfile || !Array.isArray(data.userRoles) || !Array.isArray(data.userPermissions)) {
        console.warn('Invalid cached data structure, clearing cache');
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      console.log('Loaded cached user data:', {
        hasProfile: !!data.userProfile,
        rolesCount: data.userRoles.length,
        permissionsCount: data.userPermissions.length,
        age: Math.round((Date.now() - data.timestamp) / 1000 / 60) + ' minutes'
      });
      return data;
    } catch (error) {
      console.warn('Failed to load cached user data:', error);
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  },

  // Clear cached data
  clear: () => {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.warn('Failed to clear cached user data:', error);
    }
  },

  // Check if cache exists and is valid
  isValid: (): boolean => {
    const cached = authCache.load();
    return cached !== null;
  }
};

// Make cache available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).clearAuthCache = () => {
    authCache.clear();
    console.log('Auth cache cleared. Please refresh the page.');
  };
}
