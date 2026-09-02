## ✅ Migração Firebase → Supabase concluída

Este projeto foi migrado de Firebase (Firestore + Auth) para Supabase (Postgres + Auth + Realtime). O Firebase foi completamente removido (`firebase.ts`, `firebase-applet-config.json`, `firestore.rules`, pacote `firebase` do `package.json`).

**Stack de dados atual**:
- Cliente: `src/lib/supabase.ts` (config pública em `supabase-config.json`, mesmo padrão do antigo `firebase-applet-config.json` — não é segredo, a segurança vem das políticas de RLS).
- Schema + RLS: `supabase/migrations/*.sql` (aplicadas com `supabase db push`, usando `SUPABASE_ACCESS_TOKEN` — nunca `supabase login` global, pra não derrubar sessões de outras ferramentas na mesma máquina).
- Mapeamento snake_case (Postgres) ↔ camelCase (app): `src/lib/supabase-mappers.ts`.
- Tempo real: qualquer tela que precisar refletir mudanças ao vivo usa `supabase.channel(...).on('postgres_changes', ...)` — a tabela precisa estar na publication `supabase_realtime` (ver migrations `0001`/`0003`).
- Configurações (`settings` table): uma linha por `id` (`site`, `tracking`, `widgets`, `contact`, `ai_agent`, `marketingModule`, `productsModule`, `servicesModule`) com uma coluna `data jsonb`. Para atualizar só um campo sem apagar os outros, use `mergeSettings(id, partial)` de `supabase-mappers.ts` (lê o jsonb atual, faz merge, grava) — nunca dê upsert de um objeto parcial direto, isso apaga o resto.
- Criação de usuário admin/editor precisa da Service Role Key (`SUPABASE_SERVICE_ROLE_KEY`, só em `.dev.vars`/secrets do Worker) — só pode rodar em `createServerFn` no servidor (`src/lib/admin-users.server.ts`), nunca no client.
- IDs de `products`/`blog_posts`/`*_categories` são `text` (não `uuid`), pra preservar os IDs originais do Firestore nas URLs `/produto/$id` e `/blog/$id`.

# Instruções de Interação

Sempre siga este protocolo antes de realizar qualquer alteração no código:

1.  **Entender o Desejo**: Resumir o que foi pedido para garantir entendimento.
2.  **Análise Técnica**: Explicar pontos de melhoria identificados e possíveis preocupações (performance, UX, design).
3.  **Plano de Ação**: Detalhar exatamente o que será feito.
4.  **Aprovação**: PARAR a execução e aguardar a confirmação explícita do usuário antes de aplicar as mudanças.

## Regras de Ouro (TanStack Start + Cloudflare + Tailwind v4)

- **Cloudflare Workers ≠ Node.js**: Nunca inclua ou utilize bibliotecas que dependem de `child_process`, `sharp`, `puppeteer`, `node-gyp`, binários nativos ou filesystem real.
- **Variáveis de Ambiente**: Acessar `process.env` somente dentro do `.handler()` das server functions, nunca em escopo global ou de módulo.
- **Client APIs**: Utilizar `window`, `document` ou `localStorage` apenas dentro de `useEffect`, event handlers ou com componentes do tipo `<ClientOnly>`.
- **Dados do Supabase em páginas públicas (SSR obrigatório)**:
  - **NUNCA** busque dados que aparecem em página pública (produtos, blog, configurações do site, imagens/textos do CMS) usando `supabase.channel(...)` ou `supabase.from(...).select(...)` **apenas** dentro de um `useEffect`/hook client-side. Isso faz o servidor mandar a página vazia ou com dados padrão/genéricos para o Google e para o visitante, que só vê o conteúdo real depois do JavaScript carregar (SEO quebrado + "piscada" de conteúdo antigo → novo).
  - **SEMPRE** busque esse dado também no `loader` da rota (arquivo em `src/routes/`), usando uma `createServerFn` que consulta o Supabase (leitura pública via RLS, ver `src/lib/cms-server.ts`) ou passando pelo `loader` da rota raiz (`src/routes/__root.tsx`), e use esse valor como estado inicial do componente/hook.
  - O `useEffect`/Realtime continua existindo, mas só para manter os dados **atualizados ao vivo** depois da primeira renderização — nunca como única fonte da primeira renderização.
  - Toda página que usa dado dinâmico do banco (ex: `/produto/$id`, posts de blog) precisa gerar o `head()` (title, description) **a partir do dado já carregado no loader**, nunca via `document.title` em `useEffect`.
  - Esse cuidado vale para páginas dentro de `src/routes/_public.*` e componentes usados por elas (incluindo catálogo/listagem de produtos e blog). Painéis dentro de `/admin` (`src/components/admin/*`) não precisam disso, pois não são públicos nem indexados.
  - Referência de como fazer certo: `src/lib/cms-server.ts` + `src/hooks/useCMS.ts` são o modelo a seguir para qualquer novo hook que leia do Supabase em página pública.
