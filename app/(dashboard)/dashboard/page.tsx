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
  Trophy,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildLeaderboard } from "@/lib/ranking";
import { HeroBanner } from "@/components/dashboard/hero-banner";
import { StatCard } from "@/components/dashboard/stat-card";
import { FeatureCard } from "@/components/dashboard/feature-card";
import { dashboardAssets } from "@/lib/dashboard-assets";
import {
  DASHBOARD_FEATURE_CARDS_KEY,
  DEFAULT_DASHBOARD_FEATURE_CARDS,
  getFeatureCardBackground,
  parseDashboardFeatureCards,
} from "@/lib/dashboard-feature-cards";
import { InviteCard } from "@/components/dashboard/invite-card";
import { buildInviteUrl } from "@/lib/referrals";
import { headers } from "next/headers";

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
    referralCodeRes,
    referralsRes,
    stickersRes,
    packsRes,
    slotsRes,
    filledRes,
    tradesRes,
    featureCardsRes,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, referral_code")
      .eq("id", user.id)
      .single(),
    supabase.rpc("ensure_referral_code", { p_user_id: user.id }),
    supabase
      .from("profiles")
      .select("id, display_name, created_at", { count: "exact" })
      .eq("referred_by", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
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
    supabase
      .from("app_settings")
      .select("value")
      .eq("key", DASHBOARD_FEATURE_CARDS_KEY)
      .maybeSingle(),
  ]);

  const nome =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.display_name ??
    user?.email?.split("@")[0] ??
    "colecionador";

  const primeiroNome = nome.split(" ")[0];
  const isAdmin =
    (user?.app_metadata?.role ?? user?.user_metadata?.role) === "admin";

  const admin = createAdminClient();
  const leaderboard = await buildLeaderboard(admin, user.id);
  const userRank = leaderboard.entries.find((e) => e.user_id === user.id)?.rank;
  const rankDisplay = userRank ? `${userRank}º` : "—";

  const totalStickers = stickersRes.count ?? 0;
  const availPacks = packsRes.count ?? 0;
  const totalSlots = Math.max(slotsRes.count ?? 1, 1);
  const filledSlots = filledRes.count ?? 0;
  const albumPct = Math.round((filledSlots / totalSlots) * 100);
  const totalTrades = tradesRes.count ?? 0;

  const headersList = await headers();
  const siteOrigin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    headersList.get("origin") ??
    "http://localhost:3000";
  const referralCode =
    referralCodeRes.data ??
    profileRes.data?.referral_code ??
    null;
  const featureCards = featureCardsRes.data?.value
    ? parseDashboardFeatureCards(featureCardsRes.data.value)
    : DEFAULT_DASHBOARD_FEATURE_CARDS;

  const referralData = referralCode
    ? {
        referral_code: referralCode,
        invite_url: buildInviteUrl(referralCode, siteOrigin),
        signup_count: referralsRes.count ?? 0,
        recent_signups: referralsRes.data ?? [],
      }
    : null;

  return (
    <div className="flex flex-col">
      {/* ── Banner admin ──────────────────────────────────────────────── */}
      {isAdmin && (
        <Link
          href="/admin"
          className="group mb-8 flex items-center justify-between rounded-block border border-verde-500/25 bg-verde-100/40 px-5 py-3.5 transition-colors duration-200 hover:bg-verde-100/70"
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
        eyebrow="Conheça o álbum oficial dos fãs por natureza"
        title={`Olá, ${primeiroNome}!`}
        subtitle="Teste seus conhecimentos no quiz, complete desafios e junte figurinhas para completar seu álbum."
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
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5 lg:gap-6">
        <StatCard
          label="Figurinhas"
          value={totalStickers}
          href="/colecao"
          icon={Layers}
          variant="solid"
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
        <StatCard
          label="Ranking"
          value={rankDisplay}
          href="/ranking"
          icon={Trophy}
        />
      </div>

      {/* ── Explorar ─────────────────────────────────────────────────── */}
      <section className="mt-28">
        <h2 className="mb-10 font-display text-3xl font-bold text-verde-escuro-500 md:text-4xl">
          Explorar
        </h2>

        <div className="grid gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-20">
          <FeatureCard
            title="Minha figurinha"
            description="Personalize a sua própria figurinha e faça parte do álbum também! Coloque uma foto sua e entre oficialmente para o time."
            href="/figurinha"
            cta="Criar"
            theme="green"
            backgroundImage={getFeatureCardBackground("figurinha", featureCards)}
          />
          <FeatureCard
            title="Meu Álbum"
            description="Conheça mais sobre a biodiversidade, abra as páginas para colar suas figurinhas e explorar as nossas florestas e o nosso oceano."
            href="/album"
            cta="Visualizar"
            theme="blue"
            backgroundImage={getFeatureCardBackground("album", featureCards)}
          />
          <FeatureCard
            title="Pacotinhos"
            description="Acesse seus pacotes disponíveis e abra para descobrir novas figurinhas"
            href="/pacotinhos"
            cta="Abrir"
            theme="gold"
            backgroundImage={getFeatureCardBackground("pacotinhos", featureCards)}
          />
          <FeatureCard
            title="Quiz Diário"
            description="Pacotes novos todos os dias! Responda ao quiz e ganhe mais figurinhas para completar o álbum."
            href="/quiz"
            cta="Jogar"
            theme="green"
            backgroundImage={getFeatureCardBackground("quiz", featureCards)}
          />
          <FeatureCard
            title="Missões do Dia"
            description="Cumpra as tarefas do dia para multiplicar seus pontos e garantir pacotes extras."
            href="/missoes"
            cta="Cumprir"
            theme="blue"
            backgroundImage={getFeatureCardBackground("missoes", featureCards)}
          />
          <FeatureCard
            title="Central de Trocas"
            description="Negocie suas figurinhas repetidas com a galera e encontre as que falta na sua coleção."
            href="/trocas"
            cta="Trocar"
            theme="green"
            backgroundImage={getFeatureCardBackground("trocas", featureCards)}
          />
          <FeatureCard
            title="Ranking dos Fãs"
            description="Quem lidera o placar? Acompanhe a pontuação geral, compare seu score com amigos e dispute o topo da tabela para ganhar recompensas."
            href="/ranking"
            cta="Visualizar"
            theme="gold"
            backgroundImage={getFeatureCardBackground("ranking", featureCards)}
          />
        </div>
      </section>

      {referralData && (
        <div className="mt-16 lg:mt-20">
          <InviteCard
            data={referralData}
            inviterName={profileRes.data?.display_name ?? primeiroNome}
          />
        </div>
      )}
    </div>
  );
}
