-- =============================================================
-- Migration 01 — Schema base (tabelas, seed de raridades, índices)
-- Álbum de Figurinhas — Grupo Boticário
-- =============================================================

-- Extensões úteis (uuid/criptografia já vêm habilitadas no Supabase,
-- mas garantimos idempotência)
create extension if not exists pgcrypto;

-- -------------------------------------------------------------
-- profiles — dados públicos do usuário (1:1 com auth.users)
-- -------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text unique,
  display_name  text,
  avatar_url    text,         -- foto original enviada pelo usuário
  sticker_url   text,         -- figurinha gerada (sem fundo + moldura)
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- -------------------------------------------------------------
-- sticker_categories — categorias do álbum
-- -------------------------------------------------------------
create table if not exists public.sticker_categories (
  id          serial primary key,
  name        text not null,          -- ex: "Natura", "O Boticário", "Eudora"
  description text,
  cover_image text,                   -- capa da categoria no álbum
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- -------------------------------------------------------------
-- rarities — raridades e percentual de tiragem
-- -------------------------------------------------------------
create table if not exists public.rarities (
  id              serial primary key,
  name            text not null,       -- "Comum", "Rara", "Super Rara"
  slug            text unique,         -- "common", "rare", "super_rare"
  drop_percentage numeric(5,2),        -- 70.00, 25.00, 5.00
  color_hex       text,                -- cor do badge/brilho na UI
  animation_type  text                 -- "none" | "glow" | "holographic"
);

-- -------------------------------------------------------------
-- stickers — todas as figurinhas do programa
-- -------------------------------------------------------------
create table if not exists public.stickers (
  id            serial primary key,
  name          text not null,
  description   text,
  image_url     text not null,         -- URL no Supabase Storage
  category_id   int references public.sticker_categories(id) on delete set null,
  rarity_id     int references public.rarities(id) on delete set null,
  is_user_type  boolean not null default false, -- true = slot da figurinha do usuário
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

-- -------------------------------------------------------------
-- user_stickers — inventário por usuário
-- -------------------------------------------------------------
create table if not exists public.user_stickers (
  id          bigserial primary key,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  sticker_id  int not null references public.stickers(id) on delete cascade,
  quantity    int not null default 1,  -- controla duplicatas
  obtained_at timestamptz not null default now(),
  unique (user_id, sticker_id)
);

-- -------------------------------------------------------------
-- album_pages — páginas do álbum (vinculadas a categorias)
-- -------------------------------------------------------------
create table if not exists public.album_pages (
  id             serial primary key,
  category_id    int references public.sticker_categories(id) on delete cascade,
  page_number    int not null,
  title          text,
  background_url text,                  -- imagem de fundo da página
  created_at     timestamptz not null default now()
);

-- -------------------------------------------------------------
-- album_slots — slots de figurinha em cada página
-- -------------------------------------------------------------
create table if not exists public.album_slots (
  id          serial primary key,
  page_id     int references public.album_pages(id) on delete cascade,
  sticker_id  int references public.stickers(id) on delete set null,
  slot_number int not null,
  position_x  numeric,                  -- % posição X para layout livre
  position_y  numeric                   -- % posição Y para layout livre
);

-- -------------------------------------------------------------
-- user_album — figurinhas coladas pelo usuário
-- -------------------------------------------------------------
create table if not exists public.user_album (
  id          bigserial primary key,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  slot_id     int not null references public.album_slots(id) on delete cascade,
  sticker_id  int references public.stickers(id) on delete set null,
  pasted_at   timestamptz not null default now(),
  unique (user_id, slot_id)
);

-- -------------------------------------------------------------
-- packs — pacotinhos por usuário
-- -------------------------------------------------------------
create table if not exists public.packs (
  id          bigserial primary key,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  source      text,            -- "quiz" | "mission" | "admin_grant"
  source_ref  text,            -- id do quiz ou missão que gerou
  opened_at   timestamptz,     -- null = ainda fechado
  created_at  timestamptz not null default now()
);

-- -------------------------------------------------------------
-- pack_stickers — figurinhas dentro de cada pacotinho
-- -------------------------------------------------------------
create table if not exists public.pack_stickers (
  id          bigserial primary key,
  pack_id     bigint not null references public.packs(id) on delete cascade,
  sticker_id  int not null references public.stickers(id) on delete cascade,
  position    int              -- 1 a 5, ordem de revelação
);

-- -------------------------------------------------------------
-- quizzes — perguntas do quiz
-- -------------------------------------------------------------
create table if not exists public.quizzes (
  id          serial primary key,
  question    text not null,
  image_url   text,            -- imagem opcional na pergunta
  points      int not null default 1, -- quantos pacotinhos ganha ao acertar
  is_active   boolean not null default true,
  valid_date  date,            -- null = pode ser usado qualquer dia
  created_at  timestamptz not null default now()
);

-- -------------------------------------------------------------
-- quiz_options — alternativas por pergunta
-- -------------------------------------------------------------
create table if not exists public.quiz_options (
  id          serial primary key,
  quiz_id     int not null references public.quizzes(id) on delete cascade,
  text        text not null,
  is_correct  boolean not null default false
);

-- -------------------------------------------------------------
-- user_quiz_answers — respostas diárias do usuário
-- -------------------------------------------------------------
create table if not exists public.user_quiz_answers (
  id          bigserial primary key,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  quiz_id     int not null references public.quizzes(id) on delete cascade,
  option_id   int references public.quiz_options(id) on delete set null,
  is_correct  boolean,
  answered_at timestamptz not null default now(),
  unique (user_id, quiz_id)    -- 1 resposta por quiz por usuário
);

-- -------------------------------------------------------------
-- missions — missões disponíveis
-- -------------------------------------------------------------
create table if not exists public.missions (
  id            serial primary key,
  title         text not null,
  description   text,
  type          text,          -- "complete_album_page" | "trade_count" | "quiz_streak" | "custom"
  target_value  int,           -- meta numérica
  reward_packs  int not null default 1,
  image_url     text,
  is_active     boolean not null default true,
  expires_at    timestamptz,
  created_at    timestamptz not null default now()
);

-- -------------------------------------------------------------
-- user_missions — progresso do usuário nas missões
-- -------------------------------------------------------------
create table if not exists public.user_missions (
  id             bigserial primary key,
  user_id        uuid not null references public.profiles(id) on delete cascade,
  mission_id     int not null references public.missions(id) on delete cascade,
  progress       int not null default 0,
  completed_at   timestamptz,
  reward_claimed boolean not null default false,
  unique (user_id, mission_id)
);

-- -------------------------------------------------------------
-- trade_requests — solicitações de troca entre usuários
-- -------------------------------------------------------------
create table if not exists public.trade_requests (
  id                   bigserial primary key,
  requester_id         uuid references public.profiles(id) on delete cascade,
  receiver_id          uuid references public.profiles(id) on delete cascade,
  offered_sticker_id   int references public.stickers(id) on delete set null,
  requested_sticker_id int references public.stickers(id) on delete set null,
  status               text not null default 'pending', -- pending | accepted | rejected | cancelled
  message              text,
  created_at           timestamptz not null default now(),
  resolved_at          timestamptz
);

-- =============================================================
-- Seed inicial — raridades
-- =============================================================
insert into public.rarities (name, slug, drop_percentage, color_hex, animation_type)
values
  ('Comum',      'common',     70.00, '#A8A8A8', 'none'),
  ('Rara',       'rare',       25.00, '#FFD700', 'glow'),
  ('Super Rara', 'super_rare',  5.00, '#FF6EC7', 'holographic')
on conflict (slug) do nothing;

-- =============================================================
-- Índices recomendados
-- =============================================================
create index if not exists idx_user_stickers_user  on public.user_stickers(user_id);
create index if not exists idx_user_album_user      on public.user_album(user_id);
create index if not exists idx_packs_user           on public.packs(user_id);
create index if not exists idx_packs_opened         on public.packs(user_id, opened_at);
create index if not exists idx_pack_stickers_pack   on public.pack_stickers(pack_id);
create index if not exists idx_trades_requester     on public.trade_requests(requester_id, status);
create index if not exists idx_trades_receiver      on public.trade_requests(receiver_id, status);
create index if not exists idx_quiz_answers_user    on public.user_quiz_answers(user_id, quiz_id);
create index if not exists idx_stickers_category    on public.stickers(category_id, rarity_id);
create index if not exists idx_album_slots_page     on public.album_slots(page_id);
create index if not exists idx_album_pages_category on public.album_pages(category_id);
create index if not exists idx_quiz_options_quiz    on public.quiz_options(quiz_id);
create index if not exists idx_user_missions_user   on public.user_missions(user_id);
