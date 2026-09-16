import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { FigurinhaForm } from "@/components/admin/figurinha-form";
import { toDatetimeLocalBRT } from "@/lib/sticker-promotion";

export const metadata: Metadata = { title: "Editar Figurinha" };

export default async function EditarFigurinhaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [stickerRes, catsRes, raritiesRes] = await Promise.all([
    supabase.from("stickers").select("*").eq("id", id).single(),
    supabase.from("sticker_categories").select("id, name").order("sort_order"),
    supabase.from("rarities").select("id, name, color_hex").order("id"),
  ]);

  if (stickerRes.error || !stickerRes.data) notFound();
  const s = stickerRes.data;

  return (
    <FigurinhaForm
      stickerId={s.id}
      initial={{
        name: s.name,
        description: s.description ?? "",
        image_url: s.image_url,
        category_id: s.category_id ? String(s.category_id) : "",
        rarity_id: s.rarity_id ? String(s.rarity_id) : "",
        redirect_url: s.redirect_url ?? "",
        is_user_type: s.is_user_type,
        is_active: s.is_active,
        is_public: s.is_public !== false,
        promotion_enabled: Boolean(s.promotion_enabled),
        promotion_unlocks_at: toDatetimeLocalBRT(s.promotion_unlocks_at),
        promotion_message: s.promotion_message ?? "",
      }}
      categories={catsRes.data ?? []}
      rarities={raritiesRes.data ?? []}
    />
  );
}
