-- Hierarquia de administradores: o "super admin" é o primeiro admin já registrado
-- no projeto. Só ele pode alterar/remover outros admins; ninguém (nem outro admin)
-- pode alterar ou remover o super admin — só ele mesmo, via o próprio fluxo de
-- "Minha Senha". Admins comuns continuam podendo gerenciar editores livremente.

alter table public.users add column if not exists is_super_admin boolean not null default false;

-- Backfill: marca como super admin o admin mais antigo já cadastrado (se houver).
with first_admin as (
  select id from public.users where role = 'admin' order by created_at asc limit 1
)
update public.users set is_super_admin = true
where id in (select id from first_admin);

create or replace function public.is_super_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin' and is_super_admin = true
  );
$$;

-- Trava o campo is_super_admin contra qualquer UPDATE (mesmo via service role,
-- a menos que explicitamente desabilitada) — só deve ser definido pelo backfill
-- acima ou manualmente no banco, nunca pela aplicação.
create or replace function public.prevent_super_admin_flag_change()
returns trigger
language plpgsql
as $$
begin
  if NEW.is_super_admin is distinct from OLD.is_super_admin then
    raise exception 'is_super_admin não pode ser alterado por uma atualização comum.';
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_prevent_super_admin_flag_change on public.users;
create trigger trg_prevent_super_admin_flag_change
  before update on public.users
  for each row
  execute function public.prevent_super_admin_flag_change();

-- Reforça a hierarquia também na RLS (defesa em profundidade — a autorização
-- real de troca de senha/remoção do Supabase Auth acontece nas server functions
-- com Service Role Key, que já checam role/is_super_admin antes de agir).
drop policy if exists "users_update" on public.users;
create policy "users_update" on public.users for update
  using (
    public.is_admin()
    and not is_super_admin
    and (role = 'editor' or public.is_super_admin())
  );

drop policy if exists "users_delete" on public.users;
create policy "users_delete" on public.users for delete
  using (
    public.is_admin()
    and not is_super_admin
    and (role = 'editor' or public.is_super_admin())
  );
