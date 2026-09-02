import { createFileRoute } from '@tanstack/react-router'
import React, { useState } from 'react';
import { useAuth } from '../lib/auth-context';
import { supabase } from '../lib/supabase';
import {
  LayoutDashboard, FileText, ShoppingBag, Users, HelpCircle, LogOut,
  Lock, Mail, Key, ShieldAlert, Sparkles, CheckCircle2, ChevronRight, ChevronLeft, Menu, X, ArrowRight, Settings, BarChart2, Code, MessageSquare, Images, ExternalLink
} from 'lucide-react';
import { Overview } from '../components/admin/Overview';
import { BlogControl } from '../components/admin/BlogControl';
import { ProductControl } from '../components/admin/ProductControl';
import { ServiceControl } from '../components/admin/ServiceControl';
import { UserControl } from '../components/admin/UserControl';
import { MarketingControl } from '../components/admin/MarketingControl';
import { TrackingControl } from '../components/admin/TrackingControl';
import { ChatControl } from '../components/admin/ChatControl';
import { IntegrationGuide } from '../components/admin/IntegrationGuide';
import { SettingsControl } from '../components/admin/SettingsControl';
import { MediaControl } from '../components/admin/MediaControl';

export const Route = createFileRoute('/admin')({
  component: Admin,
})

