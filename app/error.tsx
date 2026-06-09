"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to monitoring service in production
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          background: "#f7f3ec",
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          minHeight: "100dvh",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "24px",
          padding: "16px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "20px",
            background: "#063d2b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            stroke="#d9a441"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M20 12v10M20 28h.01" />
            <path d="M10 36H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4h24a4 4 0 0 1 4 4v24a4 4 0 0 1-4 4H22" />
          </svg>
        </div>
        <div>
          <p style={{ fontSize: "32px", fontWeight: 700, color: "#063d2b", margin: "0 0 8px" }}>
            Algo deu errado
          </p>
          <p style={{ color: "#4a5751", maxWidth: "360px" }}>
            Ocorreu um erro inesperado. Tente novamente ou entre em contato com o suporte.
          </p>
        </div>
        <button
          onClick={reset}
          style={{
            background: "#00a859",
            color: "#fff",
            border: "none",
            borderRadius: "9999px",
            padding: "12px 28px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Tentar novamente
        </button>
      </body>
    </html>
  );
}
