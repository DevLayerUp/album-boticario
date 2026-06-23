import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Plus, Pencil } from "lucide-react";

export const metadata: Metadata = { title: "Quiz" };
export const dynamic = "force-dynamic";

export default async function QuizPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("quizzes")
    .select(`*, quiz_options(*)`)
    .order("valid_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  const quizzes = data ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Quiz</h1>
          <p className="text-sm text-gray-500">{quizzes.length} pergunta(s)</p>
        </div>
        <Link
          href="/admin/quiz/novo"
          className="flex items-center gap-2 rounded-lg bg-gb-green px-4 py-2 text-sm font-medium text-white hover:bg-gb-green-dark"
        >
          <Plus size={15} /> Nova pergunta
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {quizzes.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-500">
            Nenhuma pergunta criada.{" "}
            <Link href="/admin/quiz/novo" className="text-gb-green hover:underline">
              Criar primeira
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Pergunta</th>
                <th className="px-4 py-3 text-center">Alternativas</th>
                <th className="px-4 py-3 text-center">Pacotinhos</th>
                <th className="px-4 py-3 text-center">Data</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {quizzes.map((q) => {
                const opts = (q.quiz_options as Array<{ is_correct: boolean }>) ?? [];
                return (
                  <tr key={q.id} className="hover:bg-gray-50">
                    <td className="max-w-xs px-4 py-3 font-medium text-gray-900">
                      <p className="line-clamp-2">{q.question}</p>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500">
                      {opts.length}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500">
                      {q.points}
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-gray-500">
                      {q.valid_date ?? "Qualquer dia"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          q.is_active
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {q.is_active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/quiz/${q.id}`}
                        className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
                      >
                        <Pencil size={12} /> Editar
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
