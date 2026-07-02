const PAGE_SIZE = 1000;

/**
 * Busca todas as linhas de uma query PostgREST, contornando o limite padrão de 1.000.
 */
export async function fetchAllPages<T>(
  runQuery: (
    from: number,
    to: number,
  ) => PromiseLike<{
    data: T[] | null;
    error: { message: string } | null;
  }>,
): Promise<T[]> {
  const all: T[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await runQuery(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    if (!data?.length) break;
    all.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return all;
}
