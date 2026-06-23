import Image, { type ImageProps } from "next/image";

/**
 * Imagens enviadas ao Supabase Storage no painel admin.
 * `unoptimized` evita que o Next.js recompacte para WebP/AVIF com qualidade reduzida.
 */
export function AdminStorageImage(props: ImageProps) {
  return <Image {...props} unoptimized />;
}
