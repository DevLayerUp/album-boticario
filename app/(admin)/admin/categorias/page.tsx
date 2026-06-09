import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { CategoriasClient } from "./categorias-client";

export const metadata: Metadata = { title: "Categorias" };
export const dynamic = "force-dynamic";

export default async function CategoriasPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("sticker_categories")
    .select("*")
    .order("sort_order");

  return <CategoriasClient initialData={data ?? []} />;
}
