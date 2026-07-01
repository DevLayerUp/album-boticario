import { NextResponse, type NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import {
  isUserFeedbackType,
  normalizeFeedbackMessage,
  USER_FEEDBACK_MAX_LENGTH,
  USER_FEEDBACK_MIN_LENGTH,
} from "@/lib/user-feedback";

export const runtime = "nodejs";

interface FeedbackBody {
  type?: string;
  message?: string;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  let body: FeedbackBody;
  try {
    body = (await request.json()) as FeedbackBody;
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const type = body.type?.trim();
  const message = normalizeFeedbackMessage(body.message ?? "");

  if (!type || !isUserFeedbackType(type)) {
    return NextResponse.json({ error: "Selecione um tipo de feedback." }, { status: 400 });
  }

  if (message.length < USER_FEEDBACK_MIN_LENGTH) {
    return NextResponse.json(
      { error: `Descreva com pelo menos ${USER_FEEDBACK_MIN_LENGTH} caracteres.` },
      { status: 400 },
    );
  }

  if (message.length > USER_FEEDBACK_MAX_LENGTH) {
    return NextResponse.json(
      { error: `Máximo de ${USER_FEEDBACK_MAX_LENGTH} caracteres.` },
      { status: 400 },
    );
  }

  const rl = checkRateLimit(`feedback:${user.id}`, 5, 15 * 60 * 1_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Muitos envios em pouco tempo. Aguarde alguns minutos." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1_000)) },
      },
    );
  }

  const { error } = await supabase
    .from("user_feedback")
    .insert({ user_id: user.id, type, message });

  if (error) {
    console.error("[feedback] insert:", error.message, error.code);
    return NextResponse.json({ error: "Não foi possível enviar o feedback." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
