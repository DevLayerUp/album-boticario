import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PacotinhosClient } from "./pacotinhos-client";

export const metadata: Metadata = { title: "Pacotinhos" };

export default async function PacotinhosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: packs } = await supabase
    .from("packs")
    .select("id, source, source_ref, opened_at, created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return <PacotinhosClient initialPacks={packs ?? []} />;
}
