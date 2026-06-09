import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Álbum de Figurinhas — Grupo Boticário",
    short_name: "Álbum GB",
    description:
      "Crie sua figurinha personalizada, abra pacotinhos e complete o álbum digital do Grupo Boticário.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f7f3ec",
    theme_color: "#063d2b",
    orientation: "portrait",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
    categories: ["games", "entertainment"],
    lang: "pt-BR",
  };
}
