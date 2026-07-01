import { NextResponse, type NextRequest } from "next/server";
import { REDEFINIR_SENHA_PATH } from "@/lib/password-reset";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

const SAFE_REDIRECT_PREFIXES = [
  "/dashboard",
  "/album",
  "/colecao",
  "/pacotinhos",
  "/quiz",
  "/missoes",
  "/trocas",
  "/ranking",
  "/perfil",
  "/figurinha",
  "/admin",
  "/redefinir-senha",
  "/login",
];

function resolveRedirectPath(
  next: string | null,
  redirect: string | null,
): string {
  const raw = next ?? redirect ?? "/dashboard";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return SAFE_REDIRECT_PREFIXES.some((p) => raw === p || raw.startsWith(`${p}/`))
    ? raw
    : "/dashboard";
}

/** Troca o code do OAuth/confirmação/recuperação por sessão e redireciona. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = resolveRedirectPath(
    searchParams.get("next"),
    searchParams.get("redirect"),
  );

  if (code) {
    const successUrl = `${origin}${redirectTo}`;
    const response = NextResponse.redirect(successUrl);
    const supabase = createRouteHandlerClient(request, response);
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return response;
    }
  }

  const authError =
    searchParams.get("error_description") ?? searchParams.get("error");
  if (redirectTo === REDEFINIR_SENHA_PATH || redirectTo.startsWith(`${REDEFINIR_SENHA_PATH}/`)) {
    const url = new URL("/esqueci-senha", origin);
    url.searchParams.set("error", "link-expirado");
    return NextResponse.redirect(url);
  }
  const loginUrl = new URL("/login", origin);
  loginUrl.searchParams.set("error", "auth");
  if (authError) {
    loginUrl.searchParams.set("message", authError);
  }
  return NextResponse.redirect(loginUrl);
}
