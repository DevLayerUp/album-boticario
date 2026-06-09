import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Início" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  console.log("[DASHBOARD] getUser →", user?.id ?? "null", authError?.message ?? "");

  // Guard: se não há sessão válida, redireciona para login
  if (!user) {
    console.log("[DASHBOARD] sem user → redirect /login");
    redirect("/login");
  }

  const [
    profileRes,
    stickersRes,
    packsRes,
    slotsRes,
    filledRes,
    missionsRes,
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
      .from("user_missions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .not("completed_at", "is", null),
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
  const completedMissions = missionsRes.count ?? 0;

  const stats = [
    {
      label: "Figurinhas",
      value: totalStickers,
      icon: <StickerStatIcon />,
      accent: "var(--color-gb-green)",
      href: "/colecao",
    },
    {
      label: "Pacotinhos",
      value: availPacks,
      icon: <PackStatIcon />,
      accent: "var(--color-gb-gold)",
      href: "/pacotinhos",
    },
    {
      label: "Álbum",
      value: `${albumPct}%`,
      icon: <AlbumStatIcon />,
      accent: "var(--color-gb-gold)",
      href: "/album",
    },
    {
      label: "Missões",
      value: completedMissions,
      icon: <MissionStatIcon />,
      accent: "var(--color-rarity-super)",
      href: "/missoes",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* ── Admin banner ──────────────────────────────────────────────── */}
      {isAdmin && (
        <Link
          href="/admin"
          className="group flex items-center justify-between rounded-2xl border border-gb-green/25 bg-gb-green/6 px-5 py-3.5 transition-all duration-200 hover:bg-gb-green/10 hover:shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gb-green text-white shadow-sm">
              <ShieldIcon />
            </span>
            <div className="leading-tight">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-gb-green">
                Painel administrativo
              </p>
              <p className="text-sm font-medium text-gb-green-dark">
                Gerenciar figurinhas, usuários e conteúdo
              </p>
            </div>
          </div>
          <ChevronRightIcon />
        </Link>
      )}

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-gb-green-deep px-7 py-10 md:px-10 md:py-14">
        {/* Decorative rings */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full border border-white/8"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-6 h-44 w-44 rounded-full border border-white/8"
        />
        {/* Gold glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 right-16 h-32 w-32 rounded-full bg-gb-gold/20 blur-2xl"
        />
        {/* Green glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-8 top-12 h-40 w-40 rounded-full bg-gb-green/30 blur-3xl"
        />

        <div className="relative flex items-center justify-between gap-6">
          <div className="max-w-md">
            <p className="font-body text-[11px] font-bold uppercase tracking-[0.25em] text-gb-green">
              Bem-vindo ao álbum
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold leading-tight text-white md:text-5xl">
              Olá,&nbsp;{primeiroNome}!
            </h1>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/60">
              {hasFigurinhaUrl
                ? "Sua figurinha está pronta. Continue colecionando!"
                : "Crie sua figurinha, abra pacotinhos e complete o álbum Grupo\u00a0Boticário."}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              {hasFigurinhaUrl ? (
                <Link
                  href="/colecao"
                  className="inline-flex items-center gap-2 rounded-full bg-gb-gold px-6 py-2.5 text-sm font-bold text-gb-green-deep shadow-lg shadow-gb-gold/30 transition-all duration-200 hover:brightness-110 hover:-translate-y-px"
                >
                  <StarIcon />
                  Ver minha coleção
                </Link>
              ) : (
                <Link
                  href="/figurinha"
                  className="inline-flex items-center gap-2 rounded-full bg-gb-gold px-6 py-2.5 text-sm font-bold text-gb-green-deep shadow-lg shadow-gb-gold/30 transition-all duration-200 hover:brightness-110 hover:-translate-y-px"
                >
                  <StarIcon />
                  Criar minha figurinha
                </Link>
              )}
              {availPacks > 0 && (
                <Link
                  href="/pacotinhos"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20 hover:-translate-y-px"
                >
                  <PackStatIcon />
                  {availPacks} pacotinho{availPacks !== 1 ? "s" : ""} pra abrir
                </Link>
              )}
            </div>
          </div>

          {hasFigurinhaUrl && (
            <div className="hidden shrink-0 sm:block">
              <div className="relative h-32 w-24 overflow-hidden rounded-2xl border-2 border-gb-gold/40 shadow-2xl shadow-black/40 ring-1 ring-white/10">
                <Image
                  src={hasFigurinhaUrl}
                  alt="Minha figurinha"
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(({ label, value, icon, accent, href }) => (
          <Link
            key={label}
            href={href}
            className="group relative overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
          >
            {/* Colored top accent bar */}
            <div
              className="h-1 w-full"
              style={{ background: accent }}
            />
            <div className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-white"
                  style={{ background: `color-mix(in srgb, ${accent} 15%, transparent)`, color: accent }}
                >
                  {icon}
                </span>
                <ArrowUpRightIcon className="text-border opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              </div>
              <p className="font-display text-2xl font-bold text-gb-ink sm:text-3xl">
                {value}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-muted">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Feature cards ─────────────────────────────────────────────── */}
      <section>
        <div className="mb-5 flex items-baseline gap-3">
          <h2 className="font-display text-xl font-semibold text-gb-ink">
            Explorar
          </h2>
          <span className="text-xs text-muted">7 áreas disponíveis</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            title="Minha Figurinha"
            description="Envie sua foto, remova o fundo e ganhe uma figurinha personalizada com moldura GB."
            href="/figurinha"
            badge="Criar"
            accentColor="#00a859"
            gradientFrom="rgba(0,168,89,0.18)"
            gradientTo="rgba(0,168,89,0.04)"
            visual={<StickerIllustration />}
          />
          <FeatureCard
            title="Álbum"
            description="Cole suas figurinhas nos slots, vire as páginas e conclua o álbum completo."
            href="/album"
            badge="Ver"
            accentColor="#d9a441"
            gradientFrom="rgba(217,164,65,0.20)"
            gradientTo="rgba(217,164,65,0.04)"
            visual={<AlbumIllustration />}
          />
          <FeatureCard
            title="Coleção"
            description="Veja todas as figurinhas que você possui, com filtros por raridade e categoria."
            href="/colecao"
            badge="Explorar"
            accentColor="#4a5751"
            gradientFrom="rgba(74,87,81,0.15)"
            gradientTo="rgba(74,87,81,0.03)"
            visual={<ColecaoIllustration />}
          />
          <FeatureCard
            title="Pacotinhos"
            description="Abra pacotinhos e descubra figurinhas com efeitos especiais por raridade."
            href="/pacotinhos"
            badge="Abrir"
            accentColor="#ff6ec7"
            gradientFrom="rgba(255,110,199,0.18)"
            gradientTo="rgba(255,110,199,0.04)"
            visual={<PackIllustration />}
          />
          <FeatureCard
            title="Quiz do Dia"
            description="Responda uma pergunta por dia sobre o Grupo Boticário e ganhe pacotinhos extras."
            href="/quiz"
            badge="Jogar"
            accentColor="#4f46e5"
            gradientFrom="rgba(79,70,229,0.15)"
            gradientTo="rgba(79,70,229,0.03)"
            visual={<QuizIllustration />}
          />
          <FeatureCard
            title="Missões"
            description="Complete desafios do programa para acumular recompensas e figurinhas raras."
            href="/missoes"
            badge="Desafiar"
            accentColor="#d9a441"
            gradientFrom="rgba(217,164,65,0.18)"
            gradientTo="rgba(217,164,65,0.04)"
            visual={<MissionIllustration />}
          />
          <FeatureCard
            title="Trocas"
            description="Troque figurinhas duplicadas com outros colecionadores e complete seu álbum mais rápido."
            href="/trocas"
            badge="Trocar"
            accentColor="#059669"
            gradientFrom="rgba(5,150,105,0.15)"
            gradientTo="rgba(5,150,105,0.03)"
            visual={<TrocasIllustration />}
          />
        </div>
      </section>
    </div>
  );
}

/* ─── Feature Card ────────────────────────────────────────────────── */

function FeatureCard({
  title,
  description,
  href,
  badge,
  accentColor,
  gradientFrom,
  gradientTo,
  visual,
}: {
  title: string;
  description: string;
  href: string;
  badge: string;
  accentColor: string;
  gradientFrom: string;
  gradientTo: string;
  visual: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
    >
      {/* Visual area */}
      <div
        className="relative flex h-44 items-center justify-center overflow-hidden"
        style={{
          background: `radial-gradient(ellipse at 60% 40%, ${gradientFrom}, ${gradientTo} 70%)`,
        }}
      >
        {/* Subtle dot pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage: `radial-gradient(${accentColor}40 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />

        {/* Illustration */}
        <div className="relative z-10 transition-transform duration-300 group-hover:scale-105">
          {visual}
        </div>

        {/* Arrow reveal on hover */}
        <div
          className="absolute right-3.5 top-3.5 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm opacity-0 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0"
        >
          <ArrowUpRightIcon className="text-gb-ink" size={13} />
        </div>

        {/* Badge */}
        <div
          className="absolute bottom-3 left-4 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm"
          style={{ background: accentColor }}
        >
          {badge}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold text-gb-ink">
          {title}
        </h3>
        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted line-clamp-2">
          {description}
        </p>
      </div>

      {/* Bottom accent line */}
      <div
        className="h-[3px] w-0 transition-all duration-300 group-hover:w-full"
        style={{ background: `linear-gradient(to right, ${accentColor}, transparent)` }}
      />
    </Link>
  );
}

/* ─── Ilustrações ─────────────────────────────────────────────────── */

function StickerIllustration() {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" aria-hidden>
      {/* Card frame */}
      <rect x="28" y="15" width="44" height="58" rx="6" fill="#00a859" fillOpacity="0.15" stroke="#00a859" strokeWidth="1.5" />
      {/* Inner face circle */}
      <circle cx="50" cy="42" r="14" fill="#006341" fillOpacity="0.2" />
      <circle cx="50" cy="38" r="9" fill="#006341" fillOpacity="0.25" />
      <path d="M37 58c0-7.18 5.82-10 13-10s13 2.82 13 10" stroke="#00a859" strokeWidth="1.8" strokeLinecap="round" />
      {/* Sparkles */}
      <path d="M20 28 L22 24 L24 28 L22 32 Z" fill="#d9a441" fillOpacity="0.8" />
      <path d="M76 20 L78 16 L80 20 L78 24 Z" fill="#d9a441" fillOpacity="0.8" />
      <circle cx="18" cy="60" r="3" fill="#00a859" fillOpacity="0.4" />
      <circle cx="82" cy="50" r="2" fill="#d9a441" fillOpacity="0.5" />
      {/* Star badge */}
      <circle cx="66" cy="65" r="10" fill="#d9a441" />
      <path d="M66 58.5l1.5 4.5h4.5L68.5 66l1.5 4.5L66 67.5l-3.5 3 1.5-4.5-3.5-3h4.5Z" fill="white" />
    </svg>
  );
}

function AlbumIllustration() {
  return (
    <svg width="110" height="90" viewBox="0 0 110 90" fill="none" aria-hidden>
      {/* Album spine */}
      <rect x="50" y="8" width="10" height="74" rx="4" fill="#d9a441" fillOpacity="0.5" />
      {/* Left page */}
      <rect x="8" y="12" width="42" height="66" rx="5" fill="#d9a441" fillOpacity="0.1" stroke="#d9a441" strokeWidth="1.5" />
      {/* Right page */}
      <rect x="60" y="12" width="42" height="66" rx="5" fill="#d9a441" fillOpacity="0.1" stroke="#d9a441" strokeWidth="1.5" />
      {/* Sticker slots — left page */}
      {[[14, 20], [32, 20], [14, 44], [32, 44]].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="16" height="18" rx="3"
          fill={i < 2 ? "#d9a441" : "none"} fillOpacity="0.25"
          stroke="#d9a441" strokeWidth="1.2" strokeOpacity={i < 2 ? "0" : "0.5"}
          strokeDasharray={i >= 2 ? "3 2" : "0"} />
      ))}
      {/* Sticker slots — right page */}
      {[[66, 20], [84, 20], [66, 44], [84, 44]].map(([x, y], i) => (
        <rect key={i + 4} x={x} y={y} width="16" height="18" rx="3"
          fill={i === 0 ? "#d9a441" : "none"} fillOpacity="0.25"
          stroke="#d9a441" strokeWidth="1.2" strokeOpacity={i === 0 ? "0" : "0.5"}
          strokeDasharray={i > 0 ? "3 2" : "0"} />
      ))}
      {/* Progress tag */}
      <rect x="20" y="70" width="22" height="5" rx="2.5" fill="#d9a441" fillOpacity="0.5" />
    </svg>
  );
}

