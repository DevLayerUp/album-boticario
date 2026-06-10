import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Package,
  BookOpen,
  ArrowLeftRight,
  ShieldCheck,
  ChevronRight,
  Layers,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { HeroBanner } from "@/components/dashboard/hero-banner";
import { StatCard } from "@/components/dashboard/stat-card";
import { FeatureCard } from "@/components/dashboard/feature-card";
import { dashboardAssets } from "@/lib/dashboard-assets";

export const metadata: Metadata = { title: "Início" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Guard: se não há sessão válida, redireciona para login
  if (!user) redirect("/login");

  const [
    profileRes,
    stickersRes,
    packsRes,
    slotsRes,
    filledRes,
    tradesRes,
  ] = await Promise.all([
    supabase.from("profiles").select("sticker_url").eq("id", user.id).single(),
    supabase
      .from("user_stickers")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("quantity", 1),
    supabase
      .from("packs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("opened_at", null),
    supabase.from("album_slots").select("*", { count: "exact", head: true }),
    supabase
      .from("user_album")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("trade_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "accepted")
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`),
  ]);

  const nome =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.display_name ??
    user?.email?.split("@")[0] ??
    "colecionador";

  const primeiroNome = nome.split(" ")[0];
  const hasFigurinhaUrl = profileRes.data?.sticker_url ?? null;
  const isAdmin =
    (user?.app_metadata?.role ?? user?.user_metadata?.role) === "admin";

  const totalStickers = stickersRes.count ?? 0;
  const availPacks = packsRes.count ?? 0;
  const totalSlots = Math.max(slotsRes.count ?? 1, 1);
  const filledSlots = filledRes.count ?? 0;
  const albumPct = Math.round((filledSlots / totalSlots) * 100);
  const totalTrades = tradesRes.count ?? 0;

  return (
    <div className="flex flex-col gap-8">
      {/* ── Banner admin ──────────────────────────────────────────────── */}
      {isAdmin && (
        <Link
          href="/admin"
          className="group flex items-center justify-between rounded-block border border-verde-500/25 bg-verde-100/40 px-5 py-3.5 transition-colors duration-200 hover:bg-verde-100/70"
        >
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-chip bg-verde-500 text-white">
              <ShieldCheck aria-hidden className="size-4" strokeWidth={2} />
            </span>
            <div className="leading-tight">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-verde-500">
                Painel administrativo
              </p>
              <p className="text-sm font-medium text-verde-escuro-500">
                Gerenciar figurinhas, usuários e conteúdo
              </p>
            </div>
          </div>
          <ChevronRight
            aria-hidden
            className="size-5 text-verde-500/50 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-verde-500"
          />
        </Link>
      )}

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <HeroBanner
        eyebrow="Bem-vindo ao álbum"
        title={`Olá, ${primeiroNome}!`}
        subtitle={
          hasFigurinhaUrl
            ? "Sua figurinha está pronta. Responda o quizz, cumpra missões e continue colecionando!"
            : "Crie sua figurinha, abra pacotinhos e complete o álbum Fãs da Natureza."
        }
        backgroundImage={dashboardAssets.hero}
      >
        <Link
          href="/quiz"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-pill bg-amarelo px-7 font-medium text-verde-escuro-500 transition-[filter,transform] duration-200 hover:-translate-y-px hover:brightness-95"
        >
          Responder Quizz
        </Link>
        <Link
          href="/missoes"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-pill border border-amarelo px-7 font-medium text-amarelo transition-colors duration-200 hover:bg-amarelo/10"
        >
          Minhas missões
        </Link>
      </HeroBanner>

      {/* ── Estatísticas ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Figurinhas"
          value={totalStickers}
          href="/colecao"
          icon={Layers}
        />
        <StatCard
          label="Pacotinhos"
          value={availPacks}
          href="/pacotinhos"
          icon={Package}
        />
        <StatCard
          label="Álbum"
          value={`${albumPct}%`}
          href="/album"
          icon={BookOpen}
        />
        <StatCard
          label="Trocas"
          value={totalTrades}
          href="/trocas"
          icon={ArrowLeftRight}
        />
      </div>

      {/* ── Explorar ─────────────────────────────────────────────────── */}
      <section>
        <div className="mb-5 flex items-baseline gap-3">
          <h2 className="font-display text-3xl font-bold text-verde-escuro-500">
            Explorar
          </h2>
          <span className="text-sm text-verde-escuro-capa/60">
            7 áreas disponíveis
          </span>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            title="Minha figurinha"
            description="Envie sua foto, remova o fundo e ganhe uma figurinha personalizada com a moldura Fãs da Natureza."
            href="/figurinha"
            cta="Criar"
            theme="green"
            backgroundImage={dashboardAssets.cards.figurinha}
          />
          <FeatureCard
            title="Meu Álbum"
            description="Cole suas figurinhas nos slots, vire as páginas e conclua o álbum completo."
            href="/album"
            cta="Visualizar"
            theme="blue"
            backgroundImage={dashboardAssets.cards.album}
          />
          <FeatureCard
            title="Coleção"
            description="Veja todas as figurinhas que você possui, com filtros por raridade e categoria."
            href="/colecao"
            cta="Explorar"
            theme="gold"
            backgroundImage={dashboardAssets.cards.colecao}
          />
          <FeatureCard
            title="Pacotinhos"
            description="Abra pacotinhos e descubra figurinhas com efeitos especiais por raridade."
            href="/pacotinhos"
            cta="Abrir"
            theme="gold"
            backgroundImage={dashboardAssets.cards.pacotinhos}
          />
          <FeatureCard
            title="Quizz"
            description="Responda uma pergunta por dia sobre o Grupo Boticário e ganhe pacotinhos extras."
            href="/quiz"
            cta="Jogar"
            theme="green"
            backgroundImage={dashboardAssets.cards.quiz}
          />
          <FeatureCard
            title="Missões"
            description="Complete desafios do programa para acumular recompensas e figurinhas raras."
            href="/missoes"
            cta="Cumprir"
            theme="blue"
            backgroundImage={dashboardAssets.cards.missoes}
          />
          <FeatureCard
            title="Trocas"
            description="Troque figurinhas duplicadas com outros colecionadores e complete seu álbum mais rápido."
            href="/trocas"
            cta="Trocar"
            theme="green"
            backgroundImage={dashboardAssets.cards.trocas}
          />
        </div>
      </section>
    </div>
  );
}
