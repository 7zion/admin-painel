import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, ShoppingBag, Users, Zap, CheckCircle2, Cloud } from 'lucide-react';
import { motion } from 'motion/react';

interface OverviewProps {
  setActiveTab: (tab: string) => void;
}

export function Overview({ setActiveTab }: OverviewProps) {
  const [stats, setStats] = useState({
    blogCount: 0,
    productCount: 0,
    userCount: 0,
    draftCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      const [blogRes, productsRes, usersRes] = await Promise.all([
        supabase.from('blog_posts').select('is_published'),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('users').select('id', { count: 'exact', head: true }),
      ]);

      if (blogRes.error) console.error('Error listening to blog posts:', blogRes.error);
      if (productsRes.error) console.error('Error listening to products:', productsRes.error);
      if (usersRes.error) console.error('Error listening to users:', usersRes.error);

      const blogPosts = blogRes.data || [];
      const drafts = blogPosts.filter((post: any) => !post.is_published).length;

      setStats({
        blogCount: blogPosts.length,
        draftCount: drafts,
        productCount: productsRes.count || 0,
        userCount: usersRes.count || 0,
      });
      setLoading(false);
    };

    loadStats();

    const channel = supabase
      .channel('overview-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blog_posts' }, loadStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, loadStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, loadStats)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: (i: number): any => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" }
    })
  };

  return (
    <div className="space-y-8" id="overview-container">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2" id="overview-title">Painel de Controle</h1>
        <p className="text-gray-400 text-sm" id="overview-subtitle">
          Bem-vindo ao administrador do site da 7Zion Agência. Gerencie artigos, produtos e acessos.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="stats-grid">
        {[
          {
            title: "Artigos no Blog",
            value: stats.blogCount,
            sub: `${stats.draftCount} rascunhos`,
            icon: FileText,
            color: "from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-400",
            tabUrl: "blog"
          },
          {
            title: "Produtos Cadastrados",
            value: stats.productCount,
            sub: "Ativos na vitrine",
            icon: ShoppingBag,
            color: "from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-400",
            tabUrl: "products"
          },
          {
            title: "Usuários com Acesso",
            value: stats.userCount,
            sub: "Contas administrativas",
            icon: Users,
            color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400",
            tabUrl: "users"
          },
          {
            title: "Integrações de Infra",
            value: "Ativas",
            sub: "Supabase e Cloudflare",
            icon: Cloud,
            color: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400",
            tabUrl: "integrations"
          }
        ].map((stat, idx) => (
          <motion.div
            key={stat.title}
            custom={idx}
            initial="hidden"
            animate="visible"
            variants={cardVariants as any}
            className={`cursor-pointer bg-gradient-to-br ${stat.color} p-6 rounded-2xl border bg-[#0d0d0d] hover:scale-[1.02] transition-all`}
            onClick={() => setActiveTab(stat.tabUrl)}
            id={`stat-card-${idx}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wilder mb-1">{stat.title}</p>
                <p className="text-3xl font-extrabold text-white">{stat.value}</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              {stat.sub}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Quick shortcuts and active Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="bg-[#0b0b0b] rounded-2xl border border-white/5 p-6 lg:col-span-2 space-y-6" id="quick-actions-panel">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-400" /> Atividades Rápidas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setActiveTab('blog')}
              className="group p-5 bg-[#121212] hover:bg-white/5 rounded-xl border border-white/5 text-left transition-colors flex items-center justify-between"
              id="btn-quick-new-blog"
            >
              <div>
                <p className="font-semibold text-white group-hover:text-indigo-400 transition-colors">Criar Nova Postagem</p>
                <p className="text-xs text-gray-400 mt-1">Publique ideias ou cases da agência</p>
              </div>
              <span className="text-xs text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-all font-medium">Postar</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className="group p-5 bg-[#121212] hover:bg-white/5 rounded-xl border border-white/5 text-left transition-colors flex items-center justify-between"
              id="btn-quick-new-product"
            >
              <div>
                <p className="font-semibold text-white group-hover:text-purple-400 transition-colors">Adicionar Produto</p>
                <p className="text-xs text-gray-400 mt-1">Gerencie a vitrine de infoprodutos ou serviços</p>
              </div>
              <span className="text-xs text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20 group-hover:bg-purple-500/20 transition-all font-medium">Cadastrar</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className="group p-5 bg-[#121212] hover:bg-white/5 rounded-xl border border-white/5 text-left transition-colors flex items-center justify-between"
              id="btn-quick-new-user"
            >
              <div>
                <p className="font-semibold text-white group-hover:text-emerald-400 transition-colors">Cadastrar Colega de Equipe</p>
                <p className="text-xs text-gray-400 mt-1">Dê acesso administrativo a outro e-mail</p>
              </div>
              <span className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all font-medium">Adicionar</span>
            </button>

            <button
              onClick={() => setActiveTab('integrations')}
              className="group p-5 bg-[#121212] hover:bg-white/5 rounded-xl border border-white/5 text-left transition-colors flex items-center justify-between"
              id="btn-quick-integrations"
            >
              <div>
                <p className="font-semibold text-white group-hover:text-amber-400 transition-colors">Configurar Cloudflare e R2</p>
                <p className="text-xs text-gray-400 mt-1">Guia de sincronização de arquivos e builds</p>
              </div>
              <span className="text-xs text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 group-hover:bg-amber-500/20 transition-all font-medium">Configurar</span>
            </button>
          </div>
        </div>

        {/* System status Card */}
        <div className="bg-[#0b0b0b] rounded-2xl border border-white/5 p-6 flex flex-col justify-between space-y-6" id="system-status-card">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Status do Sistema
            </h2>
            <div className="space-y-3.5" id="system-metrics-list">
              <div className="flex justify-between items-center text-xs py-2 border-b border-white/5">
                <span className="text-gray-400">Banco de Dados (Supabase)</span>
                <span className="text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-bold font-mono">ONLINE</span>
              </div>
              <div className="flex justify-between items-center text-xs py-2 border-b border-white/5">
                <span className="text-gray-400">Autenticação de Usuários</span>
                <span className="text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-bold font-mono">CONECTADO</span>
              </div>
              <div className="flex justify-between items-center text-xs py-2 border-b border-white/5">
                <span className="text-gray-400">Hospedagem</span>
                <span className="text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/25 font-bold font-mono">CLOUDFLARE</span>
              </div>
              <div className="flex justify-between items-center text-xs py-2">
                <span className="text-gray-400">Provedor de Mídia</span>
                <span className="text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/25 font-bold font-mono">CLOUDFLARE R2</span>
              </div>
            </div>
          </div>
          <div className="bg-[#121212] p-4 rounded-xl border border-white/5 text-xs text-gray-400 space-y-1 font-mono">
            <p>Database ID:</p>
            <p className="text-white truncate">ai-studio-8766456f</p>
          </div>
        </div>
      </div>
    </div>
  );
}