function ColecaoIllustration() {
  return (
    <svg width="100" height="90" viewBox="0 0 100 90" fill="none" aria-hidden>
      {/* Grid of stickers at slight angles */}
      {[
        { x: 12, y: 20, r: -8, fill: "#00a859" },
        { x: 36, y: 14, r: 5, fill: "#d9a441" },
        { x: 60, y: 18, r: -4, fill: "#ff6ec7" },
        { x: 16, y: 50, r: 6, fill: "#d9a441" },
        { x: 40, y: 46, r: -7, fill: "#00a859" },
        { x: 64, y: 48, r: 8, fill: "#ff6ec7" },
      ].map(({ x, y, r, fill }, i) => (
        <rect
          key={i}
          x={x} y={y} width="22" height="28" rx="3"
          fill={fill} fillOpacity="0.18"
          stroke={fill} strokeWidth="1.2"
          transform={`rotate(${r}, ${x + 11}, ${y + 14})`}
        />
      ))}
      {/* Checkmark on first card */}
      <circle cx="23" cy="34" r="6" fill="#00a859" fillOpacity="0.5" />
      <path d="M20 34l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PackIllustration() {
  return (
    <svg width="80" height="100" viewBox="0 0 80 100" fill="none" aria-hidden>
      {/* Glow */}
      <ellipse cx="40" cy="60" rx="28" ry="32" fill="#ff6ec7" fillOpacity="0.15" />
      {/* Pack body */}
      <rect x="14" y="22" width="52" height="64" rx="7" fill="#ff6ec7" fillOpacity="0.18" stroke="#ff6ec7" strokeWidth="1.5" />
      {/* Tear line */}
      <path d="M14 36 Q20 32 26 36 Q32 40 38 36 Q44 32 50 36 Q56 40 62 36 Q66 33 66 36"
        stroke="#ff6ec7" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Shine ray 1 */}
      <line x1="28" y1="28" x2="20" y2="14" stroke="#ff6ec7" strokeWidth="1.5" strokeOpacity="0.5" strokeLinecap="round" />
      {/* Shine ray 2 */}
      <line x1="40" y1="24" x2="40" y2="10" stroke="#ff6ec7" strokeWidth="1.5" strokeOpacity="0.5" strokeLinecap="round" />
      {/* Shine ray 3 */}
      <line x1="52" y1="28" x2="60" y2="14" stroke="#ff6ec7" strokeWidth="1.5" strokeOpacity="0.5" strokeLinecap="round" />
      {/* Star */}
      <path d="M40 52l2.5 7.5H50l-6.5 4.5 2.5 7.5L40 67l-6.5 4.5 2.5-7.5L29.5 59.5H37Z"
        fill="#ff6ec7" fillOpacity="0.5" stroke="#ff6ec7" strokeWidth="1" />
    </svg>
  );
}

