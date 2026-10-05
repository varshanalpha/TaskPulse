import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eokyzoktstqwbkzpqndd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_GdDJtNZUNphnQDb-Q9Q9qA_9uPmaGPm';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const SUPABASE_PROJECT_URL = supabaseUrl;
export const SUPABASE_SQL_URL = 'https://supabase.com/dashboard/project/eokyzoktstqwbkzpqndd/sql/new';
