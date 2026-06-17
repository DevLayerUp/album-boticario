import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolvePackVisualSettings } from "@/lib/pack-settings";
import { MissoesClient } from "@/components/missoes/missoes-client";

export const metadata: Metadata = { title: "Missões" };

export default async function MissoesPage() {
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

  return <MissoesClient packImageUrl={visual.packImageUrl} />;
}
