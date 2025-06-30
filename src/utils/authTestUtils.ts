import { supabase } from '@/integrations/supabase/client';

// Utility functions for testing authentication states
export const authTestUtils = {
  // Simulate session expiry
  simulateSessionExpiry: async () => {
    console.log('🧪 Simulating session expiry...');
    await supabase.auth.signOut();
  },

  // Simulate network disconnection
  simulateNetworkIssue: () => {
    console.log('🧪 Simulating network issue...');
    // This would typically involve mocking network requests
    // For demo purposes, we'll just log it
  },

  // Force authentication refresh
  forceAuthRefresh: async () => {
    console.log('🧪 Forcing authentication refresh...');
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error('Auth refresh failed:', error);
    } else {
      console.log('Auth refresh successful:', data);
    }
  },

  // Clear all auth data
  clearAuthData: () => {
    console.log('🧪 Clearing all auth data...');
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  },

  // Test different loading states
  testLoadingStates: {
    showVerifying: () => {
      console.log('🧪 Testing verifying state...');
      // This would trigger the verifying animation
    },
    
    showReconnecting: () => {
      console.log('🧪 Testing reconnecting state...');
      // This would trigger the reconnecting animation
    },
    
    showSessionExpired: () => {
      console.log('🧪 Testing session expired state...');
      // This would trigger the session expired animation
    }
  }
};

// Make test utils available globally in development
if (import.meta.env.DEV) {
  (window as any).authTestUtils = authTestUtils;
  console.log('🧪 Auth test utilities available at window.authTestUtils');
}
