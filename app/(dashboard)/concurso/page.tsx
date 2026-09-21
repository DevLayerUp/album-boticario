import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { buildAppPageMetadata } from "@/lib/seo-metadata";
import { createClient } from "@/lib/supabase/server";
import { ConcursoLanding } from "@/components/concurso/concurso-landing";
import type { ContestEntry } from "@/lib/concurso";
import { canViewConcurso, loadConcursoPageConfig } from "@/lib/concurso-page";
import { isAdminRole } from "@/lib/admin-users";

export async function generateMetadata(): Promise<Metadata> {
  return buildAppPageMetadata("concurso");
}

export default async function ConcursoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profileRes, entryRes, config] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, phone")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("contest_entries")
      .select("id, full_name, email, phone, answer, created_at")
      .eq("user_id", user.id)
      .maybeSingle(),
    loadConcursoPageConfig(supabase),
  ]);

  const isAdmin = isAdminRole(user.app_metadata, user.user_metadata);
  if (!canViewConcurso(config, isAdmin)) redirect("/dashboard");

  const entry = entryRes.error ? null : (entryRes.data as ContestEntry | null);

  const nome =
    profileRes.data?.display_name ??
    user.user_metadata?.full_name ??
    user.user_metadata?.display_name ??
    user.email?.split("@")[0] ??
    "";

  return (
    <ConcursoLanding
      prefill={{
        fullName: nome,
        email: user.email ?? "",
        phone: profileRes.data?.phone ?? "",
      }}
      entry={entry}
      config={config}
    />
  );
}
