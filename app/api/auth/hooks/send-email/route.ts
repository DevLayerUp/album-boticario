import { NextResponse } from "next/server";
import { sendAuthEmail } from "@/lib/email/resend";
import {
  buildSupabaseAuthVerifyUrl,
  mapSupabaseEmailActionType,
} from "@/lib/email/templates";
import {
  verifySendEmailHook,
  type SendEmailHookPayload,
} from "@/lib/email/send-email-hook";

export const runtime = "nodejs";

/**
 * Hook do Supabase Auth (Send Email).
 * Configure em Authentication → Hooks → Send Email apontando para esta rota.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();

  let payload: SendEmailHookPayload;
  try {
    payload = verifySendEmailHook(rawBody, request.headers);
  } catch (err) {
    console.error("[auth/send-email-hook] verificação falhou:", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const to = payload.user.email?.trim();
  if (!to) {
    return NextResponse.json({ error: "E-mail do usuário ausente." }, { status: 400 });
  }

  const { email_data: emailData } = payload;
  const confirmationUrl = buildSupabaseAuthVerifyUrl({
    tokenHash: emailData.token_hash,
    emailActionType: emailData.email_action_type,
    redirectTo: emailData.redirect_to,
  });

  const templateId = mapSupabaseEmailActionType(emailData.email_action_type);

  try {
    await sendAuthEmail({
      to,
      templateId,
      confirmationUrl,
      siteUrl: emailData.site_url,
    });
  } catch (err) {
    console.error("[auth/send-email-hook] envio Resend falhou:", err);
    return NextResponse.json(
      { error: "Não foi possível enviar o e-mail." },
      { status: 500 },
    );
  }

  return NextResponse.json({});
}
