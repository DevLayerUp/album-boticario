import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { QuizForm } from "@/components/admin/quiz-form";

export const metadata: Metadata = { title: "Editar Pergunta" };

export default async function EditarQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("quizzes")
    .select(`*, quiz_options(*)`)
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  const opts = (data.quiz_options as Array<{ text: string; is_correct: boolean }>) ?? [];

  return (
    <QuizForm
      quizId={data.id}
      initial={{
        question: data.question,
        image_url: data.image_url ?? "",
        valid_date: data.valid_date ?? "",
        points: data.points,
        is_active: data.is_active,
        options: opts.map((o) => ({ text: o.text, is_correct: o.is_correct })),
      }}
    />
  );
}
