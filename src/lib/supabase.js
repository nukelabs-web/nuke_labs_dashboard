import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a mock client when env vars are not configured (for local dev without Supabase)
const createMockClient = () => {
  const handler = {
    get() {
      return () => ({
        data: null,
        error: { message: 'Supabase not configured' },
        select: () => ({ data: null, error: null, single: () => ({ data: null, error: null }), order: () => ({ data: null, error: null }), limit: () => ({ data: null, error: null }), eq: () => ({ data: null, error: null }), neq: () => ({ data: null, error: null }) }),
        insert: () => ({ data: null, error: null, select: () => ({ data: null, error: null, single: () => ({ data: null, error: null }) }) }),
        update: () => ({ data: null, error: null, eq: () => ({ data: null, error: null, select: () => ({ data: null, error: null, single: () => ({ data: null, error: null }) }) }) }),
        delete: () => ({ data: null, error: null, eq: () => ({ data: null, error: null }) }),
        order: () => ({ data: null, error: null }),
        eq: () => ({ data: null, error: null, single: () => ({ data: null, error: null }), select: () => ({ data: null, error: null, single: () => ({ data: null, error: null }) }) }),
        neq: () => ({ data: null, error: null, order: () => ({ data: null, error: null, limit: () => ({ data: null, error: null }) }) }),
        single: () => ({ data: null, error: null }),
        limit: () => ({ data: null, error: null }),
      });
    },
  };

  return {
    from: () => new Proxy({}, handler),
    auth: {
      getSession: () => Promise.resolve({ data: { session: { user: { email: 'demo@nukelabs.in' } } } }),
      onAuthStateChange: (cb) => {
        cb('SIGNED_IN', { user: { email: 'demo@nukelabs.in' } });
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      signInWithOAuth: () => Promise.resolve({}),
      signOut: () => Promise.resolve({}),
    },
  };
};

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient();

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);
