import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  findAvailableDailyQuiz,
  getTodayQuizAnswer,
  shuffleQuizOptions,
} from "@/lib/quiz-daily";

/**
 * GET /api/quiz/daily
 * Returns the quiz for today or a fallback the user hasn't answered.
 * NEVER exposes is_correct to the client.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const todayAnswer = await getTodayQuizAnswer(supabase, user.id);

  if (todayAnswer) {
    return NextResponse.json({
      already_answered: true,
      was_correct: todayAnswer.is_correct,
    });
  }

  const quiz = await findAvailableDailyQuiz(supabase, user.id);

  if (!quiz) {
    return NextResponse.json({ no_quiz_available: true });
  }

  return NextResponse.json({
    quiz: {
      id: quiz.id,
      question: quiz.question,
      image_url: quiz.image_url,
      points: quiz.points,
      options: shuffleQuizOptions(quiz.quiz_options),
    },
  });
}
