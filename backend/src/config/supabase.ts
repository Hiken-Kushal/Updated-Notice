import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    '⚠️ [Supabase Storage] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured in backend/.env. Supabase Storage operations will fail until valid credentials are provided.'
  );
}

// Server-side administrative Supabase client using Service Role Key.
// IMPORTANT: This file is strictly for backend execution.
// The service role key is NEVER sent or exposed to frontends.
export const supabase: SupabaseClient = createClient(
  env.NODE_ENV === 'production'
    ? env.SUPABASE_URL
    : env.SUPABASE_URL || 'https://placeholder.supabase.co',
  env.NODE_ENV === 'production'
    ? env.SUPABASE_SERVICE_ROLE_KEY
    : env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
