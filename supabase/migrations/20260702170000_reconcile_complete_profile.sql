-- Reconcilia a missão "Completar perfil" após passar a exigir Cidade e Estado.
-- Usuários com qualquer dado obrigatório faltando voltam a INCOMPLETO e podem
-- resgatar o pacotinho novamente ao completar (reset de reward_claimed).
-- Critério de perfil completo (espelha isProfileComplete em lib/missions.ts):
--   display_name, bio, phone, city, state preenchidos + (avatar_url OU sticker_url).

update public.user_missions um
set completed_at = null,
    progress = 0,
    reward_claimed = false
from public.missions m,
     public.profiles p
where um.mission_id = m.id
  and m.title = 'Completar perfil'
  and p.id = um.user_id
  and (
    coalesce(trim(p.display_name), '') = ''
    or coalesce(trim(p.bio), '') = ''
    or coalesce(trim(p.phone), '') = ''
    or coalesce(trim(p.city), '') = ''
    or coalesce(trim(p.state), '') = ''
    or (p.avatar_url is null and p.sticker_url is null)
  );
