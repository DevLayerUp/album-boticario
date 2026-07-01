import { NextResponse, type NextRequest } from "next/server";
import { REDEFINIR_SENHA_PATH } from "@/lib/password-reset";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

function redirectToEsqueciSenha(
  origin: string,
  error: "link-invalido" | "link-expirado",
) {
  const url = new URL("/esqueci-senha", origin);
  url.searchParams.set("error", error);
  return NextResponse.redirect(url);
}

/**
 * Valida o token de recuperação e abre sessão antes de ir para /redefinir-senha.
 * Link do e-mail: https://seu-dominio/auth/recuperar-senha?token=...
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get("token")?.trim();

  if (!token) {
    return redirectToEsqueciSenha(origin, "link-invalido");
  }

  const redirectUrl = new URL(REDEFINIR_SENHA_PATH, origin);
  const response = NextResponse.redirect(redirectUrl);
  const supabase = createRouteHandlerClient(request, response);

  const { error } = await supabase.auth.verifyOtp({
    token_hash: token,
    type: "recovery",
  });

  if (error) {
    console.error("[auth/recuperar-senha] verifyOtp:", error.message);
    return redirectToEsqueciSenha(origin, "link-expirado");
  }

  return response;
}
