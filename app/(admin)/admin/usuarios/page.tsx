import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { UsuariosClient } from "./usuarios-client";

export const metadata: Metadata = { title: "Usuários" };
export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const supabase = createAdminClient();

  const [profilesRes, authRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, display_name, username, sticker_url, created_at")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const emailMap = Object.fromEntries(
    (authRes.data?.users ?? []).map((u) => [u.id, u.email]),
  );

  const users = (profilesRes.data ?? []).map((p) => ({
    ...p,
    email: emailMap[p.id] ?? null,
  }));

  return <UsuariosClient initialUsers={users} />;
}
