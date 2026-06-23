import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { buildAppPageMetadata } from "@/lib/seo-metadata";
import { createClient } from "@/lib/supabase/server";
import { RankingClient } from "@/components/ranking/ranking-client";

export async function generateMetadata(): Promise<Metadata> {
  return buildAppPageMetadata("ranking");
}

export default async function RankingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <RankingClient />;
}
