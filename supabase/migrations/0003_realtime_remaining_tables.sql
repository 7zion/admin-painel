-- Habilita Realtime nas tabelas usadas pelas telas de admin e pelo chat que migramos agora.
alter publication supabase_realtime add table public.product_categories;
alter publication supabase_realtime add table public.products;
alter publication supabase_realtime add table public.blog_categories;
alter publication supabase_realtime add table public.blog_posts;
alter publication supabase_realtime add table public.users;
alter publication supabase_realtime add table public.chat_sessions;
alter publication supabase_realtime add table public.chat_messages;
