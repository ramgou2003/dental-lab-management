import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a mock client if credentials are not configured
const createMockClient = () => ({
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ data: null, error: null }),
    eq: function() { return this; },
    order: function() { return this; },
    single: function() { return this; }
  })
});

export const supabase = (!supabaseUrl || !supabaseAnonKey ||
  supabaseUrl === 'your_supabase_url_here' ||
  supabaseAnonKey === 'your_supabase_anon_key_here')
  ? createMockClient()
  : createClient(supabaseUrl, supabaseAnonKey);