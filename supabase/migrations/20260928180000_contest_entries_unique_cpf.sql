-- Garante uma inscrição por CPF/usuário mesmo se a tabela já existia sem o unique.

create unique index if not exists contest_entries_cpf_digits_key
  on public.contest_entries (cpf_digits);

create unique index if not exists contest_entries_user_id_key
  on public.contest_entries (user_id);
