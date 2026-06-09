import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

const PUBLIC_ROUTES = ["/login", "/register", "/auth"];
const ADMIN_PREFIX = "/admin";

/**
 * Remove cookies de sessão do Supabase em chunks que ficaram
 * acumulados no browser (causa do HTTP 431).
 * Mantém apenas o cookie canônico "sb-<ref>-auth-token" (sem sufixo).
 */
function purgeStaleAuthChunks(
  request: NextRequest,
  response: NextResponse,
): void {
  const cookiePrefix = "sb-";
  const chunkPattern = /^sb-.+-auth-token\.\d+$/;

  request.cookies.getAll().forEach(({ name }) => {
    if (chunkPattern.test(name)) {
      response.cookies.set(name, "", { maxAge: 0, path: "/" });
    }
  });

  // Garante que o cookie canônico não seja apagado caso exista
  const canonical = request.cookies
    .getAll()
    .find(
      ({ name }) =>
        name.startsWith(cookiePrefix) &&
        name.endsWith("-auth-token") &&
        !chunkPattern.test(name),
    );
  if (canonical) {
    // não toca no canônico — deixa o Supabase gerenciá-lo
    void canonical;
  }
}

/** Atualiza a sessão e aplica proteção de rotas (usuário e admin). */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
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
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // Não autenticado tentando acessar rota protegida → login
  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Proteção de área admin (role em user_metadata)
  if (user && pathname.startsWith(ADMIN_PREFIX)) {
    const role = (user.app_metadata?.role ?? user.user_metadata?.role) as
      | string
      | undefined;
    if (role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // Autenticado em rota de auth → dashboard
  if (user && (pathname === "/login" || pathname === "/register")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  purgeStaleAuthChunks(request, supabaseResponse);
  return supabaseResponse;
}
