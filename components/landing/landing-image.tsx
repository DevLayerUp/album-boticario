import Image, { type ImageProps } from "next/image";

/**
 * Imagens da landing vêm do Supabase Storage no formato enviado pelo admin.
 * `unoptimized` evita recompressão para WebP/AVIF pelo otimizador do Next.js.
 */
export function LandingImage(props: ImageProps) {
  return <Image {...props} unoptimized />;
}
