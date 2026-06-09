import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { MissoesClient } from "./missoes-client";

export const metadata: Metadata = { title: "Missões" };
export const dynamic = "force-dynamic";

export default async function MissoesPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("missions")
    .select("*")
    .order("created_at", { ascending: false });

  return <MissoesClient initialData={data ?? []} />;
}