- **Rotas e TanStack**: 
  - NUNCA editar `src/routeTree.gen.ts`.
  - NUNCA remover `<Outlet />` de `__root.tsx`, `_public.tsx`, ou `_authenticated.tsx`.
  - NUNCA criar `src/pages/` (um arquivo em `src/routes/` = uma rota).
  - NUNCA trocar TanStack Router por `react-router-dom`.
- **Estilo e SEO**: 
  - Toda nova página precisa de metadata (`head()`) com `title`, `description`, etc.
  - Atualizar o sitemap em `src/routes/sitemap[.]xml.tsx` sempre que houverem novas rotas públicas/dinâmicas.
- **Tailwind**: Manter o formato v4 usando `@import "tailwindcss"` em `src/index.css`.
- **Dependências**: Sincronizar as versões de `@tanstack/react-start`, `@tanstack/react-router` e afins para evitar conflitos de módulo.
- **Workflow de Deploy**: Sempre mantenha o arquivo `.github/workflows/deploy.yml` configurado para deploy no Cloudflare Workers utilizando `cloudflare/wrangler-action@v3`.
- **Gestão de Imagens e Assets**: 
  - **Imagens Leves e de Identidade** (favicon, logos, ícones estruturais): Devem permanecer no caminho `public/images/`.
    - No código React/TSX, referencie com o caminho público absoluto: `/images/nome-do-arquivo.ext`.
  - **Imagens Pesadas e Dinâmicas** (banners, vídeos, páginas de produtos, serviços, blog, hero, etc): Devem **sempre** ser salvas, geridas e servidas através do Cloudflare R2 utilizando nossa API, ou seja, são editáveis via painel/admin.
  - **Nomenclatura e Formatos**:
    - Nomenclatura obrigatória: kebab-case e em letras minúsculas (ex: `banner-home.webp`, `logo.png`).
    - Formatos recomendados: `.webp` para imagens grandes e `.png`/`.webp` para logos com transparência.
  - Nunca salve imagens fixas em `src/` a menos que explicitamente solicitado.
- **Design Responsivo e UX**:
  - **REGRA DE MEMÓRIA**: Sempre quando criar uma página para desktop, já configurar elas para a versão responsiva mobile, tablet e ultrawide, para os textos, fontes, imagens e carrosséis ficarem do tamanho adequado seguindo os melhores princípios de UX, aplicado por profissionais.
  - Teste visualmente as quebras em telas pequenas e limite a largura máxima (ex: `max-w-screen-2xl`) para telas ultrawide.


## Fluxo de Remix para Novo Cliente (Template)

Este projeto é usado como base (template) para vários clientes, trocando apenas visual, conteúdo e credenciais. Ao remixar para um cliente novo:

- **NÃO apague as páginas públicas do zero.** A estrutura padrão (Home, Blog, Quem Somos, Produtos/Serviços, Contato) serve para praticamente qualquer negócio. Apagar tudo obriga a IA a recriar a integração com o CMS, o SSR e o sitemap do zero, com risco de reintroduzir bugs já corrigidos.
- **O remix normalmente parte de uma imagem de referência** (print de uma página completa) enviada para a IA, pedindo para replicar layout, cores, tipografia, espaçamentos e estilo de imagens. Isso é válido e esperado — mas com uma regra importante:
  - **Replique o visual (cores, fontes, layout, espaçamento, estilo) fielmente a partir da imagem.**
  - **NÃO copie o conteúdo da imagem (textos, fotos específicas) direto como valor fixo no código.** Todo texto e imagem que aparecer na página final deve continuar passando pelo `EditableField`/`useCMS` (com `defaultValue` sendo só um placeholder inicial, editável depois pelo painel admin) — nunca como string ou `src` fixo direto no JSX, exceto para elementos de identidade fixa (logo/ícones estruturais, conforme a regra de Gestão de Imagens e Assets).
  - Ou seja: a imagem de referência define **como o site se parece**, não **o que fica hardcoded no código**.
