import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

const PUBLIC_ROUTES = ["/login", "/register", "/auth"];
const ADMIN_PREFIX = "/admin";

/** Rotas que nunca precisam de autenticação (recursos do sistema/browser) */
const ALWAYS_PUBLIC = [
  "/manifest.webmanifest",
  "/robots.txt",
  "/sitemap.xml",
  "/favicon.svg",
  "/favicon.ico",
  "/.well-known/",
  "/opengraph-image",
];

/**
 * Remove chunks ANTIGOS do cookie de sessão Supabase (causa do HTTP 431).
 * SÓ apaga chunks (.0, .1, ...) quando existe um cookie canônico sem sufixo,
 * indicando que o Supabase já migrou para o formato único.
 * Se a sessão está armazenada APENAS em chunks, NÃO os apaga.
 */
function purgeStaleAuthChunks(
  request: NextRequest,
  response: NextResponse,
): void {
  const chunkPattern = /^sb-.+-auth-token\.\d+$/;
  const canonicalPattern = /^sb-.+-auth-token$/;

  const allCookies = request.cookies.getAll();

  // Se não há cookie canônico (sem sufixo), os chunks SÃO a sessão ativa — não apagar
  const hasCanonical = allCookies.some(({ name }) => canonicalPattern.test(name));
  if (!hasCanonical) return;

  // Só chegamos aqui se existe um canônico → os chunks são resíduos antigos
  allCookies.forEach(({ name }) => {
    if (chunkPattern.test(name)) {
      response.cookies.set(name, "", { maxAge: 0, path: "/" });
    }
  });
}

/** Atualiza a sessão e aplica proteção de rotas (usuário e admin). */
export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Sempre deixa passar: recursos do browser/sistema (sem chamar getUser)
  const isAlwaysPublic = ALWAYS_PUBLIC.some(
    (p) => pathname === p || pathname.startsWith(p),
  );
  if (isAlwaysPublic) {
    return NextResponse.next({ request });
  }

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
    error: authError,
  } = await supabase.auth.getUser();

  console.log(`[MIDDLEWARE] ${pathname} — user: ${user?.id ?? "null"} ${authError ? "ERR:" + authError.message : ""}`);

  const isPublic = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // Não autenticado tentando acessar rota protegida → login
  if (!user && !isPublic) {
    console.log(`[MIDDLEWARE] sem sessão em rota protegida → redirect /login?redirect=${pathname}`);
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
    console.log(`[MIDDLEWARE] usuário autenticado em /login → redirect /dashboard`);
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  purgeStaleAuthChunks(request, supabaseResponse);
  return supabaseResponse;
}
