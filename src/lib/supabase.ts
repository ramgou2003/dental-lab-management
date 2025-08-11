import { createClient } from '@supabase/supabase-js';

// Environment-aware Supabase configuration
function getSupabaseConfig() {
  // Check for environment-specific URLs first
  const testUrl = import.meta.env.VITE_SUPABASE_URL_TEST
  const testKey = import.meta.env.VITE_SUPABASE_ANON_KEY_TEST
  const prodUrl = import.meta.env.VITE_SUPABASE_URL_PROD
  const prodKey = import.meta.env.VITE_SUPABASE_ANON_KEY_PROD

  // Fallback to generic environment variables
  const fallbackUrl = import.meta.env.VITE_SUPABASE_URL
  const fallbackKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  // Determine which database to use based on environment
  const isProduction = import.meta.env.PROD
  const isTesting = import.meta.env.MODE === 'testing' ||
                   (typeof window !== 'undefined' && (
                     window.location.hostname.includes('staging') ||
                     window.location.hostname.includes('test')
                   ))

  let supabaseUrl: string | undefined
  let supabaseAnonKey: string | undefined
  let environment: string

  if (isTesting && testUrl && testKey) {
    supabaseUrl = testUrl
    supabaseAnonKey = testKey
    environment = 'testing'
    console.log('🧪 Using testing database')
  } else if (isProduction && prodUrl && prodKey) {
    supabaseUrl = prodUrl
    supabaseAnonKey = prodKey
    environment = 'production'
    console.log('🚀 Using production database')
  } else if (fallbackUrl && fallbackKey) {
    supabaseUrl = fallbackUrl
    supabaseAnonKey = fallbackKey
    environment = 'development'
    console.log('🔧 Using development database configuration')
  } else {
    environment = 'mock'
    console.log('⚠️ No valid Supabase configuration found, using mock client')
  }

  return { supabaseUrl, supabaseAnonKey, environment }
}

const { supabaseUrl, supabaseAnonKey, environment } = getSupabaseConfig()

// Create a mock client if credentials are not configured
const createMockClient = () => {
  const mockQueryBuilder = {
    select: function() { return this; },
    insert: function() { return this; },
    update: function() { return this; },
    delete: function() { return this; },
    eq: function() { return this; },
    order: function() { return this; },
    single: function() { return Promise.resolve({ data: null, error: null }); },
    then: function(resolve: any) {
      return resolve({ data: null, error: null });
    }
  };

  return {
    from: () => mockQueryBuilder,
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: 'mock-url' } })
      })
    },
    channel: () => ({
      on: function() { return this; },
      subscribe: () => ({ unsubscribe: () => {} })
    })
  };
};

export const supabase = (!supabaseUrl || !supabaseAnonKey ||
  supabaseUrl === 'your_supabase_url_here' ||
  supabaseAnonKey === 'your_supabase_anon_key_here')
  ? createMockClient()
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });

// Export environment info for debugging
export const supabaseEnvironment = {
  environment,
  url: supabaseUrl,
  isProduction: environment === 'production',
  isTesting: environment === 'testing',
  isDevelopment: environment === 'development',
  isMock: environment === 'mock'
}

// Helper function to check database connection
export async function testDatabaseConnection() {
  if (environment === 'mock') {
    console.log('⚠️ Using mock client, skipping database connection test')
    return true
  }

  try {
    const { data, error } = await supabase.from('patients').select('count').limit(1)
    if (error) {
      console.error('Database connection test failed:', error)
      return false
    }
    console.log(`✅ Database connection successful (${environment})`)
    return true
  } catch (error) {
    console.error('Database connection test error:', error)
    return false
  }
}