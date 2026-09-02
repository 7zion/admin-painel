import { supabase } from "./supabase";

// Substitui a antiga rota de arquivo "sitemap[.]xml.tsx": o TanStack Router não
// reconhecia esse arquivo (log local: "does not export a Route. This file will
// not be included in the route tree"), então /sitemap.xml sempre voltava 404 em
// produção — o Google nunca conseguiu descobrir as páginas por ele. A antiga
// implementação também apontava para o domínio errado ("zions.ai", de outro
// projeto). Registrado manualmente no worker.ts, no mesmo padrão dos outros
// endpoints (/api/upload, /api/media/list etc.), que já funcionam de verdade.
const SITE_BASE_URL = "https://moraestijolosrevestimentos.com.br";

const STATIC_PATHS = ["/", "/produtos", "/projetos", "/a-empresa", "/contato", "/blog"];

const escapeXml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

export async function handleSitemap(): Promise<Response> {
  const urls: { loc: string; priority: string }[] = STATIC_PATHS.map((path) => ({
    loc: path,
    priority: path === "/" ? "1.0" : "0.8",
  }));

  try {
    const { data: products } = await supabase.from("products").select("id, published, item_type");
    (products || [])
      .filter((p) => p.published !== false && p.item_type !== "service")
      .forEach((p) => urls.push({ loc: `/produto/${p.id}`, priority: "0.7" }));
  } catch (err) {
    console.error("Erro ao buscar produtos para o sitemap:", err);
  }

  try {
    const { data: posts } = await supabase.from("blog_posts").select("id, slug, published");
    (posts || [])
      .filter((p) => p.published !== false)
      .forEach((p) => urls.push({ loc: `/blog/${p.slug || p.id}`, priority: "0.6" }));
  } catch (err) {
    console.error("Erro ao buscar posts do blog para o sitemap:", err);
  }

  const now = new Date().toISOString();
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${escapeXml(SITE_BASE_URL + u.loc)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
