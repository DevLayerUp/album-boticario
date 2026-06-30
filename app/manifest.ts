import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Álbum de Figurinhas — Fãs por Natureza",
    short_name: "Fãs por Natureza",
    description:
      "O maior fandom da nossa biodiversidade! Abra pacotes diários, troque figurinhas repetidas e complete seu álbum.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f7f3ec",
    theme_color: "#0d6632",
    orientation: "portrait",
    icons: [
      {
        src: "/images/favicon.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/favicon.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["games", "entertainment"],
    lang: "pt-BR",
  };
}
