import type { Metadata, Viewport } from "next";
import { Barlow } from "next/font/google";
import { buildRootMetadata, fetchSeoSettings } from "@/lib/seo-metadata";
import "./globals.css";

const barlow = Barlow({
  subsets: ["latin"],
  variable: "--font-barlow",
  display: "swap",
  weight: ["400", "500", "700", "800"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSeoSettings();
  return buildRootMetadata(settings);
}

export async function generateViewport(): Promise<Viewport> {
  const settings = await fetchSeoSettings();
  return {
    themeColor: settings.themeColor,
    colorScheme: "light",
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover", // needed for safe-area-inset on iOS
  };
}

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
