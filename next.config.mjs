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
      // CSP — allow Supabase, Google Fonts and self
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          // blob: — modelo ONNX do imgly (ArrayBuffer, não import dinâmico)
          // googletagmanager — Google Tag Manager / GA4
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob: https://www.googletagmanager.com https://*.googletagmanager.com",
          "worker-src 'self' blob:",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com",
          "img-src 'self' data: blob: https://*.supabase.co https://api.remove.bg https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.g.doubleclick.net",
          "media-src 'self' blob: https://*.supabase.co",
          "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.remove.bg https://staticimgly.com https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.g.doubleclick.net",
          "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://www.googletagmanager.com https://*.doubleclick.net",
          "frame-ancestors 'self'",
          "base-uri 'self'",
          "form-action 'self'",
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
