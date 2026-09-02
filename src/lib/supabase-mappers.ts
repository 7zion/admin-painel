import { supabase } from './supabase';

// Converte linhas do Postgres (snake_case) para o formato usado pelo app (camelCase),
// compartilhado entre server functions (cms-server.ts) e componentes client-side.

// settings.data é um jsonb único por linha (id), então mesclar um campo (ex: homeProductsConfig
// dentro de "site") exige ler o valor atual primeiro, equivalente ao setDoc(..., {merge:true}) do Firestore.
export async function mergeSettings(id: string, partial: Record<string, any>) {
  const { data: current } = await supabase.from('settings').select('data').eq('id', id).maybeSingle();
  const { error } = await supabase.from('settings').upsert({
    id,
    data: { ...(current?.data || {}), ...partial },
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export function productRowToApp(row: any) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    imageUrl: row.image_url,
    galleryUrls: row.gallery_urls || [],
    category: row.category,
    stock: row.stock,
    itemType: row.item_type,
    ctaType: row.cta_type,
    ctaValue: row.cta_value,
    tag: row.tag,
    tamanho: row.tamanho,
    unidade: row.unidade,
    aplicacao: row.aplicacao,
    estilo: row.estilo,
    colecao: row.colecao,
    acabamento: row.acabamento,
    tonalidade: row.tonalidade,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    published: row.published,
    isFeatured: row.is_featured,
    isProductsFeatured: row.is_products_featured,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    seoKeywords: row.seo_keywords,
    focusKeyword: row.focus_keyword,
    canonicalUrl: row.canonical_url,
    metaRobots: row.meta_robots,
    ogImageUrl: row.og_image_url,
  };
}

export function blogPostRowToApp(row: any) {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    content: row.content,
    category: row.category,
    imageUrl: row.image_url,
    author: row.author,
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    published: row.published,
    isFeatured: row.is_featured,
    isProductsFeatured: row.is_products_featured,
    slug: row.slug,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    seoKeywords: row.seo_keywords,
    focusKeyword: row.focus_keyword,
    canonicalUrl: row.canonical_url,
    metaRobots: row.meta_robots,
    ogImageUrl: row.og_image_url,
    galleryUrls: row.gallery_urls || [],
    local: row.local,
    tipologia: row.tipologia,
    aplicacoes: row.aplicacoes,
    produtosUtilizados: row.produtos_utilizados,
    estilo: row.estilo,
  };
}

export function productCategoryRowToApp(row: any) {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    imageUrl: row.image_url,
    displayTitle: row.display_title,
    description: row.description,
    showOnHome: row.show_on_home ?? false,
    homeSortBy: row.home_sort_by ?? 'name',
  };
}

export const blogCategoryRowToApp = productCategoryRowToApp;

export function productToRow(p: Record<string, any>) {
  return {
    ...(p.id ? { id: p.id } : {}),
    name: p.name,
    description: p.description,
    price: p.price,
    image_url: p.imageUrl,
    gallery_urls: p.galleryUrls || [],
    category: p.category,
    stock: p.stock,
    item_type: p.itemType,
    cta_type: p.ctaType,
    cta_value: p.ctaValue,
    tag: p.tag,
    tamanho: p.tamanho,
    unidade: p.unidade,
    aplicacao: p.aplicacao,
    estilo: p.estilo,
    colecao: p.colecao,
    acabamento: p.acabamento,
    tonalidade: p.tonalidade,
    published: p.published,
    is_featured: p.isFeatured,
    is_products_featured: p.isProductsFeatured,
    seo_title: p.seoTitle,
    seo_description: p.seoDescription,
    seo_keywords: p.seoKeywords,
    focus_keyword: p.focusKeyword,
    canonical_url: p.canonicalUrl,
    meta_robots: p.metaRobots,
    og_image_url: p.ogImageUrl,
    updated_at: new Date().toISOString(),
  };
}

export function blogPostToRow(p: Record<string, any>) {
  return {
    ...(p.id ? { id: p.id } : {}),
    title: p.title,
    summary: p.summary,
    content: p.content,
    category: p.category,
    image_url: p.imageUrl,
    author: p.author,
    is_published: p.isPublished,
    published: p.published,
    is_featured: p.isFeatured,
    is_products_featured: p.isProductsFeatured,
    slug: p.slug,
    seo_title: p.seoTitle,
    seo_description: p.seoDescription,
    seo_keywords: p.seoKeywords,
    focus_keyword: p.focusKeyword,
    canonical_url: p.canonicalUrl,
    meta_robots: p.metaRobots,
    og_image_url: p.ogImageUrl,
    gallery_urls: p.galleryUrls || [],
    local: p.local,
    tipologia: p.tipologia,
    aplicacoes: p.aplicacoes,
    produtos_utilizados: p.produtosUtilizados,
    estilo: p.estilo,
    updated_at: new Date().toISOString(),
  };
}

export function categoryToRow(c: Record<string, any>) {
  return {
    ...(c.id ? { id: c.id } : {}),
    name: c.name,
    display_title: c.displayTitle,
    description: c.description,
    image_url: c.imageUrl,
  };
}
