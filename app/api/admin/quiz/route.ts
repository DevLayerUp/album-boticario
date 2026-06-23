import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureQuizCoverage, resolveQuizValidDate } from "@/lib/quiz-schedule";

export async function GET() {
  const guard = await adminGuard();
  if (guard) return guard;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("quizzes")
    .select(`*, quiz_options(*)`)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const guard = await adminGuard();
  if (guard) return guard;

  const body = await request.json();
  const { question, image_url, valid_date, points, is_active, options } = body;

  if (!question?.trim()) {
    return NextResponse.json({ error: "Pergunta é obrigatória" }, { status: 400 });
  }

  const opts: Array<{ text: string; is_correct: boolean }> = options ?? [];
  if (opts.length < 2) {
    return NextResponse.json({ error: "Mínimo 2 alternativas" }, { status: 400 });
  }
  const correctCount = opts.filter((o) => o.is_correct).length;
  if (correctCount !== 1) {
    return NextResponse.json(
      { error: "Deve haver exatamente 1 alternativa correta" },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();

  let resolvedDate: string | null;
  try {
    resolvedDate = await resolveQuizValidDate(supabase, valid_date);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao agendar data";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const { data: quiz, error: qErr } = await supabase
    .from("quizzes")
    .insert({
      question: question.trim(),
      image_url: image_url || null,
      valid_date: resolvedDate,
      points: points ?? 1,
      is_active: is_active ?? true,
    })
    .select()
    .single();

  if (qErr) return NextResponse.json({ error: qErr.message }, { status: 500 });

  const { error: optsErr } = await supabase.from("quiz_options").insert(
    opts.map((o) => ({
      quiz_id: quiz.id,
      text: o.text.trim(),
      is_correct: o.is_correct,
    })),
  );

  if (optsErr) return NextResponse.json({ error: optsErr.message }, { status: 500 });

  try {
    await ensureQuizCoverage(supabase, 60);
  } catch {
    // Quiz was created; scheduling extension is best-effort.
  }

  return NextResponse.json(quiz, { status: 201 });
}
