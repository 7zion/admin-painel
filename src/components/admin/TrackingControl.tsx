import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Code, Check, CheckCircle2, Copy, AlertCircle, Save, Variable, Boxes } from 'lucide-react';

interface ScriptConfig {
  active: boolean;
  head: string;
  body?: string; // Optional for some scripts
  pixelId?: string; // Só usado pelo card meta-api
  testEventCode?: string; // Só usado pelo card meta-api
}

interface TrackingState {
  gtm: ScriptConfig;
  ga: ScriptConfig;
  'meta-pixel': ScriptConfig;
  'meta-api': ScriptConfig;
  'meta-domain': ScriptConfig;
  gsc: ScriptConfig;
}

const defaultState: TrackingState = {
  gtm: { active: false, head: '', body: '' },
  ga: { active: false, head: '' },
  'meta-pixel': { active: false, head: '', body: '' },
  'meta-api': { active: false, head: '', pixelId: '', testEventCode: '' },
  'meta-domain': { active: false, head: '' },
  gsc: { active: false, head: '' }
};

const cardsConfig: Array<{
  id: string;
  title: string;
  subtitle: string;
  description: string;
  hasBody: boolean;
  headLabel?: string;
}> = [
  {
    id: 'gtm',
    title: 'Google Tag Manager',
    subtitle: '<head> + <body> (noscript)',
    description: 'Container central para disparar todos os outros pixels/tags.',
    hasBody: true
  },
  {
    id: 'ga',
    title: 'Google Analytics (GA4)',
    subtitle: '<head>',
    description: 'Métricas de tráfego, audiência, conversões e comportamento (gtag.js).',
    hasBody: false
  },
  {
    id: 'meta-pixel',
    title: 'Meta Pixel (Facebook Pixel)',
    subtitle: '<head> + <body> (noscript)',
    description: 'Rastreamento de eventos para campanhas Meta Ads (Facebook/Instagram).',
    hasBody: true
  },
  {
    id: 'meta-api',
    title: 'Meta Conversions API',
    subtitle: 'Token + Pixel ID (envio automático)',
    description: 'Envia automaticamente pro Meta: clique no WhatsApp (Contact), envio do formulário de contato (Lead) e visualização de produto (ViewContent). Server-side, não é bloqueado por cookies/iOS.',
    hasBody: false,
    headLabel: 'Conversion API Token'
  },
  {
    id: 'meta-domain',
    title: 'Meta Domain Verification',
    subtitle: '<head> (meta tag)',
    description: 'Verifica propriedade do domínio no Meta Business.',
    hasBody: false
  },
  {
    id: 'gsc',
    title: 'Google Search Console',
    subtitle: '<head> (meta tag)',
    description: 'Verifica propriedade do domínio no GSC.',
    hasBody: false
  }
] as const;

