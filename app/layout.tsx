import type { Metadata, Viewport } from "next";
import { Barlow } from "next/font/google";
import Script from "next/script";
import { buildRootMetadata, fetchSeoSettings } from "@/lib/seo-metadata";
import "./globals.css";

const barlow = Barlow({
  subsets: ["latin"],
  variable: "--font-barlow",
  display: "swap",
  weight: ["400", "500", "700", "800"],
});

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "GTM-MXPKJ4B2";

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
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}

        {/* Google Tag Manager */}
        <Script id="gtm-base" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
        {/* End Google Tag Manager */}

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
