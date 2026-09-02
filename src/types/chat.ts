export interface ChatMessage {
  id: string;
  sessionId: string;
  sender: 'visitor' | 'agent' | 'admin';
  text: string;
  createdAt: number;
}

export interface ChatSession {
  id: string;
  visitorId: string;
  createdAt: number;
  lastMessage: string;
  lastMessageAt: number;
  status: 'active' | 'closed' | 'archived';
  agentEnabled: boolean; // Tells if the AI should reply to this session
  utmParams?: {
    source: string | null;
    medium: string | null;
    campaign: string | null;
    term: string | null;
    content: string | null;
    url: string;
  };
}

export interface AiAgentConfig {
  agentName?: string;
  agentAvatarUrl?: string;
  isActive: boolean;
  systemPrompt: string;
  pdfUrls: string[]; 
  tone?: string;
  messageLength?: string;
  useEmojis?: boolean;
  suggestedMessages?: string[];
}

export interface WidgetConfig {
  chatEnabled: boolean;
  whatsappEnabled: boolean;
  chatPosition: 'left' | 'right';
  whatsappPosition: 'left' | 'right';
  whatsappStyle?: 'sidebar' | 'circle';
  whatsappNumber: string;
  whatsappMessage?: string;
}
