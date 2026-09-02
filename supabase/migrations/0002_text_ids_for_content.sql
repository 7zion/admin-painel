-- Products, blog_posts e suas categorias usavam uuid gerado automaticamente, mas os
-- documentos do Firestore têm IDs próprios (usados nas URLs /produto/$id e /blog/$id).
-- Como essas tabelas ainda estão vazias, trocamos para "id text" e preservamos os IDs
-- originais na importação, evitando quebrar links existentes.

alter table public.products alter column id drop default;
alter table public.products alter column id type text using id::text;

alter table public.product_categories alter column id drop default;
alter table public.product_categories alter column id type text using id::text;

alter table public.blog_posts alter column id drop default;
alter table public.blog_posts alter column id type text using id::text;

alter table public.blog_categories alter column id drop default;
alter table public.blog_categories alter column id type text using id::text;
