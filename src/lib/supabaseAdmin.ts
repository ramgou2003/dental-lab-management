import { createClient } from '@supabase/supabase-js';

// Admin client with service role key for admin operations
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Create admin client only if service role key is available
export const supabaseAdmin = (supabaseUrl && supabaseServiceRoleKey && 
  supabaseServiceRoleKey !== 'your_service_role_key_here')
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Helper function to check if admin client is available
export const isAdminClientAvailable = (): boolean => {
  return supabaseAdmin !== null;
};

// Log admin client status
if (supabaseAdmin) {
  console.log('✅ Supabase Admin client initialized with service role key');
} else {
  console.warn('⚠️ Supabase Admin client not available - service role key missing');
}
