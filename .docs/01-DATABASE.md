# 🗄️ Database — Schema Completo (Supabase/PostgreSQL)

## Visão Geral das Tabelas

```
profiles              ← dados públicos do usuário
sticker_categories    ← categorias das figurinhas (ex: "Natura", "O Boticário")
rarities              ← comum, rara, super rara + % de tiragem
stickers              ← todas as figurinhas do programa
user_stickers         ← inventário de figurinhas por usuário
album_pages           ← páginas do álbum (vinculadas a categorias)
album_slots           ← slots de figurinha em cada página
user_album            ← quais slots o usuário já preencheu
packs                 ← pacotinhos disponíveis/abertos por usuário
pack_stickers         ← figurinhas dentro de cada pacotinho
quizzes               ← perguntas do quiz
quiz_options          ← alternativas por pergunta
user_quiz_answers     ← respostas diárias do usuário
missions              ← missões disponíveis
user_missions         ← progresso do usuário nas missões
trade_requests        ← solicitações de troca entre usuários
```

---

## DDL Completo

### profiles
```sql
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text unique,
  display_name  text,
  avatar_url    text,         -- foto original
  sticker_url   text,         -- figurinha gerada (sem fundo + moldura)
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
```

### sticker_categories
```sql
create table sticker_categories (
  id          serial primary key,
  name        text not null,          -- ex: "Natura", "O Boticário", "Eudora"
  description text,
  cover_image text,                   -- imagem de capa da categoria no álbum
  sort_order  int default 0,
  created_at  timestamptz default now()
);
```

### rarities
```sql
create table rarities (
  id              serial primary key,
  name            text not null,      -- "Comum", "Rara", "Super Rara"
  slug            text unique,        -- "common", "rare", "super_rare"
  drop_percentage numeric(5,2),       -- ex: 70.00, 25.00, 5.00
  color_hex       text,               -- cor do badge/brilho na UI
  animation_type  text                -- "none" | "glow" | "holographic"
);

-- Seed inicial
insert into rarities (name, slug, drop_percentage, color_hex, animation_type) values
  ('Comum',      'common',     70.00, '#A8A8A8', 'none'),
  ('Rara',       'rare',       25.00, '#FFD700', 'glow'),
  ('Super Rara', 'super_rare',  5.00, '#FF6EC7', 'holographic');
```

### stickers
```sql
create table stickers (
  id            serial primary key,
  name          text not null,
  description   text,
  image_url     text not null,        -- URL no Supabase Storage
  category_id   int references sticker_categories(id),
  rarity_id     int references rarities(id),
  is_user_type  boolean default false, -- true = slot da figurinha do usuário
  is_active     boolean default true,
  created_at    timestamptz default now()
);
```

### user_stickers (inventário)
```sql
create table user_stickers (
  id          bigserial primary key,
  user_id     uuid references profiles(id) on delete cascade,
  sticker_id  int references stickers(id),
  quantity    int default 1,          -- controla duplicatas
  obtained_at timestamptz default now(),
  unique (user_id, sticker_id)
);
```

### album_pages
```sql
create table album_pages (
  id            serial primary key,
  category_id   int references sticker_categories(id),
  page_number   int not null,
  title         text,
  background_url text,                -- imagem de fundo da página
  created_at    timestamptz default now()
);
```

### album_slots
```sql
create table album_slots (
  id          serial primary key,
  page_id     int references album_pages(id),
  sticker_id  int references stickers(id),  -- qual figurinha vai nesse slot
  slot_number int not null,
  position_x  numeric,              -- % posição X para layout livre
  position_y  numeric               -- % posição Y para layout livre
);
```

### user_album (figurinhas coladas)
```sql
create table user_album (
  id          bigserial primary key,
  user_id     uuid references profiles(id) on delete cascade,
  slot_id     int references album_slots(id),
  sticker_id  int references stickers(id),
  pasted_at   timestamptz default now(),
  unique (user_id, slot_id)
);
```

### packs
```sql
create table packs (
  id          bigserial primary key,
  user_id     uuid references profiles(id) on delete cascade,
  source      text,           -- "quiz" | "mission" | "admin_grant"
  source_ref  text,           -- id do quiz ou missão que gerou
  opened_at   timestamptz,    -- null = ainda fechado
  created_at  timestamptz default now()
);
```

### pack_stickers
```sql
create table pack_stickers (
  id          bigserial primary key,
  pack_id     bigint references packs(id) on delete cascade,
  sticker_id  int references stickers(id),
  position    int            -- 1 a 5, ordem de revelação
);
```

