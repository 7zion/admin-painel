-- Permite escolher, por categoria de produto, se ela aparece na vitrine da home
-- (seção "Explore nossa loja") e em que ordem seus produtos são exibidos ali.
-- Substitui o antigo mecanismo de settings.site.homeProductsConfig (um único
-- modo global: recentes/categoria/preço/manual) por um controle por categoria.

alter table public.product_categories
  add column if not exists show_on_home boolean not null default false,
  add column if not exists home_sort_by text not null default 'name' check (home_sort_by in ('name', 'price', 'tamanho'));
