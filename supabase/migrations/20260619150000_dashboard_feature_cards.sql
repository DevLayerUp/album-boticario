-- Imagens de fundo dos feature cards da dashboard (editáveis no admin)

insert into public.app_settings (key, value)
values ('dashboard_feature_cards', null)
on conflict (key) do nothing;
