import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { PacotinhosAdminClient } from "./pacotinhos-admin-client";

export const metadata: Metadata = { title: "Pacotinhos" };

export default async function PacotinhosAdminPage() {
  const supabase = createAdminClient();
  const { data: settings } = await supabase
    .from("app_settings")
    .select("key, value")
    .in("key", ["pack_image_url", "pack_opening_gif_url"]);

  const map = Object.fromEntries((settings ?? []).map((s) => [s.key, s.value]));

  return (
    <PacotinhosAdminClient
      packImageUrl={map.pack_image_url ?? null}
      openingGifUrl={map.pack_opening_gif_url ?? null}
    />
  );
}
