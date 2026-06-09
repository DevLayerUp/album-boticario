import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  console.log("[HOME] getUser →", user?.id ?? "null", error?.message ?? "");
  redirect(user ? "/dashboard" : "/login");
}
