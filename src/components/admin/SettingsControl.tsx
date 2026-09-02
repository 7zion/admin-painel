import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Sparkles, Key, CheckCircle2, ShieldAlert, Loader2, Save, MessageCircle, Settings as SettingsIcon, Globe, UploadCloud, ImageIcon } from 'lucide-react';
import { uploadFileToR2, deleteFileFromR2 } from '../../lib/r2-upload';

export function SettingsControl() {
  const [activeTab, setActiveTab] = useState<'ai' | 'contact' | 'site'>('ai');
  
  // AI Settings
  const [apiKey, setApiKey] = useState('');
  
  // Contact Settings
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');

  // Site Settings
  const [siteName, setSiteName] = useState('');
  const [siteLogo, setSiteLogo] = useState('');
  const [siteLogoFooter, setSiteLogoFooter] = useState('');
  const [siteFavicon, setSiteFavicon] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');

  // Guarda os valores originais carregados do banco para saber, ao salvar, se o
  // logo/favicon foi trocado e o arquivo antigo precisa ser removido do R2.
  const originalAssetsRef = React.useRef({ siteLogo: '', siteLogoFooter: '', siteFavicon: '' });

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingLogoFooter, setIsUploadingLogoFooter] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingAI, setIsTestingAI] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    async function loadConfig() {
      try {
        // Load AI Config
        const { data: aiConfig } = await supabase.from('system_config').select('data').eq('id', 'gemini').maybeSingle();
        if (aiConfig) {
          setApiKey(aiConfig.data?.apiKey || '');
        }

        // Load Contact Config
        const { data: contactConfig } = await supabase.from('settings').select('data').eq('id', 'contact').maybeSingle();
        if (contactConfig) {
          setWhatsappNumber(contactConfig.data?.whatsappNumber || '');
          setCompanyAddress(contactConfig.data?.companyAddress || '');
          setWhatsappMessage(contactConfig.data?.whatsappDefaultMessage || '');
        }

        // Load Site Config
        const { data: siteConfig } = await supabase.from('settings').select('data').eq('id', 'site').maybeSingle();
        if (siteConfig) {
          const data = siteConfig.data || {};
          setSiteName(data.siteName || '');
          setSiteLogo(data.siteLogo || '');
          setSiteLogoFooter(data.siteLogoFooter || '');
          setSiteFavicon(data.siteFavicon || '');
          setSeoTitle(data.seoTitle || '');
          setSeoDescription(data.seoDescription || '');
          setSeoKeywords(data.seoKeywords || '');
          originalAssetsRef.current = {
            siteLogo: data.siteLogo || '',
            siteLogoFooter: data.siteLogoFooter || '',
            siteFavicon: data.siteFavicon || '',
          };
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleSaveAI = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase.from('system_config').upsert({
        id: 'gemini',
        data: { apiKey: apiKey.trim(), updatedAt: new Date().toISOString() },
      });
      if (error) throw error;

      setMessage({ type: 'success', text: 'Chave de API do Gemini salva com sucesso!' });
    } catch (error: any) {
      console.error('Erro ao salvar chave:', error);
      setMessage({ type: 'error', text: `Falha ao salvar: ${error.message}` });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestAI = async () => {
    if (!apiKey.trim()) {
      setMessage({ type: 'error', text: 'Por favor, insira uma chave de API para testar.' });
      return;
    }

    setIsTestingAI(true);
    setMessage(null);

    try {
      const response = await fetch('/api/gemini/blog-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'test_connection', 
          apiKey: apiKey.trim() 
        }),
      });

      const data = await response.json() as any;

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Falha na conexão com Gemini');
      }

      if (data.result && String(data.result).includes('CONEXÃO_ESTABELECIDA')) {
        setMessage({ type: 'success', text: 'Conexão com Gemini estabelecida com sucesso! Sua chave está funcionando.' });
      } else {
        setMessage({ type: 'success', text: 'Gemini respondeu: ' + String(data.result) });
      }
    } catch (error: any) {
      console.error('AI TEST ERROR:', error);
      setMessage({ type: 'error', text: `Erro no teste: ${error.message}` });
    } finally {
      setIsTestingAI(false);
    }
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase.from('settings').upsert({
        id: 'contact',
        data: {
          whatsappNumber: whatsappNumber.trim(),
          whatsappDefaultMessage: whatsappMessage.trim(),
          companyAddress: companyAddress.trim(),
          updatedAt: new Date().toISOString(),
        },
      });
      if (error) throw error;

      setMessage({ type: 'success', text: 'Configurações de contato salvas com sucesso!' });
    } catch (error: any) {
      console.error('Erro ao salvar contato:', error);
      setMessage({ type: 'error', text: `Falha ao salvar: ${error.message}` });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const trimmedLogo = siteLogo.trim();
      const trimmedLogoFooter = siteLogoFooter.trim();
      const trimmedFavicon = siteFavicon.trim();

      const { error } = await supabase.from('settings').upsert({
        id: 'site',
        data: {
          siteName: siteName.trim(),
          siteLogo: trimmedLogo,
          siteLogoFooter: trimmedLogoFooter,
          siteFavicon: trimmedFavicon,
          seoTitle: seoTitle.trim(),
          seoDescription: seoDescription.trim(),
          seoKeywords: seoKeywords.trim(),
          updatedAt: new Date().toISOString(),
        },
      });
      if (error) throw error;

      // Limpa do R2 os arquivos antigos que foram substituídos/removidos nesta gravação.
      const previous = originalAssetsRef.current;
      const cleanupUrls = [
        previous.siteLogo && previous.siteLogo !== trimmedLogo ? previous.siteLogo : null,
        previous.siteLogoFooter && previous.siteLogoFooter !== trimmedLogoFooter ? previous.siteLogoFooter : null,
        previous.siteFavicon && previous.siteFavicon !== trimmedFavicon ? previous.siteFavicon : null,
      ].filter((url): url is string => Boolean(url));
      if (cleanupUrls.length > 0) {
        await Promise.allSettled(cleanupUrls.map((url) => deleteFileFromR2(url)));
      }
      originalAssetsRef.current = { siteLogo: trimmedLogo, siteLogoFooter: trimmedLogoFooter, siteFavicon: trimmedFavicon };

      setMessage({ type: 'success', text: 'Configurações do site salvas com sucesso!' });
    } catch (error: any) {
      console.error('Erro ao salvar site:', error);
      setMessage({ type: 'error', text: `Falha ao salvar: ${error.message}` });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploadingLogo(true);
    try {
      const url = await uploadFileToR2(file, "site");
      setSiteLogo(url);
    } catch (error: any) {
      alert("Erro no upload do logo: " + error.message);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleLogoFooterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploadingLogoFooter(true);
    try {
      const url = await uploadFileToR2(file, "site");
      setSiteLogoFooter(url);
    } catch (error: any) {
      alert("Erro no upload do logo do rodapé: " + error.message);
    } finally {
      setIsUploadingLogoFooter(false);
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploadingFavicon(true);
    try {
      const url = await uploadFileToR2(file, "site");
      setSiteFavicon(url);
    } catch (error: any) {
      alert("Erro no upload do favicon: " + error.message);
    } finally {
      setIsUploadingFavicon(false);
    }
  };

  return (
    <div className="space-y-8" id="settings-control-container">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-2">
          <SettingsIcon className="w-8 h-8 text-indigo-400" />
          Configurações Globais
        </h1>
        <p className="text-gray-400 text-sm">
          Gerencie integrações, chaves de API e números de contato do sistema.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#121212] p-1 rounded-xl w-fit border border-white/5 shadow-inner">
        <button
          onClick={() => { setActiveTab('ai'); setMessage(null); }}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'ai'
              ? 'bg-[#1a1a1a] text-white shadow-md border border-white/10'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Inteligência Artificial
        </button>
        <button
          onClick={() => { setActiveTab('contact'); setMessage(null); }}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'contact'
              ? 'bg-[#1a1a1a] text-white shadow-md border border-white/10'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <MessageCircle className="w-4 h-4" /> Contato Comercial
        </button>
        <button
          onClick={() => { setActiveTab('site'); setMessage(null); }}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'site'
              ? 'bg-[#1a1a1a] text-white shadow-md border border-white/10'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <Globe className="w-4 h-4" /> Site e SEO
        </button>
      </div>

      <div className="bg-[#0b0b0b] rounded-2xl border border-white/5 p-6 lg:p-8 space-y-6 max-w-3xl">
        {message && (
          <div className={`p-4 rounded-xl font-medium text-sm flex items-start gap-3 ${
            message.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <ShieldAlert className="w-5 h-5 flex-shrink-0" />}
            <span className="leading-snug">{message.text}</span>
          </div>
        )}

        {activeTab === 'ai' && (
          <>
            <div className="flex items-start gap-4 pb-6 border-b border-white/5 mb-6">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 mt-1">
                <Key className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Chave de API (Google AI / Gemini)</h3>
                <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                  Para gerar os conteúdos e sugerir SEO do blog automaticamente, você precisa de uma chave de API válida do <strong>Google AI Studio</strong>.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveAI} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                  Gemini API Key (Chave Secreta)
                </label>
                {isLoading ? (
                  <div className="w-full bg-[#121212]/50 border border-white/5 rounded-xl px-4 py-3 flex items-center justify-center animate-pulse h-[46px]">
                    <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                  </div>
                ) : (
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Exemplo: AIzaSyD6x..."
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                  />
                )}
                <p className="text-[11px] text-gray-500 mt-2">
                  Você pode gerar uma no painel oficial em <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Google AI Studio</a>.
                </p>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleTestAI}
                  disabled={isTestingAI || isSaving || isLoading || !apiKey.trim()}
                  className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 font-medium rounded-xl border border-white/10 transition-all text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTestingAI ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Testando...</>
                  ) : (
                    <><Sparkles className="w-4 h-4 text-indigo-400" /> Testar Conexão</>
                  )}
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isLoading}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl border border-indigo-400/20 transition-all text-sm flex items-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
                  ) : (
                    <><Save className="w-4 h-4" /> Salvar Chave de API</>
                  )}
                </button>
              </div>
            </form>
          </>
        )}

        {activeTab === 'contact' && (
          <>
            <div className="flex items-start gap-4 pb-6 border-b border-white/5 mb-6">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 mt-1">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Número de WhatsApp (Recebimento de Leads)</h3>
                <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                  Defina o número central onde você deseja receber contatos. Esse número será usado como destino padrão nos botões de produtos e serviços.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                  Número do WhatsApp
                </label>
                {isLoading ? (
                  <div className="w-full bg-[#121212]/50 border border-white/5 rounded-xl px-4 py-3 flex items-center justify-center animate-pulse h-[46px]">
                    <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                  </div>
                ) : (
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="Ex: 5511999999999 (Apenas números com DDI)"
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
                  />
                )}
                <p className="text-[11px] text-gray-500 mt-1">
                  Insira apenas números, começando pelo código do país (55 para Brasil). Exemplo: 5511999999999.
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t border-white/5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                  Endereço da Empresa
                </label>
                {isLoading ? (
                  <div className="w-full bg-[#121212]/50 border border-white/5 rounded-xl px-4 py-3 flex items-center justify-center animate-pulse h-[46px]">
                    <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                  </div>
                ) : (
                  <input
                    type="text"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    placeholder="Ex: R. Sen. Roberto Símonsen, 381 - Parque Brasil, Bragança Paulista - SP, 12906-330"
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                )}
                <p className="text-[11px] text-gray-500 mt-1">
                  Cole o endereço exatamente como aparece na ficha do Google Meu Negócio — ele alimenta o mapa da página de Contato automaticamente.
                </p>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving || isLoading}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl border border-emerald-400/20 transition-all text-sm flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
                  ) : (
                    <><Save className="w-4 h-4" /> Salvar Contato</>
                  )}
                </button>
              </div>
            </form>
          </>
        )}

        {activeTab === 'site' && (
          <>
            <div className="flex items-start gap-4 pb-6 border-b border-white/5 mb-6">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 mt-1">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Identidade do Site & SEO</h3>
                <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                  Gerencie o logotipo, favicon, nome do site e configurações padrão de otimização de busca (SEO).
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveSite} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                    Logotipo Principal
                  </label>
                  <div className="flex items-center gap-4">
                    {siteLogo ? (
                      <div className="relative w-24 h-24 bg-white/5 rounded-xl border border-white/10 overflow-hidden flex items-center justify-center">
                        <img src={siteLogo} alt="Logo" className="max-w-full max-h-full object-contain p-2" />
                        <button type="button" onClick={() => setSiteLogo('')} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-xs text-white">
                          Remover
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-white/5 rounded-xl border border-white/10 border-dashed flex items-center justify-center text-gray-500">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                    <div className="flex-1">
                      <label className="flex items-center justify-center gap-2 px-4 py-2 bg-[#121212] border border-white/10 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors cursor-pointer text-gray-300">
                        {isUploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                        {isUploadingLogo ? 'Enviando...' : 'Fazer Upload (R2)'}
                        <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={isUploadingLogo || isLoading} />
                      </label>
                      <p className="text-[11px] text-gray-500 mt-2">Formato recomendado: .webp, .png transparente. Proporção retangular.</p>
                    </div>
                  </div>
                </div>

                {/* Footer Logo Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                    Logotipo do Rodapé
                  </label>
                  <div className="flex items-center gap-4">
                    {siteLogoFooter ? (
                      <div className="relative w-24 h-24 bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden flex items-center justify-center">
                        <img src={siteLogoFooter} alt="Logo do rodapé" className="max-w-full max-h-full object-contain p-2" />
                        <button type="button" onClick={() => setSiteLogoFooter('')} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-xs text-white">
                          Remover
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-white/5 rounded-xl border border-white/10 border-dashed flex items-center justify-center text-gray-500">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                    <div className="flex-1">
                      <label className="flex items-center justify-center gap-2 px-4 py-2 bg-[#121212] border border-white/10 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors cursor-pointer text-gray-300">
                        {isUploadingLogoFooter ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                        {isUploadingLogoFooter ? 'Enviando...' : 'Fazer Upload (R2)'}
                        <input type="file" accept="image/*" className="hidden" onChange={handleLogoFooterUpload} disabled={isUploadingLogoFooter || isLoading} />
                      </label>
                      <p className="text-[11px] text-gray-500 mt-2">Opcional. Se vazio, o rodapé usa o logotipo principal. Aplicado em branco (fundo escuro).</p>
                    </div>
                  </div>
                </div>

                {/* Favicon Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                    Ícone da Aba (Favicon)
                  </label>
                  <div className="flex items-center gap-4">
                    {siteFavicon ? (
                      <div className="relative w-16 h-16 bg-white/5 rounded-xl border border-white/10 overflow-hidden flex items-center justify-center">
                        <img src={siteFavicon} alt="Favicon" className="max-w-full max-h-full object-contain p-2" />
                        <button type="button" onClick={() => setSiteFavicon('')} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-xs text-white">
                          Remover
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-white/5 rounded-xl border border-white/10 border-dashed flex items-center justify-center text-gray-500">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                    <div className="flex-1">
                      <label className="flex items-center justify-center gap-2 px-4 py-2 bg-[#121212] border border-white/10 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors cursor-pointer text-gray-300">
                        {isUploadingFavicon ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                        {isUploadingFavicon ? 'Enviando...' : 'Fazer Upload (R2)'}
                        <input type="file" accept="image/*" className="hidden" onChange={handleFaviconUpload} disabled={isUploadingFavicon || isLoading} />
                      </label>
                      <p className="text-[11px] text-gray-500 mt-2">Formato recomendado: .webp, .png, .ico. Proporção 1:1.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Nome do Site</label>
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="Ex: Moraes Tijolos Revestimento"
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Título SEO Padrão (Meta Title)</label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="Ex: Moraes Tijolos Revestimento | Tradição em Revestimentos"
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Descrição SEO Padrão (Meta Description)</label>
                  <textarea
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="Breve descrição do site para os motores de busca..."
                    rows={3}
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Palavras-chave SEO (Meta Keywords)</label>
                  <input
                    type="text"
                    value={seoKeywords}
                    onChange={(e) => setSeoKeywords(e.target.value)}
                    placeholder="revestimentos, sustentável, construção, decoração"
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving || isLoading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl border border-blue-400/20 transition-all text-sm flex items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
                  ) : (
                    <><Save className="w-4 h-4" /> Salvar Identidade do Site</>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
