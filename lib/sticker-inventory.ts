/**
 * Cópias disponíveis para troca (além da que permanece no álbum).
 *
 * Modelo atual: `user_stickers.quantity` não diminui ao colar — repetida = quantity > 1.
 * Legado: colar decrementava quantity; quem colou com 2 cópias ficou com quantity=1 + colada.
 * Nesse caso, packAcquired >= 2 indica que ainda há 1 repetida em estoque.
 */
export function tradeableSpareCount(
  quantity: number,
  isPasted: boolean,
  packAcquired = 0,
): number {
  if (quantity > 1) return quantity - 1;
  if (quantity === 1 && isPasted && packAcquired >= 2) return 1;
  return 0;
}

export function hasTradeableSpare(
  quantity: number,
  isPasted: boolean,
  packAcquired = 0,
): boolean {
  return tradeableSpareCount(quantity, isPasted, packAcquired) > 0;
}

/** Total de cópias que o usuário possui (álbum + estoque). */
export function totalOwnedCopies(
  quantity: number,
  isPasted: boolean,
  packAcquired = 0,
): number {
  if (quantity > 1) return quantity;
  if (isPasted) return 1 + tradeableSpareCount(quantity, isPasted, packAcquired);
  return quantity;
}
