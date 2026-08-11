import type { Metadata } from "next";
import { DivulgacaoClient } from "./divulgacao-client";

export const metadata: Metadata = { title: "Divulgação" };
export const dynamic = "force-dynamic";

export default function DivulgacaoAdminPage() {
  return <DivulgacaoClient />;
}
