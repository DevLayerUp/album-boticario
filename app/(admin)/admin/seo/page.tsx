import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_SEO_SETTINGS,
  parseSeoSettings,
  SEO_SETTINGS_KEY,
} from "@/lib/seo-settings";
import { SeoAdminClient } from "./seo-admin-client";

export const metadata: Metadata = {
  title: "SEO — Admin",
};

export default async function SeoAdminPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", SEO_SETTINGS_KEY)
    .maybeSingle();

  const initial = data?.value
    ? parseSeoSettings(data.value)
    : DEFAULT_SEO_SETTINGS;

  return <SeoAdminClient initial={initial} />;
}
