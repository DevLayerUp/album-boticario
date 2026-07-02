import { createClient, type SupabaseClientOptions } from "@supabase/supabase-js";

function adminClientOptions(): SupabaseClientOptions<"public"> {
  const auth = { autoRefreshToken: false, persistSession: false };

  if (typeof window !== "undefined") {
    return { auth };
  }

  try {
    // Node < 22 (scripts CLI, testes locais)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ws = require("ws") as typeof import("ws");
    return { auth, realtime: { transport: ws } };
  } catch {
    return { auth };
  }
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
