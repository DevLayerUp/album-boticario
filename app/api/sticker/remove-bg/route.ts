import { NextResponse } from "next/server";

/**
 * Legado — remoção de fundo agora roda no navegador (@imgly/background-removal).
 * Mantido para evitar 404 em clientes antigos.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "A remoção de fundo agora é feita no seu navegador. Atualize a página e tente novamente.",
      code: "client_side_only",
      fallback: true,
    },
    { status: 410 },
  );
}
