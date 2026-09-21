import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_CONCURSO_PAGE_CONFIG,
  CONCURSO_PAGE_CONFIG_KEY,
  parseConcursoPageConfig,
} from "@/lib/concurso-page";
import { ConcursoAdminShell } from "./concurso-admin-shell";

export const metadata: Metadata = { title: "Concurso Cultural" };
export const dynamic = "force-dynamic";

export default async function AdminConcursoPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", CONCURSO_PAGE_CONFIG_KEY)
    .maybeSingle();

  const initialContent = data?.value
    ? parseConcursoPageConfig(data.value)
    : DEFAULT_CONCURSO_PAGE_CONFIG;

  return <ConcursoAdminShell initialContent={initialContent} />;
}
