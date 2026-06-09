import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Álbum de Figurinhas — Grupo Boticário";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#063d2b",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "60px 80px",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Left: text */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "640px" }}>
          <div
            style={{
              fontSize: "14px",
              fontWeight: 700,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "#00a859",
            }}
          >
            Grupo Boticário
          </div>
          <div
            style={{
              fontSize: "64px",
              fontWeight: 700,
              lineHeight: 1.1,
              color: "#ffffff",
            }}
          >
            Álbum de Figurinhas
          </div>
          <div style={{ fontSize: "22px", color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
            Crie sua figurinha personalizada, abra pacotinhos e complete a coleção.
          </div>
        </div>

        {/* Right: decorative sticker card */}
        <div
          style={{
            width: "240px",
            height: "320px",
            borderRadius: "20px",
            border: "2px solid rgba(217,164,65,0.5)",
            background: "rgba(0,168,89,0.12)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
          }}
        >
          {/* Silhouette */}
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "rgba(0,168,89,0.3)",
            }}
          />
          <div
            style={{
              width: "120px",
              height: "12px",
              borderRadius: "6px",
              background: "rgba(0,168,89,0.25)",
            }}
          />
          <div
            style={{
              width: "90px",
              height: "10px",
              borderRadius: "5px",
              background: "rgba(0,168,89,0.15)",
            }}
          />
          {/* Gold star */}
          <div style={{ fontSize: "28px", color: "#d9a441", marginTop: "8px" }}>★</div>
        </div>

        {/* Background circles */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-80px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "-30px",
            right: "-30px",
            width: "240px",
            height: "240px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
