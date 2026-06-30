-- Repara user_album com sticker_id nulo (ex.: ON DELETE SET NULL na figurinha antiga).
-- O álbum usa slot_id para exibir colagem; o estoque dependia só de sticker_id.

-- 1. Preencher sticker_id a partir do slot do álbum
update public.user_album ua
set sticker_id = als.sticker_id
from public.album_slots als
where ua.slot_id = als.id
  and ua.sticker_id is null
  and als.sticker_id is not null;

-- 2. Garantir sticker_id em novas colagens / quando FK zera o campo
create or replace function public.user_album_fill_sticker_id()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.sticker_id is null then
    select als.sticker_id
    into new.sticker_id
    from public.album_slots als
    where als.id = new.slot_id;
  end if;

  return new;
end;
$$;

drop trigger if exists user_album_fill_sticker_id on public.user_album;

create trigger user_album_fill_sticker_id
  before insert or update of sticker_id, slot_id
  on public.user_album
  for each row
  execute function public.user_album_fill_sticker_id();
