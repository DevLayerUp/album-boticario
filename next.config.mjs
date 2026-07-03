/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["sharp"],

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      sharp$: false,
      "onnxruntime-node$": false,
    };
    return config;
  },

  // Middleware clona o body da request; padrão 10MB trunca GIFs grandes no upload admin.
  experimental: {
    middlewareClientMaxBodySize: "40mb",
  },

  images: {
    qualities: [75, 90, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },

  // ── Security headers ──────────────────────────────────────────────────
  async headers() {
    const gtmAndGoogleAdsScripts = [
      "https://www.googletagmanager.com",
      "https://*.googletagmanager.com",
      "https://googleads.g.doubleclick.net",
      "https://www.googleadservices.com",
    ].join(" ");

    const adPixelScripts = [
      "https://connect.facebook.net",
      "https://snap.licdn.com",
      "https://analytics.tiktok.com",
    ].join(" ");

    const googleMarketingConnect = [
      "https://www.googletagmanager.com",
      "https://www.google-analytics.com",
      "https://*.google-analytics.com",
      "https://*.analytics.google.com",
      "https://*.g.doubleclick.net",
      "https://googleads.g.doubleclick.net",
      "https://ad.doubleclick.net",
      "https://www.googleadservices.com",
      "https://www.google.com",
      "https://www.google.com.br",
      "https://*.google.com.br",
    ].join(" ");

    const adPixelConnect = [
      "https://connect.facebook.net",
      "https://www.facebook.com",
      "https://px.ads.linkedin.com",
      "https://snap.licdn.com",
      "https://analytics.tiktok.com",
      "https://analytics-ipv6.tiktokw.us",
      "https://*.tiktokw.us",
      // Meta Pixel — gateways dinâmicos (Cloud Run / AWS)
      "https://*.run.app",
      "https://*.ecs.us-east-1.on.aws",
    ].join(" ");

    const googleMarketingImg = [
      "https://www.googletagmanager.com",
      "https://www.google-analytics.com",
      "https://*.google-analytics.com",
      "https://*.g.doubleclick.net",
      "https://googleads.g.doubleclick.net",
      "https://ad.doubleclick.net",
      "https://www.googleadservices.com",
      "https://www.google.com",
      "https://www.google.com.br",
      "https://*.google.com.br",
    ].join(" ");

    const adPixelImg = [
      "https://px.ads.linkedin.com",
      "https://www.facebook.com",
    ].join(" ");

    const metaFrameAndForm = [
      "https://www.facebook.com",
      "https://*.facebook.com",
    ].join(" ");

    const securityHeaders = [
      // Prevent click-jacking
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      // Prevent MIME-type sniffing
      { key: "X-Content-Type-Options", value: "nosniff" },
      // Control referrer info
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      // Disable browser features not in use
      {
        key: "Permissions-Policy",
        value: "camera=(self), microphone=(), geolocation=(), interest-cohort=()",
      },
      // CSP — Supabase, Google Fonts, GTM/GA/Google Ads e pixels do container GTM
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          // blob: — modelo ONNX do imgly (ArrayBuffer, não import dinâmico)
          `script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob: ${gtmAndGoogleAdsScripts} ${adPixelScripts}`,
          "worker-src 'self' blob:",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com",
          `img-src 'self' data: blob: https://*.supabase.co https://api.remove.bg ${googleMarketingImg} ${adPixelImg}`,
          "media-src 'self' blob: https://*.supabase.co",
          `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.remove.bg https://staticimgly.com ${googleMarketingConnect} ${adPixelConnect}`,
          `frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://www.googletagmanager.com https://*.doubleclick.net ${metaFrameAndForm}`,
          "frame-ancestors 'self'",
          "base-uri 'self'",
          `form-action 'self' ${metaFrameAndForm}`,
        ].join("; "),
      },
    ];

    return [
      {
        source: "/.well-known/bimi/certificate.pem",
        headers: [
          {
            key: "Content-Type",
            value: "application/pem-certificate-chain",
          },
          { key: "Cache-Control", value: "public, max-age=86400" },
          ...securityHeaders,
        ],
      },
      {
        source: "/images/favicon.svg",
        headers: [
          { key: "Content-Type", value: "image/svg+xml" },
          {
            key: "Cache-Control",
            value: "public, max-age=86400, immutable",
          },
          ...securityHeaders,
        ],
      },
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
