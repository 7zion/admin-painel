// Detecta user-agents de bots/crawlers conhecidos para não poluir o dashboard de
// marketing com tráfego não-humano. Isso não afeta SEO: não bloqueia nem altera
// a resposta HTTP para nenhum bot (inclusive Googlebot/Bingbot continuam recebendo
// a página normalmente) — só evita registrar essas visitas como se fossem de
// pessoas reais nas tabelas analytics/analytics_events.
const BOT_USER_AGENT_PATTERN =
  /bot|spider|crawl|slurp|mediapartners|facebookexternalhit|ia_archiver|semrush|ahrefs|mj12bot|dotbot|petalbot|bytespider|gptbot|ccbot|claudebot|headlesschrome|phantomjs|puppeteer|playwright|curl|wget|python-requests|scrapy|node-fetch|axios\/|postmanruntime|go-http-client|libwww-perl|lighthouse|pagespeed|uptimerobot|pingdom/i;

export function isLikelyBot(): boolean {
  if (typeof navigator === 'undefined' || !navigator.userAgent) return false;
  if (navigator.webdriver) return true;
  return BOT_USER_AGENT_PATTERN.test(navigator.userAgent);
}
