/**
 * Cópias disponíveis para troca além da reservada ao álbum.
 *
 * `user_stickers.quantity` é a fonte da verdade (colar não decrementa quantity).
 * Com quantity === 1, a única cópia fica reservada — não há repetida para trocar.
 */
export function tradeableSpareCount(quantity: number, isPasted: boolean): number {
  if (quantity <= 0) return 0;
  if (quantity > 1) return quantity - 1;
  // quantity === 1: única cópia (colada ou não) — não é repetida negociável.
  if (isPasted) return 0;
  return 0;
}

export function hasTradeableSpare(quantity: number, isPasted: boolean): boolean {
  return tradeableSpareCount(quantity, isPasted) > 0;
}

/** Total de cópias que o usuário possui no inventário. */
export function totalOwnedCopies(quantity: number): number {
  return Math.max(0, quantity);
}
