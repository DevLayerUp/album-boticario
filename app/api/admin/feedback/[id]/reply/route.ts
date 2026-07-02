import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";
import { isResendConfigured, sendFeedbackReplyEmail } from "@/lib/email/resend";
import { sanitizeId } from "@/lib/sanitize";
import {
  USER_FEEDBACK_REPLY_MAX_LENGTH,
  USER_FEEDBACK_REPLY_MIN_LENGTH,
  USER_FEEDBACK_TYPE_LABELS,
  type UserFeedbackType,
} from "@/lib/user-feedback";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

/** POST /api/admin/feedback/[id]/reply — envia resposta por e-mail ao usuário. */
export async function POST(request: NextRequest, { params }: Params) {
  const guard = await adminGuard();
  if (guard) return guard;

  if (!isResendConfigured()) {
    return NextResponse.json(
      { error: "Envio de e-mail não configurado (Resend)." },
      { status: 503 },
    );
  }

  const id = sanitizeId((await params).id);
  if (!id) return NextResponse.json({ error: "ID inválido." }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const reply =
    typeof body.reply === "string" ? body.reply.trim().replace(/\s+/g, " ") : "";

  if (reply.length < USER_FEEDBACK_REPLY_MIN_LENGTH) {
    return NextResponse.json(
      { error: `A resposta deve ter pelo menos ${USER_FEEDBACK_REPLY_MIN_LENGTH} caracteres.` },
      { status: 400 },
    );
  }
  if (reply.length > USER_FEEDBACK_REPLY_MAX_LENGTH) {
    return NextResponse.json(
      { error: `A resposta deve ter no máximo ${USER_FEEDBACK_REPLY_MAX_LENGTH} caracteres.` },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();

  const { data: feedback, error: fetchErr } = await supabase
    .from("user_feedback")
    .select("id, user_id, type, message")
    .eq("id", id)
    .single();

  if (fetchErr || !feedback) {
    return NextResponse.json({ error: "Feedback não encontrado." }, { status: 404 });
  }

  const { data: authUser, error: authErr } = await supabase.auth.admin.getUserById(
    feedback.user_id,
  );
  if (authErr || !authUser?.user?.email) {
    return NextResponse.json(
      { error: "Usuário sem e-mail cadastrado." },
      { status: 400 },
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", feedback.user_id)
    .maybeSingle();

  const feedbackType =
    USER_FEEDBACK_TYPE_LABELS[feedback.type as UserFeedbackType] ?? feedback.type;

  try {
    await sendFeedbackReplyEmail({
      to: authUser.user.email,
      variables: {
        displayName: profile?.display_name ?? undefined,
        feedbackType,
        replyMessage: reply,
        originalMessage: feedback.message,
      },
    });
  } catch (err) {
    console.error("[admin/feedback/reply] email:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Falha ao enviar e-mail." },
      { status: 502 },
    );
  }

  const repliedAt = new Date().toISOString();
  const { data: updated, error: updateErr } = await supabase
    .from("user_feedback")
    .update({
      admin_reply: reply,
      admin_reply_at: repliedAt,
      status: "resolved",
    })
    .eq("id", id)
    .select("id, status, admin_reply, admin_reply_at")
    .single();

  if (updateErr) {
    console.error("[admin/feedback/reply] update:", updateErr.message);
    return NextResponse.json(
      { error: "E-mail enviado, mas não foi possível salvar a resposta." },
      { status: 500 },
    );
  }

  return NextResponse.json(updated);
}
