import type { Metadata } from "next";
import { QuizClient } from "./quiz-client";

export const metadata: Metadata = { title: "Quiz do Dia" };

export default function QuizPage() {
  return <QuizClient />;
}