function QuizIllustration() {
  return (
    <svg width="100" height="90" viewBox="0 0 100 90" fill="none" aria-hidden>
      {/* Thought bubble */}
      <ellipse cx="50" cy="44" rx="34" ry="30" fill="#4f46e5" fillOpacity="0.12" stroke="#4f46e5" strokeWidth="1.5" />
      {/* Question mark */}
      <text x="50" y="58" textAnchor="middle" fontSize="36" fontWeight="700" fill="#4f46e5" fillOpacity="0.6" fontFamily="Georgia, serif">?</text>
      {/* Small dots (tail) */}
      <circle cx="28" cy="72" r="4" fill="#4f46e5" fillOpacity="0.25" />
      <circle cx="20" cy="80" r="3" fill="#4f46e5" fillOpacity="0.18" />
      {/* Sparkles */}
      <path d="M78 22 L80 17 L82 22 L80 27 Z" fill="#d9a441" fillOpacity="0.8" />
      <path d="M14 30 L16 26 L18 30 L16 34 Z" fill="#d9a441" fillOpacity="0.7" />
      <circle cx="82" cy="60" r="3" fill="#4f46e5" fillOpacity="0.3" />
    </svg>
  );
}

function MissionIllustration() {
  return (
    <svg width="100" height="90" viewBox="0 0 100 90" fill="none" aria-hidden>
      {/* Trophy body */}
      <path d="M35 20h30v32c0 10-8 16-15 16s-15-6-15-16Z" fill="#d9a441" fillOpacity="0.2" stroke="#d9a441" strokeWidth="1.5" />
      {/* Trophy handles */}
      <path d="M35 28h-8a8 8 0 0 0 8 14" stroke="#d9a441" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M65 28h8a8 8 0 0 1-8 14" stroke="#d9a441" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Trophy base */}
      <rect x="42" y="68" width="16" height="5" rx="2" fill="#d9a441" fillOpacity="0.5" />
      <rect x="36" y="73" width="28" height="4" rx="2" fill="#d9a441" fillOpacity="0.35" />
      {/* Star in trophy */}
      <path d="M50 30l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6Z" fill="#d9a441" fillOpacity="0.7" />
      {/* Check badges */}
      <circle cx="20" cy="25" r="8" fill="#00a859" fillOpacity="0.15" stroke="#00a859" strokeWidth="1.2" />
      <path d="M16 25l2.5 2.5 5-5" stroke="#00a859" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="80" cy="55" r="7" fill="#00a859" fillOpacity="0.15" stroke="#00a859" strokeWidth="1.2" />
      <path d="M76.5 55l2 2 4-4" stroke="#00a859" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrocasIllustration() {
  return (
    <svg width="110" height="80" viewBox="0 0 110 80" fill="none" aria-hidden>
      {/* Left sticker */}
      <rect x="8" y="16" width="34" height="44" rx="6" fill="#059669" fillOpacity="0.15" stroke="#059669" strokeWidth="1.5" />
      <circle cx="25" cy="34" r="9" fill="#059669" fillOpacity="0.2" />
      <path d="M16 50c0-5 4-8 9-8s9 3 9 8" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />
      {/* Right sticker */}
      <rect x="68" y="16" width="34" height="44" rx="6" fill="#d9a441" fillOpacity="0.15" stroke="#d9a441" strokeWidth="1.5" />
      <circle cx="85" cy="34" r="9" fill="#d9a441" fillOpacity="0.2" />
      <path d="M76 50c0-5 4-8 9-8s9 3 9 8" stroke="#d9a441" strokeWidth="1.5" strokeLinecap="round" />
      {/* Double arrows */}
      <path d="M46 33h18M58 28l6 5-6 5" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M64 47H46M52 42l-6 5 6 5" stroke="#d9a441" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Ícones ──────────────────────────────────────────────────────── */

function ArrowUpRightIcon({ className, size = 14 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
      className={className} aria-hidden>
      <path d="M7 17L17 7M7 7h10v10" />
    </svg>
  );
}

function StickerStatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" />
    </svg>
  );
}

function PackStatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="6" width="18" height="15" rx="2" />
      <path d="M3 10h18M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function AlbumStatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </svg>
  );
}

function MissionStatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m9 12 2 2 4-4" /><path d="M12 3a9 9 0 1 0 0 18A9 9 0 0 0 12 3Z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className="text-gb-green/40 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-gb-green" aria-hidden>
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
