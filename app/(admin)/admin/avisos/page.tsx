import { createAdminClient } from "@/lib/supabase/admin";
import { AvisosClient } from "./avisos-client";

export default async function AdminAvisosPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Avisos</h1>
        <p className="mt-1 text-sm text-gray-500">
          Publique avisos que aparecem no sino de notificações dos usuários.
        </p>
      </div>
      <AvisosClient initialData={data ?? []} />
    </div>
  );
}
