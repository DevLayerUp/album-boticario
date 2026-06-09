import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client com service-role key.
 * Bypass total de RLS — usar somente em server-side admin routes.
 * NUNCA expor ao cliente.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
