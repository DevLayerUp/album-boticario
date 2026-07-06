import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { buildAppPageMetadata } from "@/lib/seo-metadata";
import { createClient } from "@/lib/supabase/server";
import { parseNegociacaoSubTab, parseTrocasSection } from "@/lib/trade-history";
import TrocasClient from "@/components/trocas/trocas-client";

export async function generateMetadata(): Promise<Metadata> {
  return buildAppPageMetadata("trocas");
}

export default async function TrocasPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string; subtab?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <TrocasClient
      initialSection={parseTrocasSection(params.section)}
      initialSubTab={parseNegociacaoSubTab(params.subtab)}
      currentUserId={user.id}
    />
  );
}
