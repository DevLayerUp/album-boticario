export type FoundationSocialPlatform =
  | "youtube"
  | "linkedin"
  | "instagram"
  | "facebook"
  | "tiktok";

export interface FoundationSocialLink {
  platform: FoundationSocialPlatform;
  label: string;
  href: string;
}

/** Perfis oficiais da Fundação Grupo Boticário. */
export const FOUNDATION_SOCIAL_LINKS: FoundationSocialLink[] = [
  {
    platform: "youtube",
    label: "YouTube",
    href: "https://www.youtube.com/user/fundacaoboticario",
  },
  {
    platform: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/fundacaogrupoboticario/",
  },
  {
    platform: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/fundacaogrupoboticario/",
  },
  {
    platform: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/fundacaogrupoboticario",
  },
  {
    platform: "tiktok",
    label: "TikTok",
    href: "https://www.tiktok.com/@fundacaogrupoboticario",
  },
];
