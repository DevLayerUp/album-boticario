import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { AlbumCapaClient } from "./album-capa-client";

export const metadata: Metadata = { title: "Capa do Álbum" };

export default async function AlbumCapaPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "album_cover_url")
    .single();

  return <AlbumCapaClient currentUrl={data?.value ?? null} />;
}