### quizzes
```sql
create table quizzes (
  id          serial primary key,
  question    text not null,
  image_url   text,           -- imagem opcional na pergunta
  points      int default 1,  -- quantos pacotinhos ganha ao acertar
  is_active   boolean default true,
  valid_date  date,           -- null = pode ser usado qualquer dia
  created_at  timestamptz default now()
);
```

### quiz_options
```sql
create table quiz_options (
  id          serial primary key,
  quiz_id     int references quizzes(id) on delete cascade,
  text        text not null,
  is_correct  boolean default false
);
```

### user_quiz_answers
```sql
create table user_quiz_answers (
  id          bigserial primary key,
  user_id     uuid references profiles(id) on delete cascade,
  quiz_id     int references quizzes(id),
  option_id   int references quiz_options(id),
  is_correct  boolean,
  answered_at timestamptz default now(),
  unique (user_id, quiz_id)   -- 1 resposta por quiz por usuário
);
```

### missions
```sql
create table missions (
  id            serial primary key,
  title         text not null,
  description   text,
  type          text,         -- "complete_album_page" | "trade_count" | "quiz_streak" | "custom"
  target_value  int,          -- meta numérica (ex: completar 1 página)
  reward_packs  int default 1,
  image_url     text,
  is_active     boolean default true,
  expires_at    timestamptz,
  created_at    timestamptz default now()
);
```

### user_missions
```sql
create table user_missions (
  id            bigserial primary key,
  user_id       uuid references profiles(id) on delete cascade,
  mission_id    int references missions(id),
  progress      int default 0,
  completed_at  timestamptz,
  reward_claimed boolean default false,
  unique (user_id, mission_id)
);
```

### trade_requests
```sql
create table trade_requests (
  id                  bigserial primary key,
  requester_id        uuid references profiles(id),
  receiver_id         uuid references profiles(id),
  offered_sticker_id  int references stickers(id),
  requested_sticker_id int references stickers(id),
  status              text default 'pending',  -- "pending" | "accepted" | "rejected" | "cancelled"
  message             text,
  created_at          timestamptz default now(),
  resolved_at         timestamptz
);
```

---

## Row Level Security (RLS)

```sql
-- Habilitar RLS em todas as tabelas de usuário
alter table profiles         enable row level security;
alter table user_stickers    enable row level security;
alter table user_album       enable row level security;
alter table packs            enable row level security;
alter table pack_stickers    enable row level security;
alter table user_quiz_answers enable row level security;
alter table user_missions    enable row level security;
alter table trade_requests   enable row level security;

-- profiles: usuário lê/edita o próprio, todos podem ver (para trocas)
create policy "profiles_read_all"   on profiles for select using (true);
create policy "profiles_edit_own"   on profiles for update using (auth.uid() = id);

-- user_stickers: só o dono acessa
create policy "stickers_own" on user_stickers
  using (auth.uid() = user_id);

-- user_album: só o dono
create policy "album_own" on user_album
  using (auth.uid() = user_id);

-- packs: só o dono
create policy "packs_own" on packs
  using (auth.uid() = user_id);

-- trade_requests: requester e receiver podem ver
create policy "trade_read" on trade_requests for select
  using (auth.uid() = requester_id or auth.uid() = receiver_id);

create policy "trade_create" on trade_requests for insert
  with check (auth.uid() = requester_id);

create policy "trade_update" on trade_requests for update
  using (auth.uid() = receiver_id or auth.uid() = requester_id);
```

---

## Índices Recomendados

```sql
create index idx_user_stickers_user    on user_stickers(user_id);
create index idx_user_album_user       on user_album(user_id);
create index idx_packs_user            on packs(user_id);
create index idx_packs_opened          on packs(user_id, opened_at);
create index idx_trades_requester      on trade_requests(requester_id, status);
create index idx_trades_receiver       on trade_requests(receiver_id, status);
create index idx_quiz_answers_user     on user_quiz_answers(user_id, quiz_id);
create index idx_stickers_category     on stickers(category_id, rarity_id);
```

---

## Notas

- O campo `quantity` em `user_stickers` controla duplicatas. Quando `quantity >= 2`, a figurinha pode ser oferecida para troca.
- `pack_stickers` é gerado no momento em que o pacotinho é criado (servidor), não na abertura, garantindo que as figurinhas já estão definidas antes do usuário "rasgar" o pacote.
- A tabela `album_slots` define a posição de cada figurinha no layout da página, permitindo ao admin criar layouts personalizados sem código.
