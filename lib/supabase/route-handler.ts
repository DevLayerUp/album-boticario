import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, type NextResponse } from "next/server";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

/**
 * Cliente Supabase para Route Handlers que gravam cookies na resposta
 * (redirect, etc.). O `createClient()` de server.ts não persiste sessão em redirects.
 */
export function createRouteHandlerClient(
  request: NextRequest,
  response: NextResponse,
) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );
}
