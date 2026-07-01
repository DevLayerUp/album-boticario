import { NextResponse, type NextRequest } from "next/server";
import { sendAuthEmail } from "@/lib/email/resend";
import { getSiteUrl } from "@/lib/seo-metadata";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

interface AccountCreatedBody {
  email?: string;
  name?: string;
}

/** Envia e-mail de boas-vindas (conta criada) via Resend após cadastro. */
export async function POST(request: NextRequest) {
  let body: AccountCreatedBody;
  try {
    body = (await request.json()) as AccountCreatedBody;
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

  const rl = checkRateLimit(`auth:account-created:${ip}:${email}`, 3, 15 * 60 * 1_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde alguns minutos." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1_000)) } },
    );
  }

  try {
    await sendAuthEmail({
      to: email,
      templateId: "account-created",
      variables: {
        siteUrl: getSiteUrl(),
        displayName: body.name?.trim(),
      },
    });
  } catch (err) {
    console.error("[auth/account-created] envio falhou:", err);
    return NextResponse.json(
      { error: "Não foi possível enviar o e-mail de boas-vindas." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
