import type { ProfilePageData } from "@/lib/profile";

export type PerfilTab = "personal" | "security" | "notifications" | "privacy";

export interface PerfilClientProps {
  initialData: ProfilePageData;
}

export const PERFIL_TABS: {
  id: PerfilTab;
  label: string;
}[] = [
  { id: "personal", label: "Dados pessoais" },
  { id: "security", label: "Conta e segurança" },
  { id: "notifications", label: "Notificações" },
  { id: "privacy", label: "Privacidade" },
];

export const LANGUAGE_OPTIONS = [
  { value: "pt-BR", label: "Português (Brasil)" },
  { value: "en-US", label: "English (US)" },
  { value: "es-ES", label: "Español" },
] as const;

export const TIMEZONE_OPTIONS = [
  { value: "America/Sao_Paulo", label: "(GMT-3) São Paulo" },
  { value: "America/Manaus", label: "(GMT-4) Manaus" },
  { value: "America/Noronha", label: "(GMT-2) Fernando de Noronha" },
] as const;
