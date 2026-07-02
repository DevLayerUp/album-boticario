import {
  ArrowLeftRight,
  Calendar,
  Package,
  Star,
} from "lucide-react";
import {
  formatMemberSince,
  formatShortDisplayName,
  resolveProfileAvatar,
  type ProfilePageData,
} from "@/lib/profile";
import { PerfilHeroAvatar } from "./perfil-hero-avatar";

interface PerfilStatCardProps {
  icon: typeof Package;
  label: string;
  value: number;
}

function PerfilStatCard({ icon: Icon, label, value }: PerfilStatCardProps) {
  return (
    <div className="flex min-w-0 flex-col justify-between rounded-block bg-verde-100 p-3 sm:min-h-[120px] sm:p-4 2xl:min-h-[145px] 2xl:min-w-[257px] 2xl:flex-1">
      <div className="flex items-start gap-2 sm:gap-3 2xl:gap-4">
        <Icon
          className="size-5 shrink-0 text-verde-escuro-500 sm:size-6 2xl:size-7"
          aria-hidden
        />
        <p className="text-[10px] font-medium uppercase leading-tight text-verde-escuro-500 sm:text-xs md:text-sm 2xl:text-xl">
          {label}
        </p>
      </div>
      <p className="mt-2 font-display text-xl font-bold leading-none text-verde-escuro-500 sm:mt-3 sm:text-3xl 2xl:text-5xl">
        {value.toLocaleString("pt-BR")}
      </p>
    </div>
  );
}

interface PerfilHeroProps {
  data: ProfilePageData;
}

export function PerfilHero({ data }: PerfilHeroProps) {
  const { profile, stats } = data;
  const { score_breakdown: breakdown } = stats;
  const displayName =
    profile.display_name?.trim() ||
    profile.email.split("@")[0] ||
    "Colecionador";
  const shortName = formatShortDisplayName(displayName);
  const avatar = resolveProfileAvatar(profile);
  const memberSince = formatMemberSince(profile.created_at);

  return (
    <section className="@container/hero relative w-full overflow-hidden bg-verde-500 2xl:min-h-[428px]">
      <div className="relative z-10 mx-auto flex w-full max-w-[1680px] flex-col gap-5 px-6 py-6 sm:gap-6 sm:py-8 lg:gap-7 lg:py-10 2xl:flex-row 2xl:items-end 2xl:gap-10 2xl:px-[120px] 2xl:pb-12 2xl:pt-16">
        <div className="flex min-w-0 items-center gap-4 sm:items-end sm:gap-5 md:gap-6 2xl:flex-1">
          <PerfilHeroAvatar
            userId={profile.id}
            avatarSrc={avatar?.src ?? null}
            avatarVariant={avatar?.variant ?? null}
            stickerUrl={profile.sticker_url}
            displayName={displayName}
            fallbackInitial={displayName.charAt(0).toUpperCase()}
          />

          <div className="min-w-0 flex-1 space-y-1 sm:space-y-1.5 sm:pb-0.5 2xl:max-w-md">
            <p className="text-[10px] uppercase tracking-[0.12em] text-verde-100 sm:text-xs 2xl:text-sm">
              MEU PERFIL
            </p>
            <h1
              className="font-display text-xl font-bold leading-tight text-white sm:text-2xl md:text-3xl lg:text-[32px] 2xl:text-[40px]"
              title={shortName}
            >
              {shortName}
            </h1>
            <p
              className="max-w-full break-all text-[10px] uppercase tracking-[0.04em] text-verde-100 sm:text-xs 2xl:text-sm"
              title={profile.email}
            >
              {profile.email}
            </p>
            <div className="flex items-start gap-1.5 pt-0.5 text-verde-100 sm:gap-2 sm:pt-1">
              <Calendar className="mt-0.5 size-3 shrink-0 sm:size-3.5" aria-hidden />
              <p className="text-[10px] leading-snug sm:text-xs 2xl:text-sm">
                Membro desde {memberSince}
              </p>
            </div>
          </div>
        </div>

        <div className="flex w-full min-w-0 flex-col gap-2 sm:gap-2.5 2xl:w-auto 2xl:shrink-0">
          <div className="grid grid-cols-3 gap-2 sm:gap-3 2xl:flex 2xl:gap-2.5">
            <PerfilStatCard
              icon={Package}
              label="Pacotinhos abertos"
              value={stats.packs_opened}
            />
            <PerfilStatCard
              icon={ArrowLeftRight}
              label="Figurinhas"
              value={stats.stickers_count}
            />
            <PerfilStatCard icon={Star} label="Pontos no ranking" value={stats.score} />
          </div>

          <p className="text-[10px] leading-relaxed text-verde-100/90 sm:text-xs 2xl:text-sm">
            Álbum {breakdown.album_score.toLocaleString("pt-BR")} · Missões{" "}
            {breakdown.mission_bonus.toLocaleString("pt-BR")} · Trocas{" "}
            {breakdown.trade_bonus.toLocaleString("pt-BR")}
            {breakdown.efficiency_bonus > 0
              ? ` · Eficiência ${breakdown.efficiency_bonus.toLocaleString("pt-BR")}`
              : null}
            {breakdown.pack_penalty > 0
              ? ` · Pacotes −${breakdown.pack_penalty.toLocaleString("pt-BR")}`
              : null}
          </p>
        </div>
      </div>
    </section>
  );
}
