import type { Metadata, Viewport } from "next";
import { Barlow } from "next/font/google";
import "./globals.css";

const barlow = Barlow({
  subsets: ["latin"],
  variable: "--font-barlow",
  display: "swap",
  weight: ["400", "500", "700", "800"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "Álbum de Figurinhas — Grupo Boticário",
    template: "%s · Álbum Grupo Boticário",
  },
  description:
    "Crie sua figurinha personalizada, abra pacotinhos e complete o álbum digital do Grupo Boticário.",

  openGraph: {
    title: "Álbum de Figurinhas — Grupo Boticário",
    description:
      "Crie sua figurinha, abra pacotinhos e complete a coleção.",
    type: "website",
    locale: "pt_BR",
    siteName: "Álbum GB",
    url: siteUrl,
  },

  twitter: {
    card: "summary_large_image",
    title: "Álbum de Figurinhas — Grupo Boticário",
    description: "Crie sua figurinha, abra pacotinhos e complete a coleção.",
  },

  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },

  // Skip indexing admin / api routes
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  themeColor: "#0d6632",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // needed for safe-area-inset on iOS
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={barlow.variable}>
      <body id="root">
        {/* Skip-to-content link for keyboard users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-gb-green focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
