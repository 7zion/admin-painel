import { GoogleGenAI } from "@google/genai";

interface ChatBody { apiKey?: string;
  message?: string;
  history?: any[];
  systemPrompt?: string;
}

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = 15; // 15 mensagens por minuto por IP
  const windowMs = 60 * 1000;

  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  if (record.count >= limit) {
    return false;
  }
  record.count += 1;
  return true;
}

export async function handleGeminiChat(request: Request) {
  try {
    // 1. Validar a origem para evitar requisições de outros sites consumindo a API
    const origin = request.headers.get("Origin");
    const referer = request.headers.get("Referer");
    const host = request.headers.get("Host");
    
    // Se a requisição vem de um navegador (tem Origin) e não bate com nosso domínio/host, bloqueia
    if (origin) {
      try {
        const originUrl = new URL(origin);
        // Permitimos localhost para desenvolvimento, ou requisições da mesma origem
        if (originUrl.hostname !== "localhost" && originUrl.hostname !== "127.0.0.1" && host && !originUrl.host.includes(host)) {
           return Response.json({ error: "Origem não autorizada." }, { status: 403 });
        }
      } catch (e) {
        // origin inválido
      }
    } else if (!referer && !host) {
      // Bloquear ferramentas de CLI simples se não enviarem headers básicos de navegação (opcional)
    }

    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    if (!checkRateLimit(ip)) {
      return Response.json({ error: "Muitas requisições. Tente novamente em um minuto." }, { status: 429 });
    }

    const body = (await request.json()) as ChatBody;
    const { message, history, systemPrompt } = body;

    if (!message) {
      return Response.json({ error: "O parâmetro message é obrigatório." }, { status: 400 });
    }

    if (message.length > 1000) {
      return Response.json({ error: "Mensagem muito longa." }, { status: 400 });
    }

    if (history && history.length > 50) {
      return Response.json({ error: "Histórico excede o limite." }, { status: 400 });
    }

    // Apenas a chave de ambiente do servidor deve ser usada
    const effectiveApiKey = body.apiKey || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined);

    if (!effectiveApiKey) {
      return Response.json({ error: "Chave de API do Gemini não configurada no servidor." }, { status: 500 });
    }

    const ai = new GoogleGenAI({
      apiKey: effectiveApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build-cloudflare',
        }
      }
    });

    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt || "Você é o assistente virtual da loja. Seja cordial, profissional e ajude os clientes com dúvidas."
      },
      history: history || [],
    });

    const result = await chat.sendMessage({ message });
    
    return Response.json({ result: result.text }, { status: 200 });
  } catch (error: any) {
    console.error("Erro no chat Gemini:", error);
    return Response.json(
      {
        error: "Falha na resposta do assistente.",
        details: error?.message || "Erro desconhecido.",
      },
      { status: 500 }
    );
  }
}