function Admin() {
  const { 
    currentUser, 
    userRole, 
    loading, 
    hasAdminRegistered, 
    refreshAdminStatus, 
    logout 
  } = useAuth();

  // Selected tab state
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Auth form states
  const [isRegisteringFirstAdmin, setIsRegisteringFirstAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [forceLoginMode, setForceLoginMode] = useState(false);

  const isLoginMode = hasAdminRegistered || forceLoginMode;

  // Sign up handles if no admin exists
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setAuthError('');
    setAuthSuccess('');
    setAuthLoading(true);

    try {
      if (!isLoginMode) {
        // First admin registration
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        const user = data.user;
        if (!user) throw new Error('Falha ao criar usuário.');

        const { error: userInsertError } = await supabase.from('users').insert({
          id: user.id,
          email: user.email || email,
          role: 'admin',
          created_at: new Date().toISOString(),
        });
        if (userInsertError) throw userInsertError;

        const { error: configError } = await supabase.from('system_config').insert({
          id: 'has_admin',
          data: { registered: true },
        });
        if (configError) throw configError;

        setAuthSuccess('Conta admin criada e autenticada com sucesso!');
        await refreshAdminStatus();
      } else {
        // Standard user login
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setAuthSuccess('Autenticado com sucesso! Entrando no painel...');
      }
    } catch (err: any) {
      console.error('Authentication Error:', err);
      const message: string = err.message || '';
      if (message.includes('Invalid login credentials')) {
        setAuthError('E-mail ou senha incorretos. Tente novamente.');
      } else if (message.includes('already registered') || message.includes('already been registered')) {
        setAuthError('E-mail já cadastrado.');
      } else if (message.includes('Password should be at least')) {
        setAuthError('A senha deve possuir no mínimo 6 dígitos.');
      } else {
        setAuthError(message || 'Ocorreu um erro ao realizar a autenticação.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-gray-400 font-mono text-sm space-y-6" id="auth-main-loading">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)] animate-pulse border border-white/10 p-2">
            <img src="/images/favicon-7zion.png" alt="7Zion" className="w-full h-full object-contain" />
          </div>
          <div className="absolute inset-0 border-t-2 border-indigo-400 rounded-2xl animate-spin" style={{ animationDuration: '1.5s' }} />
        </div>
        <div className="flex flex-col items-center">
          <h2 className="text-white font-bold text-lg mb-1">Verificando Credenciais</h2>
          <p className="text-gray-500 text-xs">Carregando console administrador...</p>
        </div>
      </div>
    );
  }

  // Not Logged In View (sessões anônimas do widget de chat não contam como login)
  if (!currentUser || currentUser.is_anonymous) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4 selection:bg-indigo-500/30" id="admin-auth-panel">
        {/* Decorative Grid & Glow */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full filter blur-[120px] pointer-events-none" />

        <div className="relative w-full max-w-md bg-[#0a0a0a]/90 border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-md space-y-8" id="auth-card">
          <div className="text-center space-y-2">
            <div className="relative inline-flex mb-4 mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)] animate-pulse border border-white/10 p-2">
                <img src="/images/favicon-7zion.png" alt="7Zion" className="w-full h-full object-contain" />
              </div>
              <div className="absolute inset-0 border-t-2 border-indigo-400 rounded-2xl animate-spin" style={{ animationDuration: '1.5s' }} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {!isLoginMode ? 'Configurar Conta Administrador' : 'Acesso Restrito'}
            </h1>
            <p className="text-sm text-gray-400">
              {!isLoginMode 
                ? 'Nenhum administrador cadastrado. Crie a primeira conta para gerenciar seu site.' 
                : 'Painel de controle de conteúdo | 7Zion Agência'
              }
            </p>
          </div>

          {authError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3.5 rounded-xl font-medium flex items-center gap-1.5" id="auth-error-display">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {authSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3.5 rounded-xl font-medium flex items-center gap-1.5" id="auth-success-display">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{authSuccess}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4" id="login-form">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-gray-500" /> E-mail Profissional
              </label>
              <input
                type="email"
                required
                value={email}
                disabled={authLoading}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex e-mail: admin@7zion.com"
                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-gray-500" /> Senha
              </label>
              <input
                type="password"
                required
                value={password}
                disabled={authLoading}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Introduza sua senha corporativa"
                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 px-4 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.25)] hover:shadow-indigo-500/30 transition-all text-sm cursor-pointer border border-indigo-400/20 flex items-center justify-center gap-1"
              id="submit-auth-btn"
            >
              {authLoading 
                ? 'Validando...' 
                : !isLoginMode ? 'Registrar meu Admin' : 'Acessar Administrador'
              }
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          {!hasAdminRegistered && (
            <div className="pt-4 text-center border-t border-white/5">
              <p className="text-sm text-gray-400">
                Já possui uma conta configurada neste banco de dados?
              </p>
              <button onClick={() => setForceLoginMode(!forceLoginMode)} className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold mt-2 underline cursor-pointer">
                {forceLoginMode ? "Voltar para Criar Admin" : "Acessar o Painel de Login"}
              </button>
            </div>
          )}

          {hasAdminRegistered && (
            <div className="text-center text-[11px] text-gray-600">
              * Acesso protegido por criptografia de dados em tempo real sob o SSL Cloudflare.
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render App panel view
  return (
    <div className="h-screen overflow-hidden bg-[#050505] text-gray-300 flex selection:bg-indigo-500/20" id="admin-dashboard-panel">
      {/* Sidebar for Desktop */}
      <aside className={`hidden lg:flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-[#080808]/90 border-r border-white/5 p-6 [@media(max-height:820px)]:p-4 flex-shrink-0 relative overflow-hidden h-full`} id="desktop-sidebar">
        {/* Subtle accent glow */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full filter blur-xl pointer-events-none" />

        <div className="admin-dark-scroll space-y-8 [@media(max-height:820px)]:space-y-4 relative z-10 w-full flex-1 overflow-y-auto overflow-x-hidden">
          {/* Logo 7Zion Header */}
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 ${isSidebarCollapsed ? 'mx-auto' : ''}`}>
              <div className="flex items-center justify-center flex-shrink-0">
                 <img src="/images/lodo-7zion.png" alt="7Zion Agência" className={`${isSidebarCollapsed ? 'w-8 h-8' : 'h-8 w-auto [@media(max-height:820px)]:h-6'} object-contain`} />
              </div>
            </div>
            {!isSidebarCollapsed && (
              <button
                onClick={() => setIsSidebarCollapsed(true)}
                className="p-1 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors"
                title="Recolher menu"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          {isSidebarCollapsed && (
            <div className="flex justify-center -mt-4 mb-4">
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                className="p-1 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors"
                title="Expandir menu"
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Nav links */}
          <nav className="space-y-1.5 [@media(max-height:820px)]:space-y-1" id="sidebar-nav">
            {[
              { id: 'overview', label: 'Painel Central', icon: LayoutDashboard },
              { id: 'chat', label: 'Chat & Atendimento', icon: MessageSquare },
              { id: 'blog', label: 'Artigos do Blog', icon: FileText },
              { id: 'marketing', label: 'Marketing & Otimização', icon: BarChart2 },
              { id: 'tracking', label: 'Rastreamento & Scripts', icon: Code },
              { id: 'products', label: 'Produtos', icon: ShoppingBag },
              { id: 'media', label: 'Mídias', icon: Images },
              { id: 'services', label: 'Serviços & Soluções', icon: Sparkles },
              { id: 'users', label: 'Membros e Acessos', icon: Users },
              { id: 'settings', label: 'Configurações', icon: Settings },
              { id: 'integrations', label: 'Infraestrutura', icon: HelpCircle }
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                title={isSidebarCollapsed ? link.label : undefined}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'gap-4 [@media(max-height:820px)]:gap-3 px-4'} py-3.5 [@media(max-height:820px)]:py-2 [@media(max-height:680px)]:py-1.5 rounded-xl text-left text-sm [@media(max-height:820px)]:text-xs font-semibold transition-all duration-300 cursor-pointer group ${
                  activeTab === link.id
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
                id={`sidebar-link-${link.id}`}
              >
                <link.icon className={`w-5 h-5 [@media(max-height:820px)]:w-4 [@media(max-height:820px)]:h-4 flex-shrink-0 transition-transform duration-300 ${activeTab !== link.id ? 'group-hover:scale-110 group-hover:text-purple-400' : ''}`} />
                {!isSidebarCollapsed && <span>{link.label}</span>}
              </button>
            ))}
          </nav>
        </div>

        {/* Ver Site + Logged User Info and Logout */}
        <div className="border-t border-white/5 pt-5 [@media(max-height:820px)]:pt-3 space-y-4 [@media(max-height:820px)]:space-y-2 relative z-10 w-full flex flex-col items-center flex-shrink-0">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title={isSidebarCollapsed ? "Ver Site" : undefined}
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3.5 py-2.5 [@media(max-height:820px)]:py-2'} bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-bold text-xs rounded-xl border border-white/10 transition-colors cursor-pointer`}
            id="sidebar-view-site-link"
          >
            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
            {!isSidebarCollapsed && <span>Ver Site</span>}
          </a>

          <div className={`flex items-center gap-2 overflow-hidden w-full ${isSidebarCollapsed ? 'justify-center' : 'px-1.5'}`}>
            <div className="w-8 h-8 [@media(max-height:820px)]:w-7 [@media(max-height:820px)]:h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-gray-400 flex-shrink-0">
              {currentUser.email?.substring(0, 2).toUpperCase()}
            </div>
            {!isSidebarCollapsed && (
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{currentUser.email}</p>
                <p className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider mt-0.5">
                  {userRole === 'admin' ? 'Administrador' : 'Editor'}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={logout}
            title={isSidebarCollapsed ? "Sair" : undefined}
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3.5 py-2.5 [@media(max-height:820px)]:py-2'} bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs rounded-xl border border-red-500/20 transition-colors cursor-pointer`}
            id="sidebar-logout-btn"
          >
            {isSidebarCollapsed ? (
              <LogOut className="w-4 h-4" />
            ) : (
              <>
                <span className="flex items-center gap-2">
                  <LogOut className="w-3.5 h-3.5" /> Sair do Painel
                </span>
                <ChevronRight className="w-3 h-3" />
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0" id="admin-main-view">
        {/* Mobile Top Header */}
        <header className="lg:hidden bg-[#080808]/90 border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md" id="mobile-top-header">
          <div className="flex items-center">
            <img src="/images/lodo-7zion.png" alt="7Zion Agência" className="h-7 w-auto object-contain" />
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 -mr-2 text-gray-400 hover:text-white bg-white/5 rounded-lg border border-white/5 cursor-pointer"
            id="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </header>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 overflow-hidden flex" id="mobile-drawer">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xs transition-opacity" onClick={() => setMobileMenuOpen(false)} />
            
            <div className="relative w-64 bg-[#0a0a0a] border-r border-white/10 h-full p-6 flex flex-col shadow-2xl">
              <div className="admin-dark-scroll space-y-6 flex-1 overflow-y-auto overflow-x-hidden min-h-0">
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <span className="font-bold text-white tracking-widest text-xs uppercase text-indigo-400">Navegação</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-white cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <nav className="space-y-2">
                  {[
                    { id: 'overview', label: 'Painel Central', icon: LayoutDashboard },
                    { id: 'chat', label: 'Chat & Atendimento', icon: MessageSquare },
                    { id: 'blog', label: 'Artigos do Blog', icon: FileText },
                    { id: 'marketing', label: 'Marketing & Otimização', icon: BarChart2 },
                    { id: 'tracking', label: 'Rastreamento & Scripts', icon: Code },
                    { id: 'products', label: 'Produtos', icon: ShoppingBag },
              { id: 'media', label: 'Mídias', icon: Images },
                    { id: 'services', label: 'Serviços & Soluções', icon: Sparkles },
                    { id: 'users', label: 'Membros e Acessos', icon: Users },
                    { id: 'settings', label: 'Configurações', icon: Settings },
                    { id: 'integrations', label: 'Infraestrutura', icon: HelpCircle }
                  ].map((link) => (
                    <button
                      key={link.id}
                      onClick={() => {
                        setActiveTab(link.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left text-sm font-semibold transition-all duration-300 cursor-pointer group ${
                        activeTab === link.id 
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)]' 
                          : 'text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <link.icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${activeTab !== link.id ? 'group-hover:scale-110 group-hover:text-purple-400' : ''}`} />
                      <span>{link.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="border-t border-white/5 pt-4 space-y-3 flex-shrink-0">
                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-bold text-xs rounded-xl border border-white/10 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Ver Site
                </a>
                <div className="truncate">
                  <p className="text-xs font-bold text-white truncate">{currentUser.email}</p>
                  <p className="text-[10px] text-indigo-400 font-bold uppercase mt-0.5">
                    {userRole === 'admin' ? 'Administrador' : 'Editor'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs rounded-xl border border-red-500/20 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sair do Painel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8" id="admin-main-view-scroll">
          {activeTab === 'overview' && <Overview setActiveTab={setActiveTab} />}
          {activeTab === 'chat' && <ChatControl />}
          {activeTab === 'blog' && <BlogControl />}
          {activeTab === 'marketing' && <MarketingControl />}
          {activeTab === 'tracking' && <TrackingControl />}
          {activeTab === 'products' && <ProductControl />}
          {activeTab === 'media' && <MediaControl />}
          {activeTab === 'services' && <ServiceControl />}
          {activeTab === 'users' && <UserControl />}
          {activeTab === 'settings' && <SettingsControl />}
          {activeTab === 'integrations' && <IntegrationGuide />}
        </main>
      </div>
    </div>
  );
}
