import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { FigurinhaForm } from "@/components/admin/figurinha-form";

export const metadata: Metadata = { title: "Nova Figurinha" };

export default async function NovaFigurinhaPage() {
  const supabase = createAdminClient();
  const [catsRes, raritiesRes] = await Promise.all([
    supabase.from("sticker_categories").select("id, name").order("sort_order"),
    supabase.from("rarities").select("id, name, color_hex").order("id"),
  ]);

  return (
    <FigurinhaForm
      categories={catsRes.data ?? []}
      rarities={raritiesRes.data ?? []}
    />
  );
}
