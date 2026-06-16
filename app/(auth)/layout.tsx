import { AuthBackground } from "@/components/auth/auth-background";

export const metadata = {
  title: {
    default: "Entrar — Álbum Fãs da Natureza",
    template: "%s · Álbum Fãs da Natureza",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthBackground>{children}</AuthBackground>;
}
