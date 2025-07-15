import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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
  : createClient(supabaseUrl, supabaseAnonKey);