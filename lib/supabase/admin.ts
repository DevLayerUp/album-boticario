import { createClient, type SupabaseClientOptions } from "@supabase/supabase-js";
import ws from "ws";

function adminClientOptions(): SupabaseClientOptions<"public"> {
  const auth = { autoRefreshToken: false, persistSession: false };

  if (typeof window !== "undefined") {
    return { auth };
  }

  return {
    auth,
    realtime: { transport: ws as never },
  };
}

/**
 * Supabase client com service-role key.
 * Bypass total de RLS — usar somente em server-side admin routes.
 * NUNCA expor ao cliente.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    adminClientOptions(),
  );
}
