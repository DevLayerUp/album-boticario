import { NextResponse } from "next/server";

/**
 * POST /api/pack/create
 * Descontinuado — pacotinhos são concedidos via quiz, missões ou painel admin.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "Endpoint descontinuado. Pacotinhos são concedidos via quiz, missões ou painel admin.",
    },
    { status: 403 },
  );
}
