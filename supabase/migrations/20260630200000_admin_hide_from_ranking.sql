-- Garante que perfis admin não apareçam no ranking (complementa filtro em lib/ranking.ts)

update public.profiles p
set show_in_ranking = false
from auth.users u
where p.id = u.id
  and (
    coalesce(u.raw_app_meta_data->>'role', '') = 'admin'
    or coalesce(u.raw_user_meta_data->>'role', '') = 'admin'
  );
