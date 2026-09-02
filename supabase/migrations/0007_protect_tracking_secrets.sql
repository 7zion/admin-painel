-- A linha 'tracking' em settings guarda o token da Meta Conversions API
-- (settings.tracking.data->'meta-api'->>'head'), um segredo real — diferente das
-- outras linhas de settings (site, contact, widgets, ai_agent, marketingModule),
-- que só espelham conteúdo que já aparece na página pública mesmo. Com
-- "using (true)" no select, qualquer um com a anon key do projeto (pública no
-- bundle do site) conseguia ler esse token direto pela REST API do Supabase,
-- sem passar pelo nosso app. Restringe a leitura de 'tracking' a staff.
--
-- Os scripts de GTM/GA/Meta Pixel/GSC continuam sendo servidos normalmente no
-- HTML público — isso é feito por src/lib/cms-server.ts (fetchTrackingSettings)
-- usando a Service Role Key no servidor, que ignora RLS, e removendo o campo
-- meta-api antes de devolver o resto pro loader/hidratação do client.

drop policy if exists "settings_select" on public.settings;

create policy "settings_select" on public.settings for select
  using (id <> 'tracking' or public.is_editor_or_admin());
