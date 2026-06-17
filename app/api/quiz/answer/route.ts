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
  const quizId = Number((body as { quiz_id?: unknown }).quiz_id);
  const optionId = Number((body as { option_id?: unknown }).option_id);

  if (!Number.isFinite(quizId) || !Number.isFinite(optionId)) {
    return NextResponse.json(
      { error: "quiz_id e option_id são obrigatórios" },
      { status: 400 },
    );
  }

  // 1. Prevent re-answering
  const { data: existing } = await supabase
    .from("user_quiz_answers")
    .select("id")
    .eq("user_id", user.id)
    .eq("quiz_id", quizId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "Quiz já respondido", code: "already_answered" },
      { status: 400 },
    );
  }

  // 2. Validate option and get correct status
  const { data: option, error: optionError } = await supabase
    .from("quiz_options")
    .select("id, is_correct, quiz_id, quizzes(points)")
    .eq("id", optionId)
    .maybeSingle();

  if (optionError || !option || Number(option.quiz_id) !== quizId) {
    return NextResponse.json(
      { error: "Opção inválida", code: "invalid_option" },
      { status: 400 },
    );
  }

  const isCorrect = option.is_correct as boolean;

  // 3. Find the correct option id (to show user if wrong)
  const { data: correctOpt } = await supabase
    .from("quiz_options")
    .select("id")
    .eq("quiz_id", quizId)
    .eq("is_correct", true)
    .maybeSingle();

  // 4. Save answer
  const { error: insertError } = await supabase.from("user_quiz_answers").insert({
    user_id:     user.id,
    quiz_id:     quizId,
    option_id:   optionId,
    is_correct:  isCorrect,
    answered_at: new Date().toISOString(),
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json(
        { error: "Quiz já respondido", code: "already_answered" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Não foi possível salvar a resposta" },
      { status: 500 },
    );
  }

  let packsEarned = 0;

  if (isCorrect) {
    const quizData = Array.isArray(option.quizzes) ? option.quizzes[0] : option.quizzes;
    const points = (quizData as { points?: number } | null)?.points ?? 1;
    packsEarned = points;

    // 5. Create packs as reward
    await createPacksForUser(supabase, user.id, "quiz", String(quizId), points);

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
