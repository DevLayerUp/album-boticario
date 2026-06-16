import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/sidebar";

export const metadata: Metadata = { title: { template: "%s — Admin GB", default: "Admin GB" } };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role =
    (user?.app_metadata?.role ?? user?.user_metadata?.role) as
      | string
      | undefined;

  if (!user || role !== "admin") redirect("/dashboard");

  const adminName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email ??
    "Admin";

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-gray-50">
      <AdminSidebar adminName={adminName} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* topbar */}
        <header className="flex h-14 shrink-0 items-center border-b border-gray-200 bg-white px-6">
          <div className="ml-auto flex items-center gap-3">
            <span className="inline-flex h-7 items-center rounded-full bg-gb-green/10 px-2.5 text-xs font-semibold text-gb-green-dark">
              Admin
            </span>
            <span className="text-sm text-gray-500">{adminName}</span>
          </div>
        </header>

        {/* content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
