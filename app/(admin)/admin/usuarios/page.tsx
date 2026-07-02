import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRole } from "@/lib/admin-users";
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

  const authInfoMap = new Map(
    (authRes.data?.users ?? []).map((u) => [
      u.id,
      {
        email: u.email ?? null,
        is_admin: isAdminRole(u.app_metadata, u.user_metadata),
      },
    ]),
  );

  const users = (profilesRes.data ?? []).map((p) => ({
    ...p,
    email: authInfoMap.get(p.id)?.email ?? null,
    is_admin: authInfoMap.get(p.id)?.is_admin ?? false,
  }));

  return <UsuariosClient initialUsers={users} />;
}
