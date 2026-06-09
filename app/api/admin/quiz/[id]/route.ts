import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await adminGuard();
  if (guard) return guard;

  const { id } = await params;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("quizzes")
    .select(`*, quiz_options(*)`)
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await adminGuard();
  if (guard) return guard;

  const { id } = await params;
  const body = await request.json();
  const { question, image_url, valid_date, points, is_active, options } = body;

  if (!question?.trim()) {
    return NextResponse.json({ error: "Pergunta é obrigatória" }, { status: 400 });
  }

  const opts: Array<{ text: string; is_correct: boolean }> = options ?? [];
  const correctCount = opts.filter((o) => o.is_correct).length;
  if (opts.length >= 2 && correctCount !== 1) {
    return NextResponse.json(
      { error: "Deve haver exatamente 1 alternativa correta" },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();

  const { data: quiz, error: qErr } = await supabase
    .from("quizzes")
    .update({
      question: question.trim(),
      image_url: image_url || null,
      valid_date: valid_date || null,
      points: points ?? 1,
      is_active: is_active ?? true,
    })
    .eq("id", id)
    .select()
    .single();

  if (qErr) return NextResponse.json({ error: qErr.message }, { status: 500 });

  if (opts.length >= 2) {
    // Replace all options
    await supabase.from("quiz_options").delete().eq("quiz_id", id);
    await supabase.from("quiz_options").insert(
      opts.map((o) => ({
        quiz_id: Number(id),
        text: o.text.trim(),
        is_correct: o.is_correct,
      })),
    );
  }

  return NextResponse.json(quiz);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await adminGuard();
  if (guard) return guard;

  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase.from("quizzes").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
