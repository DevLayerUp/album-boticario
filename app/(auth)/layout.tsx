export const metadata = {
  title: {
    default: "Entrar — Álbum GB",
    template: "%s · Álbum Grupo Boticário",
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main
      className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-12"
      id="main-content"
    >
      {children}
    </main>
  );
}
