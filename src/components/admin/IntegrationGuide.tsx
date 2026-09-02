import React from 'react';
import { Cloud, GitBranch, ShieldCheck, Database, HardDrive, Key } from 'lucide-react';

export function IntegrationGuide() {
  return (
    <div className="space-y-8" id="integration-guide-container">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2" id="integrations-title">Integrações de Infraestrutura</h1>
        <p className="text-gray-400 text-sm" id="integrations-subtitle">
          Veja abaixo as diretrizes e status de configuração de sua agência no Cloudflare, R2, GitHub e Supabase.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="integrations-grid">
        {/* Supabase Config card */}
        <div className="bg-[#0b0b0b] rounded-2xl border border-white/5 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl border border-orange-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white">1. Supabase (Postgres + Auth)</h3>
              <p className="text-xs text-gray-400">Banco de dados e autenticador ativos</p>
            </div>
          </div>
          <div className="space-y-3 pt-2 text-xs text-gray-300">
            <p>
              O Supabase está provisionado sob o projeto <strong className="text-white font-mono bg-white/5 px-1 py-0.5 rounded">rmdlkfvtuhbvksbrbtcp</strong>.
            </p>
            <p>
              Qualquer post cadastrado no painel é guardado no **Postgres** em tempo real (via Supabase Realtime), fornecendo segurança total contra vazamentos por meio das políticas de RLS instaladas em <code className="text-orange-400 font-mono text-[11px]">supabase/migrations/</code>.
            </p>
            <div className="bg-[#121212] p-4 rounded-xl border border-white/5 space-y-1 font-mono text-gray-400">
              <span className="text-emerald-400">✔</span> Supabase Auth ativo (E-mail e Senha)<br/>
              <span className="text-emerald-400">✔</span> Postgres Database conectado
            </div>
          </div>
        </div>

        {/* Cloudflare Pages / Hosting */}
        <div className="bg-[#0b0b0b] rounded-2xl border border-white/5 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white">2. Hospedagem Cloudflare Pages</h3>
              <p className="text-xs text-gray-400">Site rápido, seguro no Edge global</p>
            </div>
          </div>
          <div className="space-y-3 pt-2 text-xs text-gray-300">
            <p>
              Para hospedar o site no **Cloudflare Pages** com excelente performance e CDN:
            </p>
            <ol className="list-decimal pl-4 space-y-2 text-gray-400">
              <li>Acesse o painel da Cloudflare e clique em <strong className="text-white">Workers & Pages</strong>.</li>
              <li>Conclua a integração com seu repositório do GitHub.</li>
              <li>Adicione estas variáveis de ambiente no build da Cloudflare:</li>
            </ol>
            <div className="bg-[#121212] p-3 rounded-xl border border-white/5 font-mono text-[11px] text-gray-400 space-y-1">
              # Variaveis requeridas na Cloudflare:<br/>
              NODE_VERSION = 20<br/>
              SUPABASE_URL / SUPABASE_ANON_KEY (de supabase-config.json)
            </div>
          </div>
        </div>

        {/* GitHub Sync */}
        <div className="bg-[#0b0b0b] rounded-2xl border border-white/5 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white">3. Sincronização GitHub</h3>
              <p className="text-xs text-gray-400">CI/CD de deploy contínuo</p>
            </div>
          </div>
          <div className="space-y-3 pt-2 text-xs text-gray-300">
            <p>
              Ao realizar pushes para seu repositório no GitHub, o Cloudflare Pages reconstrói e publica o site automaticamente em menos de 1 minuto em ambiente produtivo.
            </p>
            <div className="bg-[#121212] p-4 rounded-xl border border-white/5 space-y-2 text-gray-400">
              <p className="font-semibold text-white">Configuração da Branch:</p>
              <ul className="list-disc pl-4 space-y-1 text-xs">
                <li>Branch de produção recomendada: <strong className="text-white font-mono">main</strong></li>
                <li>Diretório de build: <strong className="text-white font-mono">dist/</strong></li>
                <li>Comando de build: <strong className="text-white font-mono">npm run build</strong></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Cloudflare R2 Storage */}
        <div className="bg-[#0b0b0b] rounded-2xl border border-white/5 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white">4. Cloudflare R2 Storage (Arquivos)</h3>
              <p className="text-xs text-gray-400">Armazenamento sem taxas de egress</p>
            </div>
          </div>
          <div className="space-y-3 pt-2 text-xs text-gray-300">
            <p>
              O Cloudflare R2 está configurado usando Cloudflare Workers via Bindings. As mídias são enviadas diretamente via proxy com o Worker <code>env.R2.put()</code>.
            </p>
            <div className="bg-[#121212] p-4 rounded-xl border border-white/5 text-xs text-gray-400 space-y-2">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <span className="text-white font-semibold">Configuração R2 Ativa</span>
              </div>
              <p className="text-[11px]">
                Crie um Bucket R2 no painel da Cloudflare chamado <code className="text-amber-400 font-mono">moraes-revestimento</code>, adicione permissões de CORS para permitir requisições de origem do seu domínio, e as imagens enviadas serão servidas via cache CDN de forma ideal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
