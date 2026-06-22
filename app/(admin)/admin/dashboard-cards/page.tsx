import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  DASHBOARD_FEATURE_CARDS_KEY,
  DEFAULT_DASHBOARD_FEATURE_CARDS,
  parseDashboardFeatureCards,
} from "@/lib/dashboard-feature-cards";
import { DashboardCardsAdminClient } from "./dashboard-cards-admin-client";

export const metadata: Metadata = {
  title: "Cards da Dashboard — Admin",
};

export default async function DashboardCardsAdminPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", DASHBOARD_FEATURE_CARDS_KEY)
    .maybeSingle();

  const initial = data?.value
    ? parseDashboardFeatureCards(data.value)
    : DEFAULT_DASHBOARD_FEATURE_CARDS;

  return <DashboardCardsAdminClient initial={initial} />;
}
