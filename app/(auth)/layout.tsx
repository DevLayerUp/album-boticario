import { AuthBackground } from "@/components/auth/auth-background";

export const metadata = {
  title: {
    default: "Entrar — Álbum Fãs por Natureza",
    template: "%s · Álbum Fãs por Natureza",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthBackground>{children}</AuthBackground>;
}
