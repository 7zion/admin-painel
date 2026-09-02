-- O widget de chat cria sessões anônimas do Supabase (auth.signInAnonymously) para
-- qualquer visitante do site. A policy de bootstrap do primeiro admin em "users_insert"
-- só checava "not has_admin_registered()", então, se essa flag fosse zerada por engano,
-- um visitante anônimo poderia se auto-promover a admin. Exigimos aqui que o usuário
-- que se autopromove no bootstrap não seja uma sessão anônima.

drop policy if exists "users_insert" on public.users;

create policy "users_insert" on public.users for insert
  with check (
    (
      not public.has_admin_registered()
      and id = auth.uid()
      and role = 'admin'
      and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
    )
    or public.is_admin()
  );
