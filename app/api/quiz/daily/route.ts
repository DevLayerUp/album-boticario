import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/quiz/daily
 * Returns the quiz for today or a random one the user hasn't answered.
 * NEVER exposes is_correct to the client.
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  // 1. Check if user already answered today
  const { data: todayAnswer } = await supabase
    .from("user_quiz_answers")
    .select("id, is_correct, quiz_id")
    .eq("user_id", user.id)
    .gte("answered_at", `${today}T00:00:00`)
    .lte("answered_at", `${today}T23:59:59`)
    .maybeSingle();

  if (todayAnswer) {
    return NextResponse.json({
      already_answered: true,
      was_correct: todayAnswer.is_correct,
    });
  }

  // 2. Try quiz with matching valid_date
  const { data: dated } = await supabase
    .from("quizzes")
    .select("id, question, image_url, points, quiz_options(id, text)")
    .eq("valid_date", today)
    .eq("is_active", true)
    .maybeSingle();

  let quiz = dated;

  if (!quiz) {
    // 3. Random active quiz the user hasn't answered yet
    const { data: answered } = await supabase
      .from("user_quiz_answers")
      .select("quiz_id")
      .eq("user_id", user.id);

    const answeredIds = (answered ?? []).map((a) => a.quiz_id as number);

    let q = supabase
      .from("quizzes")
      .select("id, question, image_url, points, quiz_options(id, text)")
      .eq("is_active", true)
      .is("valid_date", null);

    if (answeredIds.length > 0) {
      q = q.not("id", "in", `(${answeredIds.join(",")})`);
    }

    const { data: random } = await q.limit(1).maybeSingle();
    quiz = random;
  }

  if (!quiz) {
    return NextResponse.json({ no_quiz_available: true });
  }

  // 4. Shuffle options — never expose is_correct
  const options = Array.isArray(quiz.quiz_options)
    ? [...(quiz.quiz_options as { id: number; text: string }[])].sort(
        () => Math.random() - 0.5
      )
    : [];

  return NextResponse.json({
    quiz: {
      id:        quiz.id,
      question:  quiz.question,
      image_url: quiz.image_url,
      points:    quiz.points,
      options,  // just id + text, no is_correct
    },
  });
}
