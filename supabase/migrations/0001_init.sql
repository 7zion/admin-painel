-- Fase 1 da migração Firebase -> Supabase (Moraes Revestimento)
-- Schema completo (para todas as fases) + RLS espelhando firestore.rules.
-- Realtime habilitado por enquanto só em site_content e settings (Fase 1).

create extension if not exists pgcrypto;

-- =========================================================
-- TABELAS
-- =========================================================

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

create table if not exists public.site_content (
  id text primary key,
  content_value text not null default '',
  content_type text not null default 'text' check (content_type in ('text', 'image', 'html')),
  styles jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.settings (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.system_config (
  id text primary key,
  data jsonb not null default '{}'::jsonb
);

create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  display_title text,
  description text,
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  display_title text,
  description text,
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric,
  image_url text,
  gallery_urls text[] default '{}',
  category text,
  stock integer default 0,
  item_type text default 'product' check (item_type in ('product', 'service')),
  cta_type text check (cta_type in ('whatsapp', 'form', 'custom_link')),
  cta_value text,
  tag text,
  tamanho text,
  unidade text,
  aplicacao text,
  estilo text,
  colecao text,
  acabamento text,
  tonalidade text,
  published boolean default true,
  is_featured boolean default false,
  is_products_featured boolean default false,
  seo_title text,
  seo_description text,
  seo_keywords text,
  focus_keyword text,
  canonical_url text,
  meta_robots text,
  og_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text,
  content text,
  category text,
  image_url text,
  author text,
  is_published boolean default true,
  published boolean default true,
  is_featured boolean default false,
  is_products_featured boolean default false,
  slug text,
  seo_title text,
  seo_description text,
  seo_keywords text,
  focus_keyword text,
  canonical_url text,
  meta_robots text,
  og_image_url text,
  gallery_urls text[] default '{}',
  local text,
  tipologia text,
  aplicacoes text,
  produtos_utilizados text,
  estilo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_sessions (
  id uuid primary key,
  visitor_id text,
  last_message text,
  last_message_at timestamptz,
  status text default 'active' check (status in ('active', 'closed', 'archived')),
  agent_enabled boolean default true,
  utm_params jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  sender text not null check (sender in ('visitor', 'agent', 'admin')),
  text text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.analytics (
  id uuid primary key default gen_random_uuid(),
  "timestamp" timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb
);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  "timestamp" timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb
);

-- =========================================================
-- HELPER FUNCTIONS (security definer para evitar recursão de RLS)
-- =========================================================

create or replace function public.is_editor_or_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role in ('admin', 'editor')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.has_admin_registered()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.system_config
    where id = 'has_admin' and (data->>'registered')::boolean = true
  );
$$;

-- =========================================================
-- RLS
-- =========================================================

alter table public.users enable row level security;
alter table public.site_content enable row level security;
alter table public.settings enable row level security;
alter table public.system_config enable row level security;
alter table public.product_categories enable row level security;
alter table public.blog_categories enable row level security;
alter table public.products enable row level security;
alter table public.blog_posts enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.analytics enable row level security;
alter table public.analytics_events enable row level security;

-- users: própria linha ou staff pode ler; insert = primeiro admin se registrando OU admin criando outro usuário; update/delete = admin
create policy "users_select" on public.users for select
  using (id = auth.uid() or public.is_editor_or_admin());

create policy "users_insert" on public.users for insert
  with check (
    (not public.has_admin_registered() and id = auth.uid() and role = 'admin')
    or public.is_admin()
  );

create policy "users_update" on public.users for update
  using (public.is_admin());

create policy "users_delete" on public.users for delete
  using (public.is_admin());

-- site_content: leitura pública, escrita staff
create policy "site_content_select" on public.site_content for select using (true);
create policy "site_content_insert" on public.site_content for insert with check (public.is_editor_or_admin());
create policy "site_content_update" on public.site_content for update using (public.is_editor_or_admin());
create policy "site_content_delete" on public.site_content for delete using (public.is_editor_or_admin());

-- settings: leitura pública, escrita staff
create policy "settings_select" on public.settings for select using (true);
create policy "settings_insert" on public.settings for insert with check (public.is_editor_or_admin());
create policy "settings_update" on public.settings for update using (public.is_editor_or_admin());
create policy "settings_delete" on public.settings for delete using (public.is_editor_or_admin());

-- system_config: só a linha 'has_admin' é pública (usada pela tela de login para decidir signup vs login); resto só staff
create policy "system_config_select_public_flag" on public.system_config for select using (id = 'has_admin');
create policy "system_config_select_staff" on public.system_config for select using (public.is_editor_or_admin());
create policy "system_config_insert" on public.system_config for insert with check (public.is_admin() or (id = 'has_admin' and not public.has_admin_registered()));
create policy "system_config_update" on public.system_config for update using (public.is_admin());
create policy "system_config_delete" on public.system_config for delete using (public.is_admin());

-- product_categories / blog_categories: leitura pública, escrita staff
create policy "product_categories_select" on public.product_categories for select using (true);
create policy "product_categories_insert" on public.product_categories for insert with check (public.is_editor_or_admin());
create policy "product_categories_update" on public.product_categories for update using (public.is_editor_or_admin());
create policy "product_categories_delete" on public.product_categories for delete using (public.is_editor_or_admin());

create policy "blog_categories_select" on public.blog_categories for select using (true);
create policy "blog_categories_insert" on public.blog_categories for insert with check (public.is_editor_or_admin());
create policy "blog_categories_update" on public.blog_categories for update using (public.is_editor_or_admin());
create policy "blog_categories_delete" on public.blog_categories for delete using (public.is_editor_or_admin());

-- products / blog_posts: leitura pública, escrita staff
create policy "products_select" on public.products for select using (true);
create policy "products_insert" on public.products for insert with check (public.is_editor_or_admin());
create policy "products_update" on public.products for update using (public.is_editor_or_admin());
create policy "products_delete" on public.products for delete using (public.is_editor_or_admin());

create policy "blog_posts_select" on public.blog_posts for select using (true);
create policy "blog_posts_insert" on public.blog_posts for insert with check (public.is_editor_or_admin());
create policy "blog_posts_update" on public.blog_posts for update using (public.is_editor_or_admin());
create policy "blog_posts_delete" on public.blog_posts for delete using (public.is_editor_or_admin());

-- chat_sessions: dono (auth.uid() == id) ou staff
create policy "chat_sessions_select" on public.chat_sessions for select
  using (auth.uid() = id or public.is_editor_or_admin());
create policy "chat_sessions_insert" on public.chat_sessions for insert
  with check (auth.uid() = id or public.is_editor_or_admin());
create policy "chat_sessions_update" on public.chat_sessions for update
  using (auth.uid() = id or public.is_editor_or_admin());
create policy "chat_sessions_delete" on public.chat_sessions for delete
  using (public.is_editor_or_admin());

-- chat_messages: dono da sessão (via session_id) ou staff
create policy "chat_messages_select" on public.chat_messages for select
  using (
    public.is_editor_or_admin()
    or exists (select 1 from public.chat_sessions cs where cs.id = chat_messages.session_id and cs.id = auth.uid())
  );
create policy "chat_messages_insert" on public.chat_messages for insert
  with check (
    public.is_editor_or_admin()
    or exists (select 1 from public.chat_sessions cs where cs.id = chat_messages.session_id and cs.id = auth.uid())
  );
create policy "chat_messages_update" on public.chat_messages for update
  using (public.is_editor_or_admin());
create policy "chat_messages_delete" on public.chat_messages for delete
  using (public.is_editor_or_admin());

-- analytics / analytics_events: insert público (rastreio anônimo de visitantes), leitura só staff
create policy "analytics_insert" on public.analytics for insert with check (true);
create policy "analytics_select" on public.analytics for select using (public.is_editor_or_admin());

create policy "analytics_events_insert" on public.analytics_events for insert with check (true);
create policy "analytics_events_select" on public.analytics_events for select using (public.is_editor_or_admin());

-- =========================================================
-- REALTIME (Fase 1: só o que já é usado por CMSProvider/SettingsProvider)
-- =========================================================

alter publication supabase_realtime add table public.site_content;
alter publication supabase_realtime add table public.settings;
