import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getAuthUser } from "@/lib/supabase/auth-session";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

/** Cliente Supabase para Server Components, Server Actions e Route Handlers. */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Chamado a partir de um Server Component — pode ser ignorado
            // quando há middleware atualizando a sessão.
          }
        },
      },
    },
  );
}

/** Obtém o usuário autenticado e limpa cookies de sessão inválidos. */
export async function getUser() {
  const supabase = await createClient();
  return getAuthUser(supabase);
}
