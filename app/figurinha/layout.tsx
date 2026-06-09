import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Minha Figurinha",
};

export default async function FigurinhaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-dvh flex-col bg-gb-green-deep">
      {/* Header mínimo — foco total no fluxo */}
      <header className="flex items-center justify-between px-6 py-4">
        <div>
          <span className="block font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-gb-green">
            Grupo Boticário
          </span>
          <span className="font-display text-base font-semibold text-white">
            Álbum de Figurinhas
          </span>
        </div>

        <Link
          href="/dashboard"
          className="rounded-full border border-white/20 px-4 py-1.5 text-sm font-semibold text-white/60 transition-all duration-200 hover:border-white/40 hover:text-white"
        >
          Agora não
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-8">
        {children}
      </main>
    </div>
  );
}
