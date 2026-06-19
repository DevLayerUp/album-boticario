import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_FIRST_STEPS_CONFIG,
  FIRST_STEPS_CONFIG_KEY,
  parseFirstStepsConfig,
} from "@/lib/first-steps";
import { FirstStepsAdminClient } from "./first-steps-admin-client";

export const metadata: Metadata = {
  title: "Primeiros Passos — Admin",
};

export default async function FirstStepsAdminPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", FIRST_STEPS_CONFIG_KEY)
    .maybeSingle();

  const initial = data?.value
    ? parseFirstStepsConfig(data.value)
    : DEFAULT_FIRST_STEPS_CONFIG;

  return <FirstStepsAdminClient initial={initial} />;
}
