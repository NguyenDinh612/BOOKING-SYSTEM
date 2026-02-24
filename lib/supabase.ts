import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qasnybyqwzqosrptpqvy.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_8SO1V9C3bUwB7EQEYANk5A_dv0L1Z3h';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
