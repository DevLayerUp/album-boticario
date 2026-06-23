import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { buildAppPageMetadata } from "@/lib/seo-metadata";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolvePackVisualSettings } from "@/lib/pack-settings";
import { QuizClient } from "@/components/quiz/quiz-client";

export async function generateMetadata(): Promise<Metadata> {
  return buildAppPageMetadata("quiz");
}

export default async function QuizPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data: settings } = await admin
    .from("app_settings")
    .select("key, value")
    .eq("key", "pack_image_url")
    .maybeSingle();

  const visual = resolvePackVisualSettings(settings?.value, null);

  return <QuizClient packImageUrl={visual.packImageUrl} />;
}
