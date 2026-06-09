import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { RaridadesClient } from "./raridades-client";

export const metadata: Metadata = { title: "Raridades" };
export const dynamic = "force-dynamic";

export default async function RaridadesPage() {
  const supabase = createAdminClient();
  const { data } = await supabase.from("rarities").select("*").order("id");
  return <RaridadesClient initialData={data ?? []} />;
}
