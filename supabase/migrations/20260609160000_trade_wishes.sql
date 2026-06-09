-- =============================================================
-- Migration — trade_wishes
-- Pedidos públicos de figurinhas que um usuário busca para trocar
-- =============================================================

create table if not exists public.trade_wishes (
  id          bigserial primary key,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  sticker_id  int  not null references public.stickers(id) on delete cascade,
  status      text not null default 'open'
              check (status in ('open', 'fulfilled', 'cancelled')),
  created_at  timestamptz not null default now()
);

-- Apenas um pedido aberto por figurinha por usuário
create unique index if not exists trade_wishes_open_unique
  on public.trade_wishes (user_id, sticker_id)
  where status = 'open';

alter table public.trade_wishes enable row level security;

drop policy if exists "wishes_read"   on public.trade_wishes;
drop policy if exists "wishes_create" on public.trade_wishes;
drop policy if exists "wishes_update" on public.trade_wishes;

-- Qualquer autenticado pode ver todos os pedidos abertos
create policy "wishes_read"
  on public.trade_wishes for select
  to authenticated
  using (true);

-- Usuário só cria seus próprios pedidos
create policy "wishes_create"
  on public.trade_wishes for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- Usuário só atualiza seus próprios pedidos (para cancelar/fulfil)
create policy "wishes_update"
  on public.trade_wishes for update
  to authenticated
  using ((select auth.uid()) = user_id);
