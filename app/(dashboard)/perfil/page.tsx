import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PerfilClient } from "@/components/perfil/perfil-client";
import { fetchProfilePageData } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Meu Perfil" };

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) redirect("/login");

  let initialData;
  try {
    initialData = await fetchProfilePageData(supabase, user.id, user.email);
  } catch {
    redirect("/login");
  }

  return <PerfilClient initialData={initialData} />;
}
