-- Permite que usuários autenticados vejam o inventário alheio para montar trocas.
-- A política "user_stickers_own" continua restringindo INSERT/UPDATE/DELETE ao dono.

drop policy if exists "user_stickers_trade_read" on public.user_stickers;
create policy "user_stickers_trade_read"
  on public.user_stickers for select
  to authenticated
  using (true);
