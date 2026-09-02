import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { ChatMessage, ChatSession, AiAgentConfig, WidgetConfig } from '../../types/chat';
import { MessageCircle, X, Send, Bot, Loader2 } from 'lucide-react';
import { trackEvent } from '../../lib/analytics';
import { useSettingsContext } from '../../lib/settings-context';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sessionInfo, setSessionInfo] = useState<ChatSession | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [agentConfig, setAgentConfig] = useState<AiAgentConfig | null>(null);
  const { widgetSettings: widgetConfig } = useSettingsContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load Agent Config
  useEffect(() => {
    const loadAgentConfig = async () => {
      const { data, error } = await supabase.from('settings').select('data').eq('id', 'ai_agent').maybeSingle();
      if (error) {
        console.error('Error loading settings/ai_agent:', error);
        return;
      }
      if (data) setAgentConfig(data.data as AiAgentConfig);
    };
    loadAgentConfig();

    const channel = supabase
      .channel('chat-widget-agent-config')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings', filter: "id=eq.ai_agent" }, loadAgentConfig)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Initialize or resume session
  useEffect(() => {
    // Chat desativado no painel: não cria sessão anônima nem inscreve em canais
    // realtime para o visitante à toa (o backend também bloqueia isso via RLS).
    if (widgetConfig && widgetConfig.chatEnabled === false) return;

    let messagesChannel: ReturnType<typeof supabase.channel> | null = null;
    let sessionChannel: ReturnType<typeof supabase.channel> | null = null;

    const rowToMessage = (row: any): ChatMessage => ({
      id: row.id,
      sessionId: row.session_id,
      sender: row.sender,
      text: row.text,
      createdAt: new Date(row.created_at).getTime(),
    });

    const rowToSession = (row: any): ChatSession => ({
      id: row.id,
      visitorId: row.visitor_id,
      createdAt: new Date(row.created_at).getTime(),
      lastMessage: row.last_message,
      lastMessageAt: row.last_message_at ? new Date(row.last_message_at).getTime() : Date.now(),
      status: row.status,
      agentEnabled: row.agent_enabled,
      utmParams: row.utm_params,
    });

    const initAuth = async () => {
      let { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) {
          console.error('Failed to sign in anonymously', error);
          return;
        }
        ({ data: { session } } = await supabase.auth.getSession());
      }
      if (!session) return;

      const uid = session.user.id;
      setSessionId(uid);

      const ensureSession = async () => {
        const { data: existing } = await supabase.from('chat_sessions').select('*').eq('id', uid).maybeSingle();
        if (existing) {
          setSessionInfo(rowToSession(existing));
        } else {
          const { data: created } = await supabase.from('chat_sessions').upsert({
            id: uid,
            visitor_id: uid,
            last_message: '',
            last_message_at: new Date().toISOString(),
            status: 'active',
            agent_enabled: true,
            utm_params: {
              source: new URLSearchParams(window.location.search).get('utm_source'),
              medium: new URLSearchParams(window.location.search).get('utm_medium'),
              campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
              term: new URLSearchParams(window.location.search).get('utm_term'),
              content: new URLSearchParams(window.location.search).get('utm_content'),
              url: window.location.href
            }
          }).select().maybeSingle();
          if (created) setSessionInfo(rowToSession(created));
        }
      };

      await ensureSession();

      sessionChannel = supabase
        .channel(`chat-session-${uid}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_sessions', filter: `id=eq.${uid}` }, (payload) => {
          if (payload.new) setSessionInfo(rowToSession(payload.new));
        })
        .subscribe();

      const loadMessages = async () => {
        const { data, error } = await supabase.from('chat_messages').select('*').eq('session_id', uid).order('created_at', { ascending: true });
        if (error) {
          console.error('Error loading chat_messages:', error);
          return;
        }
        setMessages((data || []).map(rowToMessage));
        setTimeout(() => scrollToBottom(), 100);
      };
      await loadMessages();

      messagesChannel = supabase
        .channel(`chat-messages-${uid}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages', filter: `session_id=eq.${uid}` }, loadMessages)
        .subscribe();
    };

    initAuth();

    return () => {
      if (messagesChannel) supabase.removeChannel(messagesChannel);
      if (sessionChannel) supabase.removeChannel(sessionChannel);
    };
  }, [widgetConfig?.chatEnabled]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessageDirect = async (text: string) => {
    if (!text.trim() || !sessionId) return;

    // Save visitor message
    await supabase.from('chat_messages').insert({
      session_id: sessionId,
      sender: 'visitor',
      text,
    });

    await supabase.from('chat_sessions').update({
      last_message: text,
      last_message_at: new Date().toISOString(),
    }).eq('id', sessionId);

    if (sessionInfo?.agentEnabled) {
      handleAgentResponse(text);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = newMessage;
    setNewMessage('');
    handleSendMessageDirect(text);
  };

  const handleAgentResponse = async (visitorMessage: string) => {
    setIsTyping(true);
    try {
      if (!agentConfig || !agentConfig.isActive) {
        setIsTyping(false);
        return; 
      }

      // Fetch API Key from Supabase (priority)
      let apiKey = '';
      try {
        const { data: geminiRow } = await supabase.from('system_config').select('data').eq('id', 'gemini').maybeSingle();
        apiKey = geminiRow?.data?.apiKey || '';
      } catch (e) { console.warn('Erro ao ler chave de API para o chat:', e); }

      // Construir instruções do sistema avançadas
      let finalInstructions = agentConfig.systemPrompt;
      if (agentConfig.tone) finalInstructions += `\n- Ton de Voz: Aja de forma ${agentConfig.tone}.`;
      if (agentConfig.messageLength) finalInstructions += `\n- Tamanho da Mensagem: Dê respostas ${agentConfig.messageLength}.`;
      if (agentConfig.useEmojis !== undefined) {
        finalInstructions += agentConfig.useEmojis ? `\n- Pode usar emojis livremente para ser expressivo.` : `\n- NÃO use emojis nas respostas sob nenhuma circunstância.`;
      }

      // Build conversation history for the AI
      // Get the last 10 messages for context
      const history = messages.slice(-10).map(m => ({
        role: m.sender === 'visitor' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      // Call our server API instead of Google SDK directly
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: visitorMessage,
          history,
          systemPrompt: finalInstructions,
          apiKey
        })
      });

      const data = await response.json() as any;
      
      if (!response.ok) {
        throw new Error(data.error || 'Falha na IA do Chat');
      }

      const reply = data.result as string;
      
      if (reply) {
        await supabase.from('chat_messages').insert({
          session_id: sessionId!,
          sender: 'agent',
          text: reply,
        });

        await supabase.from('chat_sessions').update({
          last_message: reply,
          last_message_at: new Date().toISOString(),
        }).eq('id', sessionId!);
      }

    } catch (err) {
      console.error('Erro no agente IA:', err);
    } finally {
      setIsTyping(false);
    }
  };

  if (widgetConfig && !widgetConfig.chatEnabled) return null;

  const positionClass = widgetConfig?.chatPosition === 'left' 
    ? 'fixed bottom-6 left-6' 
    : 'fixed bottom-6 right-6';
    
  const panelPositionClass = widgetConfig?.chatPosition === 'left'
    ? 'fixed bottom-24 left-6'
    : 'fixed bottom-24 right-6';

  return (
    <>
      <button 
        onClick={() => {
          if (!isOpen) trackEvent('chat_widget_click', { buttonPosition: 'floating_widget' });
          setIsOpen(!isOpen);
        }}
        className={`${positionClass} w-14 h-14 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform z-50 animate-bounce`}
        aria-label="Falar conosco"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className={`${panelPositionClass} w-[350px] h-[500px] bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5`} style={{ transformOrigin: widgetConfig?.chatPosition === 'left' ? 'bottom left' : 'bottom right' }}>
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 flex justify-between items-center relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-inner relative overflow-hidden">
                 {agentConfig?.agentAvatarUrl ? (
                   <img src={agentConfig.agentAvatarUrl} alt="Agent" className="w-full h-full object-cover" />
                 ) : (
                   <Bot className="w-5 h-5 text-white" />
                 )}
                 <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-indigo-600 rounded-full"></span>
              </div>
              <div>
                <h3 className="font-bold text-white text-md">{agentConfig?.agentName || 'Atendimento 7Zion'}</h3>
                <p className="text-white/70 text-xs">Respondemos rapidamente</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="realtive z-10 text-white/70 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#111] bg-opacity-95" style={{backgroundImage: 'radial-gradient(circle at top right, #1a1a2e 0%, #111 100%)'}}>
            {messages.length === 0 && (
              <div className="text-center text-gray-500 text-sm mt-10">
                <MessageCircle className="w-10 h-10 mx-auto opacity-20 mb-3" />
                <p className="mb-4">Olá! Como podemos te ajudar hoje?</p>
                
                {agentConfig?.suggestedMessages && agentConfig.suggestedMessages.length > 0 && (
                  <div className="flex flex-col gap-2 mt-4 items-end">
                    {agentConfig.suggestedMessages.map((sug, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => handleSendMessageDirect(sug)}
                        className="bg-white/5 border border-white/10 hover:bg-purple-600 hover:text-white hover:border-purple-500 transition-all text-xs px-4 py-2 rounded-xl text-right max-w-full truncate"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {messages.map(msg => {
              const isMe = msg.sender === 'visitor';
              return (
                <div key={msg.id} className={`flex gap-2 max-w-[90%] ${isMe ? 'ml-auto' : 'mr-auto'}`}>
                  {!isMe && (
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-purple-600/20 flex items-center justify-center flex-shrink-0 mt-auto mb-5">
                      {agentConfig?.agentAvatarUrl ? (
                        <img src={agentConfig.agentAvatarUrl} alt="Agent" className="w-full h-full object-cover" />
                      ) : (
                        <Bot className="w-4 h-4 text-purple-400" />
                      )}
                    </div>
                  )}
                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    {!isMe && agentConfig?.agentName && (
                      <span className="text-[10px] text-gray-400 ml-1 mb-1">{agentConfig.agentName}</span>
                    )}
                    <div className={`p-3 rounded-2xl text-sm leading-relaxed ${isMe ? 'bg-purple-600 text-white rounded-tr-sm' : 'bg-[#222] text-white rounded-tl-sm border border-white/5'}`}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1 px-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {isTyping && (
              <div className="mr-auto flex items-end max-w-[80%]">
                <div className="bg-[#222] border border-white/5 p-4 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Warning state if human is responding */}
          {sessionInfo && !sessionInfo.agentEnabled && (
             <div className="bg-indigo-500/10 text-indigo-400 text-[11px] py-1.5 px-4 text-center border-y border-indigo-500/10">
               Um especialista da nossa equipe está atendendo você.
             </div>
          )}

          {/* Input form */}
          <form onSubmit={handleSendMessage} className="p-3 bg-[#0a0a0a] border-t border-white/10 flex items-center gap-2">
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..." 
              className="flex-1 bg-[#121212] border border-white/10 rounded-full px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50"
            />
            <button 
              type="submit" 
              disabled={!newMessage.trim()}
              className="w-12 h-12 bg-purple-600 hover:bg-purple-500 text-white rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-50 transition-all"
            >
              <Send className="w-5 h-5 ml-1" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
