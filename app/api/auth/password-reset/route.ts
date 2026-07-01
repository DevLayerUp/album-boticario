import { NextResponse, type NextRequest } from "next/server";
import { sendAuthEmail } from "@/lib/email/resend";
import { buildPasswordResetRedirectUrl } from "@/lib/password-reset";
import { getSiteUrl } from "@/lib/seo-metadata";
import { checkRateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

interface PasswordResetBody {
  email?: string;
}

/** Envia e-mail de recuperação de senha via Resend (template reset-password.html). */
export async function POST(request: NextRequest) {
  let body: PasswordResetBody;
  try {
    body = (await request.json()) as PasswordResetBody;
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Informe o e-mail." }, { status: 400 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const rl = checkRateLimit(`auth:password-reset:${ip}:${email}`, 3, 15 * 60 * 1_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde alguns minutos." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1_000)) } },
    );
  }

  const siteUrl = getSiteUrl();
  const redirectTo = buildPasswordResetRedirectUrl(siteUrl);

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo },
    });

    if (error) {
      console.error("[auth/password-reset] generateLink:", error.message);
    }

    const actionLink = data?.properties?.action_link;
    if (actionLink) {
      await sendAuthEmail({
        to: email,
        templateId: "reset-password",
        variables: {
          confirmationUrl: actionLink,
          siteUrl,
        },
      });
    }
  } catch (err) {
    console.error("[auth/password-reset] envio falhou:", err);
    // Resposta genérica — não revela se o e-mail existe
  }

  return NextResponse.json({
    ok: true,
    message:
      "Se existir uma conta com este e-mail, você receberá o link para redefinir sua senha.",
  });
}