- **Prompt recomendado para o primeiro comando do remix**:
  > "Usando esta imagem como referência visual (cores, tipografia, layout, estilo de imagens), aplique esse novo visual mantendo a mesma estrutura de rotas (`src/routes`), os componentes `EditableField`/`useCMS` existentes e o `loader` de SSR do `__root.tsx`. Todo texto e imagem editável deve continuar usando `EditableField`, apenas com novos valores padrão baseados na imagem — não crie conteúdo fixo no código. Não remova nem recrie páginas — apenas edite o conteúdo e o visual dentro delas."
- Só remova ou crie rotas novas se o cliente realmente precisar de uma página que os outros não têm (ex: um catálogo diferente, uma calculadora, etc).

## Checklist Obrigatório Antes de Publicar um Clone para Novo Cliente

Antes de fazer o primeiro deploy de um clone deste template para um cliente novo, troque:

1. **`supabase-config.json`** — `url` e `anonKey`: devem apontar para o **projeto Supabase do novo cliente**, nunca reaproveitar o de outro cliente.
2. **`supabase/migrations/*.sql`** — aplicar (`supabase db push`) no projeto Supabase do novo cliente (elas não vêm junto automaticamente só por estarem no repositório). Também configurar `SUPABASE_SERVICE_ROLE_KEY` nos secrets do Worker (necessário para `admin-users.server.ts`).
3. **`wrangler.jsonc`**:
   - `name`: renomear para identificar o cliente (ex: `nome-cliente-site`) e **deve ser idêntico ao nome do Worker já criado no dashboard da Cloudflare** para esse cliente (confira em Workers & Pages antes de mexer). Um nome desalinhado não quebra o site — o deploy automático usa o Worker já conectado ao Git, não o campo `name` do arquivo — mas faz um `wrangler deploy` manual criar um Worker novo e desconectado do domínio real. Nunca deixar um nome genérico ou de outro projeto: isso já aconteceu **duas vezes** neste template (`"ecofit-site"` e depois `"moraes-site"`, resíduos de nomes antigos). Ao renomear, alinhe também `package.json` e rode `npm install` pra sincronizar os lockfiles.
   - `r2_buckets[0].bucket_name`: criar e apontar para um **bucket R2 novo e exclusivo** desse cliente. Nunca reaproveitar bucket de outro cliente (risco de misturar imagens entre sites).
4. **Variável de ambiente `CLOUDFLARE_R2_PUBLIC_URL`** — configurar no ambiente do Worker (Cloudflare dashboard ou secrets do GitHub Actions) apontando para o domínio público do R2 do novo cliente, **desde o primeiro deploy**. Não fazer isso causa imagens quebradas (bug já identificado e corrigido nesse projeto).
5. **Textos/valores padrão herdados de outro template** — revisar e trocar qualquer resíduo de nome genérico esquecido no código (ex: `'Zion Para Eco'` em `src/hooks/useSiteSettings.ts`, número de WhatsApp fixo em `src/components/FloatingWhatsApp.tsx` e `src/components/moraes/*`, fotos padrão do Unsplash em `DepartmentsSection.tsx` e afins).
6. **Deploy automático**: este template **não usa** `.github/workflows/deploy.yml` (removido — falhava sempre por versão desalinhada do Wrangler e nunca teve os secrets `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID` configurados). O deploy real acontece pela integração nativa **"Workers Builds"** da Cloudflare (app `cloudflare-workers-and-pages` conectado direto no repositório GitHub — visível nos check-runs de cada commit). Para um cliente novo: conectar o repositório dele a essa integração pelo dashboard da Cloudflare (Workers & Pages → Create → Connect to Git), não recriar um workflow customizado.
7. **Domínio customizado** — configurar o domínio real do cliente no Cloudflare (rota/custom domain do Worker), em vez de deixar no subdomínio padrão `*.workers.dev`.
8. **Sitemap (`src/routes/sitemap[.]xml.tsx`)** e metadados de SEO (`head()` de cada rota) — atualizar para refletir as páginas e o domínio reais do novo cliente.

Só depois de passar por esse checklist o clone deve ser considerado pronto para receber tráfego real.