export function TrackingControl() {
  const [settings, setSettings] = useState<TrackingState>(defaultState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from('settings').select('data').eq('id', 'tracking').maybeSingle();
      if (error) {
        console.error('Error fetching tracking settings:', error);
        setLoading(false);
        return;
      }
      if (data) setSettings({ ...defaultState, ...(data.data as Partial<TrackingState>) });
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel('tracking-control-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings', filter: 'id=eq.tracking' }, load)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleUpdate = (id: keyof TrackingState, field: keyof ScriptConfig, value: any) => {
    setSettings(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const saveSettings = async () => {
    if (saving) return; // Prevent double save
    setSaving(true);
    setSaveSuccess('');
    setError('');

    try {
      if (!settings) return;
      const { error: saveError } = await supabase.from('settings').upsert({ id: 'tracking', data: settings });
      if (saveError) throw saveError;
      setSaveSuccess('Configurações de rastreamento salvas com sucesso!');
      
      setTimeout(() => {
        setSaveSuccess('');
      }, 3000);
    } catch (err: any) {
      console.error('Error saving tracking settings:', err);
      setError(err.message || 'Ocorreu um erro ao salvar as configurações de rastreamento.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 border border-white/5 rounded-2xl bg-[#0a0a0a]">
         <div className="flex items-center gap-3 text-indigo-400 font-mono text-sm">
           <div className="w-5 h-5 border-t-2 border-indigo-400 rounded-full animate-spin"></div>
           Carregando configurações...
         </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Code className="w-8 h-8 text-indigo-400" />
            Rastreamento & Scripts
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Gerencie tags, pixels e scripts de verificação para SEO, campanhas e métricas.
          </p>
        </div>
        
        <button
          onClick={saveSettings}
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl border border-indigo-400/20 shadow-[0_0_20px_rgba(99,102,241,0.25)] flex items-center justify-center gap-2 transition-all hover:scale-[1.02] text-xs uppercase tracking-wider cursor-pointer disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin"></div>
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Salvar Configurações
            </>
          )}
        </button>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3 text-emerald-400 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{saveSuccess}</span>
        </div>
      )}
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-400 animate-in fade-in slide-in-from-top-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Grid of tracking cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {cardsConfig.map((card) => {
          const cardSettings = settings[card.id as keyof TrackingState];
          
          return (
            <div 
              key={card.id} 
              className={`bg-[#0a0a0a] border ${cardSettings.active ? 'border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.05)]' : 'border-white/10'} rounded-2xl overflow-hidden flex flex-col transition-colors duration-300`}
            >
              {/* Header do Card */}
              <div className={`p-5 border-b ${cardSettings.active ? 'border-indigo-500/20 bg-indigo-500/5' : 'border-white/5 bg-[#111]'} flex items-start justify-between gap-4`}>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    {card.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                      {card.id}
                    </span>
                    <span className="text-xs font-mono text-gray-500">
                      {card.subtitle}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-3 leading-relaxed max-w-lg">
                    {card.description}
                  </p>
                </div>
                
                {/* Toggle Ativo/Inativo */}
                <label className="flex items-center cursor-pointer flex-shrink-0 z-10" title={cardSettings.active ? "Desativar Script" : "Ativar Script"}>
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={cardSettings.active}
                      onChange={(e) => handleUpdate(card.id as keyof TrackingState, 'active', e.target.checked)}
                    />
                    <div className={`block w-12 h-7 rounded-full transition-colors ${cardSettings.active ? 'bg-indigo-600' : 'bg-gray-800 border border-gray-700'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${cardSettings.active ? 'transform translate-x-5' : ''}`}></div>
                  </div>
                  <span className={`ml-3 text-xs font-bold uppercase tracking-wider ${cardSettings.active ? 'text-indigo-400' : 'text-gray-500'}`}>
                    {cardSettings.active ? 'Ativo' : 'Inativo'}
                  </span>
                </label>
              </div>

              {/* Body do Card (Forms) */}
              <div className="p-5 flex-1 flex flex-col gap-5 bg-gradient-to-b from-[#0a0a0a] to-[#050505]">
                <div className="space-y-2 relative">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-1.5 bg-indigo-500/10 px-2 py-1 rounded w-fit">
                      <Variable className="w-3.5 h-3.5" /> 
                      {card.headLabel || 'Código para o <head>'}
                    </label>
                  </div>
                  <textarea
                    value={cardSettings.head}
                    onChange={(e) => handleUpdate(card.id as keyof TrackingState, 'head', e.target.value)}
                    placeholder={`Cole o ${card.headLabel ? card.headLabel : 'snippet / meta tag'} aqui...`}
                    className={`w-full bg-[#121212] border ${cardSettings.head ? 'border-indigo-500/30' : 'border-white/10'} rounded-xl px-4 py-3 text-xs text-green-400/80 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-h-[100px] resize-y`}
                    spellCheck="false"
                  />
                </div>

                {card.id === 'meta-api' && (
                  <div className="space-y-4 mt-2 pt-5 border-t border-white/5">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-amber-300 uppercase tracking-widest flex items-center gap-1.5 bg-amber-500/10 px-2 py-1 rounded w-fit">
                        Pixel ID
                      </label>
                      <input
                        type="text"
                        value={cardSettings.pixelId || ''}
                        onChange={(e) => handleUpdate('meta-api', 'pixelId', e.target.value)}
                        placeholder="Ex: 123456789012345"
                        className={`w-full bg-[#121212] border ${cardSettings.pixelId ? 'border-amber-500/30' : 'border-white/10'} rounded-xl px-4 py-3 text-xs text-green-400/80 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all`}
                        spellCheck="false"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-amber-300 uppercase tracking-widest flex items-center gap-1.5 bg-amber-500/10 px-2 py-1 rounded w-fit">
                        Test Event Code
                      </label>
                      <input
                        type="text"
                        value={cardSettings.testEventCode || ''}
                        onChange={(e) => handleUpdate('meta-api', 'testEventCode', e.target.value)}
                        placeholder="Ex: TEST12345 (cole aqui pra ver os eventos na aba Test Events do Meta)"
                        className={`w-full bg-[#121212] border ${cardSettings.testEventCode ? 'border-amber-500/30' : 'border-white/10'} rounded-xl px-4 py-3 text-xs text-green-400/80 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all`}
                        spellCheck="false"
                      />
                      <p className="text-[10px] text-gray-500">
                        Deixe em branco depois de testar — com o código preenchido, os eventos só aparecem na aba de testes do Meta e não contam pra suas campanhas reais.
                      </p>
                    </div>
                  </div>
                )}

                {card.hasBody && (
                  <div className="space-y-2 relative mt-2 pt-5 border-t border-white/5">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] font-bold text-emerald-300 uppercase tracking-widest flex items-center gap-1.5 bg-emerald-500/10 px-2 py-1 rounded w-fit">
                        <Boxes className="w-3.5 h-3.5" /> Código para o &lt;body&gt; (noscript)
                      </label>
                    </div>
                    <textarea
                      value={cardSettings.body || ''}
                      onChange={(e) => handleUpdate(card.id as keyof TrackingState, 'body', e.target.value)}
                      placeholder="Cole o código <noscript> ou body tag aqui..."
                      className={`w-full bg-[#121212] border ${cardSettings.body ? 'border-emerald-500/30' : 'border-white/10'} rounded-xl px-4 py-3 text-xs text-green-400/80 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all min-h-[80px] resize-y`}
                      spellCheck="false"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
