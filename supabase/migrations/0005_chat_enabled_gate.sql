-- O toggle "Chat habilitado" (settings.widgets.chatEnabled) era só uma flag de UI:
-- o componente ChatWidget escondia o botão flutuante quando desativado, mas nada
-- impedia alguém de chamar a API pública do Supabase diretamente (signInAnonymously
-- + insert em chat_sessions/chat_messages usando a anon key, que é pública no bundle
-- do site) e continuar mandando spam mesmo com o chat "desativado" no painel.
--
-- Passamos a checar essa flag também na RLS, então a inserção de sessões e
-- mensagens de visitante fica bloqueada no banco quando o chat está desativado,
-- independente de como a requisição chegou até o Supabase.

create or replace function public.is_chat_enabled()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select (data->>'chatEnabled')::boolean from public.settings where id = 'widgets'),
    true
  );
$$;

drop policy if exists "chat_sessions_insert" on public.chat_sessions;
create policy "chat_sessions_insert" on public.chat_sessions for insert
  with check (
    public.is_editor_or_admin()
    or (public.is_chat_enabled() and auth.uid() = id)
  );

drop policy if exists "chat_messages_insert" on public.chat_messages;
create policy "chat_messages_insert" on public.chat_messages for insert
  with check (
    public.is_editor_or_admin()
    or (
      public.is_chat_enabled()
      and exists (select 1 from public.chat_sessions cs where cs.id = chat_messages.session_id and cs.id = auth.uid())
    )
  );
