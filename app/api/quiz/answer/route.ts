import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPacksForUser } from "@/lib/pack";
import { incrementMissionProgress } from "@/lib/missions";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * POST /api/quiz/answer
 * Body: { quiz_id, option_id }
 * Returns: { is_correct, correct_option_id, packs_earned }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit: 30 respostas por hora (evita abuso em loop)
  const rl = checkRateLimit(`quiz:${user.id}`, 30, 60 * 60 * 1_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Muitas tentativas." }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const { quiz_id, option_id } = body as { quiz_id?: number; option_id?: number };
  if (!quiz_id || !option_id) {
    return NextResponse.json({ error: "quiz_id e option_id são obrigatórios" }, { status: 400 });
  }

  // 1. Prevent re-answering
  const { data: existing } = await supabase
    .from("user_quiz_answers")
    .select("id")
    .eq("user_id", user.id)
    .eq("quiz_id", quiz_id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Quiz já respondido" }, { status: 400 });
  }

  // 2. Validate option and get correct status
  const { data: option } = await supabase
    .from("quiz_options")
    .select("id, is_correct, quiz_id, quizzes(id, points)")
    .eq("id", option_id)
    .single();

  if (!option || option.quiz_id !== quiz_id) {
    return NextResponse.json({ error: "Opção inválida" }, { status: 400 });
  }

  const isCorrect = option.is_correct as boolean;

  // 3. Find the correct option id (to show user if wrong)
  const { data: correctOpt } = await supabase
    .from("quiz_options")
    .select("id")
    .eq("quiz_id", quiz_id)
    .eq("is_correct", true)
    .maybeSingle();

  // 4. Save answer
  await supabase.from("user_quiz_answers").insert({
    user_id:     user.id,
    quiz_id,
    option_id,
    is_correct:  isCorrect,
    answered_at: new Date().toISOString(),
  });

  let packsEarned = 0;

  if (isCorrect) {
    const quizData = Array.isArray(option.quizzes) ? option.quizzes[0] : option.quizzes;
    const points = (quizData as { points?: number } | null)?.points ?? 1;
    packsEarned = points;

    // 5. Create packs as reward
    await createPacksForUser(supabase, user.id, "quiz", String(quiz_id), points);

    // 6. Increment quiz streak mission
    await incrementMissionProgress(supabase, user.id, "quiz_streak");
  }

  const today = new Date().toISOString().split("T")[0];
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("dedupe_key", `quiz:${today}`)
    .is("read_at", null);

  return NextResponse.json({
    is_correct:        isCorrect,
    correct_option_id: correctOpt?.id ?? null,
    packs_earned:      packsEarned,
  });
}
