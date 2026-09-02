import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { productRowToApp, blogPostRowToApp, productCategoryRowToApp as categoryRowToApp } from './supabase-mappers';
import supabaseConfig from '../../supabase-config.json';

export interface SiteContentRecord {
  contentValue: string;
  contentType: 'text' | 'image' | 'html';
  styles?: Record<string, any>;
}

export const fetchSiteSettings = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const { data, error } = await supabase.from('settings').select('data').eq('id', 'site').maybeSingle();
    if (error) throw error;
    return data?.data ?? null;
  } catch (err) {
    console.error('Falha ao buscar settings no servidor:', err);
  }
  return null;
});

export const fetchProductServer = createServerFn({ method: 'GET' }).validator((productId: string) => productId).handler(async ({ data: productId }) => {
  try {
    const { data, error } = await supabase.from('products').select('*').eq('id', productId).maybeSingle();
    if (error) throw error;
    return data ? productRowToApp(data) : null;
  } catch (err) {
    console.error('Falha ao buscar produto no servidor:', err);
  }
  return null;
});

export const fetchTrackingSettings = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    // A linha 'tracking' agora é staff-only via RLS (ver migração 0007) porque
    // guarda o token da Meta Conversions API. Usamos a Service Role Key aqui
    // (só no servidor) pra continuar servindo os scripts públicos (GTM/GA/Pixel/
    // GSC) no HTML de qualquer visitante, sem depender de autenticação.
    const serviceRoleKey = typeof process !== 'undefined' ? process.env.SUPABASE_SERVICE_ROLE_KEY : undefined;
    const client = serviceRoleKey ? createClient(supabaseConfig.url, serviceRoleKey) : supabase;

    const { data, error } = await client.from('settings').select('data').eq('id', 'tracking').maybeSingle();
    if (error) throw error;

    const raw = (data?.data ?? null) as Record<string, any> | null;
    if (!raw) return null;

    // meta-api carrega o token secreto — nunca deve virar dado de hidratação do
    // client (a página pública não usa esse campo, quem consome é
    // src/lib/meta-capi.server.ts, direto no servidor).
    const { 'meta-api': _metaApi, ...safeTracking } = raw;
    return safeTracking;
  } catch (err) {
    console.error('Falha ao buscar tracking no servidor:', err);
  }
  return null;
});

export const fetchProductsModuleSettings = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const { data, error } = await supabase.from('settings').select('data').eq('id', 'productsModule').maybeSingle();
    if (error) throw error;
    return data?.data ?? null;
  } catch (err) {
    console.error('Falha ao buscar productsModule no servidor:', err);
  }
  return null;
});

export const fetchWidgetSettings = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const { data, error } = await supabase.from('settings').select('data').eq('id', 'widgets').maybeSingle();
    if (error) throw error;
    return data?.data ?? null;
  } catch (err) {
    console.error('Falha ao buscar widgets no servidor:', err);
  }
  return null;
});

export const fetchAllProductsServer = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;
    // undefined/null ou true conta como publicado, só false esconde o produto
    return (data || []).filter((row) => row.published !== false).map(productRowToApp);
  } catch (err) {
    console.error('Falha ao buscar products no servidor:', err);
  }
  return [];
});

export const fetchAllBlogPostsServer = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const { data, error } = await supabase.from('blog_posts').select('*');
    if (error) throw error;
    return (data || []).map(blogPostRowToApp);
  } catch (err) {
    console.error('Falha ao buscar blog_posts no servidor:', err);
  }
  return [];
});

export const fetchAllSiteContent = createServerFn({ method: 'GET' }).handler(async () => {
  const result: Record<string, SiteContentRecord> = {};
  try {
    const { data, error } = await supabase.from('site_content').select('*');
    if (error) throw error;
    for (const row of data || []) {
      result[row.id] = {
        contentValue: row.content_value ?? '',
        contentType: (row.content_type ?? 'text') as SiteContentRecord['contentType'],
        styles: row.styles ?? {},
      };
    }
  } catch (err) {
    console.error('Falha ao buscar site_content no servidor:', err);
  }
  return result;
});

export const fetchBlogPostServer = createServerFn({ method: 'GET' }).validator((postId: string) => postId).handler(async ({ data: postId }) => {
  try {
    const { data: bySlug, error: slugError } = await supabase.from('blog_posts').select('*').eq('slug', postId).maybeSingle();
    if (slugError) throw slugError;
    if (bySlug) return blogPostRowToApp(bySlug);

    const { data: byId, error: idError } = await supabase.from('blog_posts').select('*').eq('id', postId).maybeSingle();
    if (idError) throw idError;
    return byId ? blogPostRowToApp(byId) : null;
  } catch (err) {
    console.error('Falha ao buscar blog_post no servidor:', err);
  }
  return null;
});

export const fetchAllBlogCategoriesServer = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const { data, error } = await supabase.from('blog_categories').select('*');
    if (error) throw error;
    return (data || []).map(categoryRowToApp);
  } catch (err) {
    console.error('Falha ao buscar categorias no servidor:', err);
    return [];
  }
});

export const fetchHomeStoreSections = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const { data: catRows, error: catError } = await supabase
      .from('product_categories')
      .select('*')
      .eq('show_on_home', true)
      .order('created_at', { ascending: true });
    if (catError) throw catError;

    const categories = (catRows || []).map(categoryRowToApp);
    if (categories.length === 0) return [];

    const { data: prodRows, error: prodError } = await supabase
      .from('products')
      .select('*')
      .in('category', categories.map((c) => c.name));
    if (prodError) throw prodError;

    const allProducts = (prodRows || [])
      .filter((row: any) => row.published !== false)
      .map(productRowToApp);

    return categories
      .map((cat) => {
        const items = allProducts.filter((p: any) => p.category === cat.name);
        const sortBy = (cat as any).homeSortBy || 'name';
        const sorted = [...items].sort((a: any, b: any) => {
          if (sortBy === 'price') return (a.price || 0) - (b.price || 0);
          if (sortBy === 'tamanho') return String(a.tamanho || '').localeCompare(String(b.tamanho || ''));
          return String(a.name || '').localeCompare(String(b.name || ''));
        });
        return { category: cat, products: sorted };
      })
      .filter((section) => section.products.length > 0);
  } catch (err) {
    console.error('Falha ao buscar vitrine da home no servidor:', err);
    return [];
  }
});

export const fetchAllProductCategoriesServer = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const { data, error } = await supabase.from('product_categories').select('*');
    if (error) throw error;
    return (data || []).map(categoryRowToApp);
  } catch (err) {
    console.error('Falha ao buscar categorias de produtos no servidor:', err);
    return [];
  }
});
