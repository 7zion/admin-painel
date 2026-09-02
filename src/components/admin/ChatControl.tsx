import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { ChatMessage, ChatSession, AiAgentConfig } from '../../types/chat';
import { Settings, MessageSquare, User, Send, Bot, StopCircle, PlayCircle, Loader2, UploadCloud, FileText, Trash2, Archive, MessageSquareOff, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';

export function ChatControl() {
  const [activeTab, setActiveTab] = useState<'conversations' | 'agentConfig' | 'archived' | 'widgets'>('conversations');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  const [agentConfig, setAgentConfig] = useState<AiAgentConfig>({
    isActive: false,
    agentName: 'Atendimento',
    agentAvatarUrl: '',
    systemPrompt: 'Você é um assistente virtual atencioso, profissional e humano da 7Zion Agência. Responda as dúvidas com clareza.',
    pdfUrls: [],
    tone: 'profissional',
    messageLength: 'medias',
    useEmojis: true,
    suggestedMessages: ['Olá, quero saber mais!', 'Quais serviços vocês oferecem?', 'Gostaria de um orçamento.']
  });

  const [widgetConfig, setWidgetConfig] = useState<any>({
    chatEnabled: true,
    whatsappEnabled: true,
    chatPosition: 'right' as 'left' | 'right',
    whatsappPosition: 'left' as 'left' | 'right',
    whatsappStyle: 'sidebar' as 'sidebar' | 'circle',
    whatsappNumber: '5511995038661',
    whatsappMessage: ''
  });
  
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [selectedArchived, setSelectedArchived] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const deleteSessionAndMessages = async (sessionId: string) => {
    try {
      // chat_messages tem ON DELETE CASCADE em session_id, mas apagamos explicitamente
      // para não depender só disso.
      await supabase.from('chat_messages').delete().eq('session_id', sessionId);
      await supabase.from('chat_sessions').delete().eq('id', sessionId);
    } catch(err) {
      console.error("Error deleting session:", err);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedArchived.length === 0) return;
    if (!window.confirm(`Tem certeza de que deseja excluir permanentemente ${selectedArchived.length} conversa(s)? Esta ação não pode ser desfeita.`)) return;

    setIsDeleting(true);
    try {
      for (const id of selectedArchived) {
        await deleteSessionAndMessages(id);
      }
      setSelectedArchived([]);
      if (activeSession && selectedArchived.includes(activeSession.id)) {
         setActiveSession(null);
      }
    } catch(err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSingle = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Tem certeza de que deseja excluir permanentemente esta conversa? Esta ação não pode ser desfeita.`)) return;
    setIsDeleting(true);
    try {
      await deleteSessionAndMessages(sessionId);
      if (activeSession?.id === sessionId) setActiveSession(null);
      setSelectedArchived(prev => prev.filter(id => id !== sessionId));
    } catch(err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSelectSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedArchived(prev => 
      prev.includes(sessionId) 
        ? prev.filter(id => id !== sessionId) 
        : [...prev, sessionId]
    );
  };
  
  const sessionRowToApp = (row: any): ChatSession => ({
    id: row.id,
    visitorId: row.visitor_id,
    createdAt: new Date(row.created_at).getTime(),
    lastMessage: row.last_message,
    lastMessageAt: row.last_message_at ? new Date(row.last_message_at).getTime() : Date.now(),
    status: row.status,
    agentEnabled: row.agent_enabled,
    utmParams: row.utm_params,
  });

  const messageRowToApp = (row: any): ChatMessage => ({
    id: row.id,
    sessionId: row.session_id,
    sender: row.sender,
    text: row.text,
    createdAt: new Date(row.created_at).getTime(),
  });

  // Load agent config
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('settings').select('data').eq('id', 'ai_agent').maybeSingle();
      if (data) setAgentConfig(data.data as AiAgentConfig);
      setLoadingConfig(false);
    };
    load();
    const channel = supabase
      .channel('chat-control-agent-config')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings', filter: 'id=eq.ai_agent' }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Load widget config
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('settings').select('data').eq('id', 'widgets').maybeSingle();
      if (data) setWidgetConfig(data.data);
    };
    load();
    const channel = supabase
      .channel('chat-control-widget-config')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings', filter: 'id=eq.widgets' }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Load chat sessions
  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from('chat_sessions').select('*').order('last_message_at', { ascending: false });
      if (error) { console.error('Error loading chat_sessions:', error); return; }
      setSessions((data || []).map(sessionRowToApp));
    };
    load();
    const channel = supabase
      .channel('chat-control-sessions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_sessions' }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Load messages for active session
  useEffect(() => {
    if (!activeSession) {
      setMessages([]);
      return;
    }
    const load = async () => {
      const { data, error } = await supabase.from('chat_messages').select('*').eq('session_id', activeSession.id).order('created_at', { ascending: true });
      if (error) { console.error('Error loading chat_messages:', error); return; }
      setMessages((data || []).map(messageRowToApp));
      setTimeout(() => scrollToBottom(), 100);
    };
    load();
    const channel = supabase
      .channel(`chat-control-messages-${activeSession.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages', filter: `session_id=eq.${activeSession.id}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeSession?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const [isTestingAgent, setIsTestingAgent] = useState(false);
  const [agentTestResult, setAgentTestResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleTestAgentConnection = async () => {
    setIsTestingAgent(true);
    setAgentTestResult(null);
    try {
      const { data: geminiRow } = await supabase.from('system_config').select('data').eq('id', 'gemini').maybeSingle();
      const apiKey = geminiRow?.data?.apiKey || '';

      if (!apiKey) {
        setAgentTestResult({ type: 'error', text: 'Nenhuma chave de API do Gemini configurada. Adicione uma em Configurações > Inteligência Artificial.' });
        return;
      }

      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Responda apenas: CONEXAO_ESTABELECIDA',
          history: [],
          systemPrompt: agentConfig.systemPrompt || 'Você é um assistente de testes.',
          apiKey,
        }),
      });

      const data = await response.json() as any;

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Falha na conexão com o agente.');
      }

      setAgentTestResult({ type: 'success', text: `Conexão com o Gemini funcionando! Resposta de teste do agente: "${data.result}"` });
    } catch (err: any) {
      console.error('AGENT TEST ERROR:', err);
      setAgentTestResult({ type: 'error', text: err?.message || 'Erro ao testar conexão com o agente.' });
    } finally {
      setIsTestingAgent(false);
    }
  };

  const saveConfig = async () => {
    setSavingConfig(true);
    try {
      if (activeTab === 'agentConfig') {
        const { error } = await supabase.from('settings').upsert({ id: 'ai_agent', data: agentConfig });
        if (error) throw error;
        alert("Configurações do Agente salvas com sucesso!");
      } else if (activeTab === 'widgets') {
        const { error } = await supabase.from('settings').upsert({ id: 'widgets', data: widgetConfig });
        if (error) throw error;
        alert("Configurações dos Widgets salvas com sucesso!");
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar!");
    }
    setSavingConfig(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeSession) return;

    const text = newMessage;
    setNewMessage('');

    // Add msg
    await supabase.from('chat_messages').insert({
      session_id: activeSession.id,
      sender: 'admin',
      text,
    });

    // Update session
    await supabase.from('chat_sessions').update({
      last_message: text,
      last_message_at: new Date().toISOString(),
      // optionally turning off agent when admin steps in?
      // agent_enabled: false
    }).eq('id', activeSession.id);
  };

  const toggleAgentControl = async () => {
    if (!activeSession) return;
    await supabase.from('chat_sessions').update({
      agent_enabled: !activeSession.agentEnabled
    }).eq('id', activeSession.id);
    setActiveSession({...activeSession, agentEnabled: !activeSession.agentEnabled});
  };

  const toggleArchive = async () => {
    if (!activeSession) return;
    const newStatus = activeSession.status === 'archived' ? 'active' : 'archived';
    await supabase.from('chat_sessions').update({
      status: newStatus
    }).eq('id', activeSession.id);
    setActiveSession({...activeSession, status: newStatus});
    // Remove from current view context right away
    if (activeTab === 'conversations' && newStatus === 'archived') {
      setActiveSession(null);
    } else if (activeTab === 'archived' && newStatus === 'active') {
      setActiveSession(null);
    }
  };

  const filteredSessions = sessions.filter(s => activeTab === 'archived' ? s.status === 'archived' : s.status !== 'archived');

  const toggleSelectAll = () => {
    if (selectedArchived.length === filteredSessions.length) {
      setSelectedArchived([]);
    } else {
      setSelectedArchived(filteredSessions.map(s => s.id));
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col pb-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-purple-500" />
            Central de Atendimento
          </h1>
          <p className="text-gray-400 text-sm mt-1">Converse com os visitantes em tempo real e gerencie o Agente de IA.</p>
        </div>
        
        <div className="flex bg-[#121214] p-1 rounded-xl border border-white/5 overflow-hidden">
          <button 
            onClick={() => {setActiveTab('conversations'); setActiveSession(null)}}
            className={`px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all duration-300 ${activeTab === 'conversations' ? 'bg-[#2a2a2d] text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <MessageSquare className={`w-4 h-4 ${activeTab === 'conversations' ? 'text-purple-400' : ''}`} /> Conversas
          </button>
          <button 
            onClick={() => {setActiveTab('archived'); setActiveSession(null)}}
            className={`px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all duration-300 ${activeTab === 'archived' ? 'bg-[#2a2a2d] text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Archive className={`w-4 h-4 ${activeTab === 'archived' ? 'text-purple-400' : ''}`} /> Arquivados
          </button>
          <div className="w-[1px] bg-white/5 mx-2 my-2"></div>
          <button 
            onClick={() => {setActiveTab('agentConfig'); setActiveSession(null)}}
            className={`px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all duration-300 ${activeTab === 'agentConfig' ? 'bg-[#2a2a2d] text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Bot className={`w-4 h-4 ${activeTab === 'agentConfig' ? 'text-purple-400' : ''}`} /> Inteligência Artificial
          </button>
          <button 
            onClick={() => {setActiveTab('widgets'); setActiveSession(null)}}
            className={`px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all duration-300 ${activeTab === 'widgets' ? 'bg-[#2a2a2d] text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Settings className={`w-4 h-4 ${activeTab === 'widgets' ? 'text-purple-400' : ''}`} /> Módulos & Widgets
          </button>
        </div>
      </div>

      {activeTab === 'agentConfig' && (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 flex-1 overflow-y-auto">
          <h2 className="text-xl font-bold text-white mb-6">Treinamento do Agente IA</h2>
          
          <div className="space-y-6 max-w-3xl">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
              <div>
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Bot className="w-4 h-4 text-indigo-400" /> Atendimento via IA Ativado Globalmente
                </h3>
                <p className="text-sm text-gray-400 mt-1">Quando ativado, a IA responde automaticamente aos novos chats até um admin intervir.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={agentConfig.isActive}
                  onChange={(e) => setAgentConfig({...agentConfig, isActive: e.target.checked})}
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
              </label>
            </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Nome do Agente (Chat)</label>
                <input 
                  type="text"
                  placeholder="Ex: Ana, Atendente Virtual..."
                  value={agentConfig.agentName || ''}
                  onChange={(e) => setAgentConfig({ ...agentConfig, agentName: e.target.value })}
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">URL da Foto do Agente</label>
                <input 
                  type="text"
                  placeholder="https://..."
                  value={agentConfig.agentAvatarUrl || ''}
                  onChange={(e) => setAgentConfig({ ...agentConfig, agentAvatarUrl: e.target.value })}
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Tom de Voz</label>
                <select 
                  value={agentConfig.tone}
                  onChange={(e) => setAgentConfig({ ...agentConfig, tone: e.target.value })}
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                >
                  <option value="profissional">Profissional e Direto</option>
                  <option value="amigável">Amigável e Acolhedor</option>
                  <option value="descontraído">Descontraído e Jovem</option>
                  <option value="formal">Muito Formal</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Tamanho das Mensagens</label>
                <select 
                  value={agentConfig.messageLength}
                  onChange={(e) => setAgentConfig({ ...agentConfig, messageLength: e.target.value })}
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                >
                  <option value="curtas">Curtas e Objetivas</option>
                  <option value="medias">Tamanho Médio</option>
                  <option value="longas">Longas e Detalhadas</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Uso de Emojis</label>
                <select 
                  value={agentConfig.useEmojis ? 'sim' : 'nao'}
                  onChange={(e) => setAgentConfig({ ...agentConfig, useEmojis: e.target.value === 'sim' })}
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                >
                  <option value="sim">Permitido 😊</option>
                  <option value="nao">Não usar emojis</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Mensagens de Inicialização (Separadas por vírgula)</label>
              <input 
                type="text"
                value={(agentConfig.suggestedMessages || []).join(', ')}
                onChange={(e) => {
                  const msgs = e.target.value.split(',').map(m => m.trim()).filter(m => m);
                  setAgentConfig({ ...agentConfig, suggestedMessages: msgs });
                }}
                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                placeholder="Ex: Olá, quero saber mais, Quais os serviços..."
              />
              <p className="text-xs text-gray-500 mt-2">Botões que os usuários podem clicar ao abrir o chat pela primeira vez.</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-gray-300">Prompt de Sistema (Regras e Comportamento)</label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setAgentConfig({ ...agentConfig, systemPrompt: agentConfig.systemPrompt + (agentConfig.systemPrompt ? '\n\n' : '') + 'LEITURA DE CONTEXTO GLOBAL:\nSempre analise o conteúdo de todas as páginas do site fornecido como contexto para formar sua resposta de forma precisa, coesa e alinhada à empresa.' })}
                  className="bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg p-3 text-left transition-all group"
                >
                  <p className="text-purple-400 font-bold text-xs mb-1 group-hover:text-purple-300">Ler o Site (Fonte da Verdade)</p>
                  <p className="text-gray-400 text-[10px] leading-tight">Instrui a IA a sempre vasculhar todas as informações do site antes de responder.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setAgentConfig({ ...agentConfig, systemPrompt: agentConfig.systemPrompt + (agentConfig.systemPrompt ? '\n\n' : '') + 'ANTI-ALUCINAÇÃO ESTRITO:\nRESPONDA APENAS com base no contexto fornecido. Se a resposta não estiver no site ou nos documentos fornecidos, você DEVE dizer "Não tenho essa informação no momento, deseja que eu encaminhe a um atendente humano?". NUNCA invente, deduza ou crie informações.' })}
                  className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg p-3 text-left transition-all group"
                >
                  <p className="text-emerald-400 font-bold text-xs mb-1 group-hover:text-emerald-300">Anti-alucinação Restrito</p>
                  <p className="text-gray-400 text-[10px] leading-tight">Previne que o agente invente respostas quando não souber algo.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setAgentConfig({ ...agentConfig, systemPrompt: agentConfig.systemPrompt + (agentConfig.systemPrompt ? '\n\n' : '') + 'ESCOPO COMERCIAL (SEM PREÇOS):\nNUNCA forneça orçamentos, cotações finais ou precificação que não estejam explicitamente públicos no site. Para fechar negócios, conduza o usuário para o atendimento humano.' })}
                  className="bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 rounded-lg p-3 text-left transition-all group"
                >
                  <p className="text-orange-400 font-bold text-xs mb-1 group-hover:text-orange-300">Proibir Orçamentos Falsos</p>
                  <p className="text-gray-400 text-[10px] leading-tight">Obriga o bot a transferir para humanos antes de falar valores.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setAgentConfig({ ...agentConfig, systemPrompt: agentConfig.systemPrompt + (agentConfig.systemPrompt ? '\n\n' : '') + 'ESCOPO DE NEGÓCIO FECHADO:\nATENÇÃO: Você só pode falar sobre assuntos estritamente relacionados aos produtos e serviços da empresa. Recuse educadamente qualquer pergunta fora do escopo de negócios, curiosidades, ideias aleatórias ou assuntos gerais.' })}
                  className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg p-3 text-left transition-all group"
                >
                  <p className="text-blue-400 font-bold text-xs mb-1 group-hover:text-blue-300">Foco Total na Empresa</p>
                  <p className="text-gray-400 text-[10px] leading-tight">Evite que usuários usem o bot para bater papo ou ideias fora do escopo.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setAgentConfig({ ...agentConfig, systemPrompt: agentConfig.systemPrompt + (agentConfig.systemPrompt ? '\n\n' : '') + 'COMPORTAMENTO E TOM DE VOZ:\nAssuma uma persona de Vendedor Consultivo. Seja extremamente educado, persuasivo e empático. Conduza sutilmente a conversa para mostrar o valor dos nossos produtos/serviços e finalize as falas incentivando o avanço na jornada de compra.' })}
                  className="bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 rounded-lg p-3 text-left transition-all group"
                >
                  <p className="text-pink-400 font-bold text-xs mb-1 group-hover:text-pink-300">Tom: Vendedor Persuasivo</p>
                  <p className="text-gray-400 text-[10px] leading-tight">Instrui o agente a ser um vendedor prestativo e focar na conversão.</p>
                </button>
                
                <button
                  type="button"
                  onClick={() => setAgentConfig({ ...agentConfig, systemPrompt: agentConfig.systemPrompt + (agentConfig.systemPrompt ? '\n\n' : '') + 'FORMATAÇÃO EXIGIDA:\nSempre que possível, use respostas curtas. Ao listar benefícios ou serviços, use *bullet points*. Destaque palavras-chave importantes em **negrito** para facilitar a leitura dinâmica.' })}
                  className="bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 rounded-lg p-3 text-left transition-all group"
                >
                  <p className="text-teal-400 font-bold text-xs mb-1 group-hover:text-teal-300">Formatação Escaneável</p>
                  <p className="text-gray-400 text-[10px] leading-tight">Garante o uso de negritos formatação visual fácil de ler.</p>
                </button>
              </div>

              <textarea 
                value={agentConfig.systemPrompt}
                onChange={(e) => setAgentConfig({ ...agentConfig, systemPrompt: e.target.value })}
                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 transition-all h-64 resize-y font-mono text-sm leading-relaxed whitespace-pre-wrap"
                placeholder="Descreva a personalidade do agente ou adicione regras usando os botões acima..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Documentos de Conhecimento (PDFs, TXT)</label>
              <div className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
                <UploadCloud className="w-8 h-8 text-gray-400 mb-3" />
                <p className="text-sm text-gray-300 font-medium">Clique para fazer upload de PDFs</p>
                <p className="text-xs text-gray-500 mt-1">Isso alimentará o knowledge base do agente.</p>
              </div>
              {/* Future feature: Upload to R2 and list them here */}
            </div>

            {agentTestResult && (
              <div className={`mt-6 p-4 rounded-xl font-medium text-sm flex items-start gap-3 ${
                agentTestResult.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}>
                {agentTestResult.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <ShieldAlert className="w-5 h-5 flex-shrink-0" />}
                <span className="leading-snug">{agentTestResult.text}</span>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleTestAgentConnection}
                disabled={isTestingAgent || savingConfig}
                className="bg-white/5 hover:bg-white/10 text-gray-300 font-bold px-6 py-3 rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTestingAgent ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Testando...</>
                ) : (
                  <><Sparkles className="w-4 h-4 text-indigo-400" /> Testar Conexão</>
                )}
              </button>
              <button
                onClick={saveConfig}
                disabled={savingConfig}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingConfig ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar Configurações da IA'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'widgets' && (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 flex-1 overflow-y-auto">
          <h2 className="text-xl font-bold text-white mb-6">Módulos & Widgets de Contato</h2>
          
          <div className="space-y-8 max-w-3xl">
            {/* Chatbot Widget Config */}
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <MessageSquare size={18} className="text-purple-400" /> Chat Interativo
                  </h3>
                  <p className="text-sm text-gray-400">Balão flutuante na página para iniciar o Chatbot com IA.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={widgetConfig.chatEnabled}
                    onChange={(e) => setWidgetConfig({...widgetConfig, chatEnabled: e.target.checked})}
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                </label>
              </div>

              {widgetConfig.chatEnabled && (
                <div className="mt-4">
                  <label className="block text-sm font-bold text-gray-300 mb-2">Posição na Tela</label>
                  <select 
                    value={widgetConfig.chatPosition}
                    onChange={(e) => setWidgetConfig({ ...widgetConfig, chatPosition: e.target.value as 'left'|'right' })}
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 transition-all text-sm"
                  >
                    <option value="right">Canto Inferior Direito</option>
                    <option value="left">Canto Inferior Esquerdo</option>
                  </select>
                </div>
              )}
            </div>

            {/* WhatsApp Widget Config */}
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <MessageSquare size={18} className="text-emerald-400" /> Botão WhatsApp
                  </h3>
                  <p className="text-sm text-gray-400">Botão clássico do WhatsApp na lateral da página.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={widgetConfig.whatsappEnabled}
                    onChange={(e) => setWidgetConfig({...widgetConfig, whatsappEnabled: e.target.checked})}
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {widgetConfig.whatsappEnabled && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Posição na Tela</label>
                    <select 
                      value={widgetConfig.whatsappPosition}
                      onChange={(e) => setWidgetConfig({ ...widgetConfig, whatsappPosition: e.target.value as 'left'|'right' })}
                      className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                    >
                      <option value="left">Canto Inferior Esquerdo</option>
                      <option value="right">Canto Inferior Direito</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Número do WhatsApp (apenas números)</label>
                    <input 
                      type="text" 
                      value={widgetConfig.whatsappNumber}
                      onChange={(e) => setWidgetConfig({...widgetConfig, whatsappNumber: e.target.value})}
                      placeholder="Ex: 5511999999999"
                      className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Mensagem Padrão (Opcional)</label>
                    <input 
                      type="text" 
                      value={widgetConfig.whatsappMessage || ''}
                      onChange={(e) => setWidgetConfig({...widgetConfig, whatsappMessage: e.target.value})}
                      placeholder="Ex: Olá, vim pelo site e gostaria de saber mais..."
                      className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 transition-all text-sm placeholder-gray-600"
                    />
                    <p className="text-gray-500 text-xs mt-1">Essa mensagem já vem escrita quando o cliente abre o WhatsApp.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Tracking Instructions */}
            <div className="bg-indigo-900/20 p-6 rounded-2xl border border-indigo-500/20 mt-8">
               <h3 className="font-bold text-indigo-400 mb-2">Tagueamento Google Ads & GTM</h3>
               <p className="text-sm text-gray-300 mb-4 items-center">
                 Os botões disparam eventos customizados no Analytics. O Chat dispara <code>chat_widget_click</code> e o WhatsApp dispara <code>whatsapp_click</code>. Para campanhas:
               </p>
               <ol className="list-decimal pl-5 text-sm space-y-2 text-gray-400">
                 <li>Instale o snippet do <strong>Google Tag Manager</strong> em "Tracking".</li>
                 <li>Acesse sua conta do GTM e crie <strong>Acionadores de Evento Personalizado</strong> com os nomes de evento: <code>chat_widget_click</code> e/ou <code>whatsapp_click</code></li>
                 <li>Associe disparos das suas tags de Conversão do Google Ads / Meta Ads a estes acionadores.</li>
                 <li>As variáveis do evento contêm <code>buttonPosition: 'floating_widget'</code>.</li>
               </ol>
            </div>

            <button 
              onClick={saveConfig}
              disabled={savingConfig}
              className="mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl transition-all w-full flex items-center justify-center gap-2"
            >
              {savingConfig ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar Configurações de Widgets'}
            </button>
          </div>
        </div>
      )}

      {(activeTab === 'conversations' || activeTab === 'archived') && (
        <div className="flex flex-1 overflow-hidden bg-[#050505] border border-white/5 rounded-2xl shadow-xl">
          {/* Chat List (Sidebar) */}
          <div className="w-1/3 border-r border-white/5 flex flex-col bg-[#0a0a0a]">
            <div className="p-4 border-b border-white/5 flex flex-col gap-3">
              <input 
                type="text" 
                placeholder={`Buscar em ${activeTab === 'archived' ? 'arquivos' : 'conversas'}...`}
                className="w-full bg-[#121212] border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500/50 text-white"
              />
              {activeTab === 'archived' && filteredSessions.length > 0 && (
                <div className="flex items-center justify-between bg-white/5 p-2 rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded border-white/20 bg-transparent text-purple-500 focus:ring-purple-500"
                      checked={selectedArchived.length > 0 && selectedArchived.length === filteredSessions.length}
                      onChange={toggleSelectAll}
                    />
                    <span className="text-xs text-gray-300 font-medium">
                      Selecionar todos
                    </span>
                  </label>
                  {selectedArchived.length > 0 && (
                    <button 
                      onClick={handleBulkDelete}
                      disabled={isDeleting}
                      className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-2 py-1 rounded transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3 h-3" />
                      {isDeleting ? 'Excluindo...' : `Excluir (${selectedArchived.length})`}
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredSessions.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">
                  {activeTab === 'archived' ? 'Nenhuma conversa arquivada.' : 'Nenhuma conversa ativa no momento.'}
                </div>
              ) : (
                filteredSessions.map(session => (
                  <div
                    key={session.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setActiveSession(session)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveSession(session); }}
                    className={`w-full text-left p-4 border-b border-white/5 transition-all hover:bg-white/5 flex items-start gap-3 cursor-pointer ${activeSession?.id === session.id ? 'bg-white/10 border-l-2 border-l-purple-500' : ''}`}
                  >
                    {activeTab === 'archived' && (
                      <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          className="rounded border-white/20 bg-transparent text-purple-500 focus:ring-purple-500"
                          checked={selectedArchived.includes(session.id)}
                          onChange={(e) => toggleSelectSession(session.id, e as any)}
                        />
                      </div>
                    )}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-white text-sm truncate">Visitante {session.visitorId.substring(0,6)}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-500">{new Date(session.lastMessageAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          {activeTab === 'archived' && (
                             <button
                               onClick={(e) => handleDeleteSingle(session.id, e)}
                               className="text-gray-500 hover:text-red-400 transition-colors"
                               title="Excluir Permanentemente"
                             >
                               <Trash2 className="w-3 h-3" />
                             </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 truncate">{session.lastMessage}</p>
                      {session.agentEnabled && (
                        <div className="flex items-center gap-1 mt-2 text-[10px] text-indigo-400 font-medium">
                          <Bot className="w-3 h-3" /> IA no Controle
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Chat Area */}
          <div className="flex-1 flex flex-col relative bg-[#111] overflow-hidden">
            {activeSession ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-white/5 bg-[#0a0a0a] flex justify-between items-center z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">Visitante {activeSession.visitorId.substring(0,6)}</h3>
                      <p className="text-xs text-emerald-400 flex items-center gap-2">
                        Online
                        {activeSession.utmParams?.source && (
                          <span className="text-gray-400 ml-2 px-2 py-0.5 bg-white/5 rounded-md text-[10px]">
                            Origem: {activeSession.utmParams.source} • {activeSession.utmParams.campaign || 'Sem campanha'}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={toggleAgentControl}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeSession.agentEnabled ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'}`}
                    >
                      {activeSession.agentEnabled ? (
                        <><StopCircle className="w-4 h-4" /> Parar IA (Assumir)</>
                      ) : (
                        <><Bot className="w-4 h-4" /> IA Atendendo</>
                      )}
                    </button>
                    
                    <button 
                      onClick={toggleArchive}
                      title={activeSession.status === 'archived' ? 'Desarquivar' : 'Arquivar'}
                      className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${activeSession.status === 'archived' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ backgroundImage: 'radial-gradient(circle at center, #1a1a2e 0%, #111 100%)' }}>
                  {messages.map(msg => {
                    const isSystemOrAdmin = msg.sender === 'agent' || msg.sender === 'admin';
                    return (
                      <div key={msg.id} className={`flex flex-col max-w-[70%] ${isSystemOrAdmin ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                        <div className={`p-3 rounded-2xl text-sm ${
                          msg.sender === 'admin' ? 'bg-purple-600 text-white rounded-tr-none' : 
                          msg.sender === 'agent' ? 'bg-indigo-600 text-white rounded-tr-none' : 
                          'bg-[#222] text-white rounded-tl-none border border-white/5'
                        }`}>
                          {msg.text}
                        </div>
                        <div className="flex items-center gap-1 mt-1 px-1">
                          {msg.sender === 'agent' && <Bot className="w-3 h-3 text-indigo-400" />}
                          <span className="text-[10px] text-gray-500">
                            {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            {' • '}{msg.sender === 'agent' ? 'Agente de IA' : msg.sender === 'admin' ? 'Suporte' : 'Visitante'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-[#0a0a0a] border-t border-white/5">
                  {activeSession.agentEnabled && (
                    <div className="mb-3 text-xs bg-indigo-500/10 text-indigo-400 px-3 py-2 rounded-lg border border-indigo-500/20 flex items-center justify-between">
                      <span className="flex items-center gap-2"><Bot className="w-4 h-4"/> A IA está no controle deste atendimento. Mensagens enviadas agora desativarão a IA para este chat.</span>
                    </div>
                  )}
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input 
                      type="text" 
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      placeholder="Escreva sua mensagem..." 
                      className="flex-1 bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                    <button 
                      type="submit" 
                      disabled={!newMessage.trim()}
                      className="bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center group"
                    >
                      <Send className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                <MessageSquare className="w-16 h-16 opacity-20 mb-4" />
                <p>Selecione uma conversa para iniciar o atendimento</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
