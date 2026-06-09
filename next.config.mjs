/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["sharp"],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },

  // ── Security headers ──────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent click-jacking
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Prevent MIME-type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Control referrer info
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Disable browser features not in use
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          // CSP — allow Supabase, Google Fonts and self
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval needed by Next.js dev
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.supabase.co https://api.remove.bg",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.remove.bg",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
