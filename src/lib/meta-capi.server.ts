import { supabase } from './supabase';

export type MetaCapiEventName = 'Lead' | 'Contact' | 'ViewContent';

interface MetaCapiUserData {
  email?: string;
  phone?: string;
  clientIp?: string;
  userAgent?: string;
  fbc?: string;
  fbp?: string;
}

interface MetaCapiParams {
  eventName: MetaCapiEventName;
  eventSourceUrl: string;
  userData?: MetaCapiUserData;
  customData?: Record<string, unknown>;
  eventId?: string;
}

const sha256Hex = async (value: string): Promise<string> => {
  const normalized = value.trim().toLowerCase();
  const data = new TextEncoder().encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
};

// Envia um evento para a Meta Conversions API. Best-effort: se o pixel/token não
// estiver configurado ou ativo, ou se a chamada falhar, apenas loga e segue —
// nunca deve travar a ação real do usuário (WhatsApp, envio de formulário, etc).
export async function sendMetaCapiEvent(params: MetaCapiParams): Promise<void> {
  try {
    const { data: trackingRow, error } = await supabase.from('settings').select('data').eq('id', 'tracking').maybeSingle();
    if (error) throw error;

    const metaApi = (trackingRow?.data as any)?.['meta-api'];
    const accessToken = metaApi?.head;
    const pixelId = metaApi?.pixelId;
    if (!metaApi?.active || !accessToken || !pixelId) return;

    const userData: Record<string, unknown> = {};
    if (params.userData?.email) userData.em = [await sha256Hex(params.userData.email)];
    if (params.userData?.phone) userData.ph = [await sha256Hex(params.userData.phone.replace(/\D/g, ''))];
    if (params.userData?.clientIp) userData.client_ip_address = params.userData.clientIp;
    if (params.userData?.userAgent) userData.client_user_agent = params.userData.userAgent;
    if (params.userData?.fbc) userData.fbc = params.userData.fbc;
    if (params.userData?.fbp) userData.fbp = params.userData.fbp;

    const body: Record<string, unknown> = {
      data: [
        {
          event_name: params.eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          event_source_url: params.eventSourceUrl,
          event_id: params.eventId,
          user_data: userData,
          custom_data: params.customData,
        },
      ],
    };
    if (metaApi.testEventCode) body.test_event_code = metaApi.testEventCode;

    const url = `https://graph.facebook.com/v21.0/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(accessToken)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error('Meta CAPI: falha ao enviar evento:', await response.text());
    }
  } catch (err) {
    console.error('Meta CAPI: erro ao processar evento:', err);
  }
}

type MetaCapiEventBody = {
  eventName?: MetaCapiEventName;
  eventSourceUrl?: string;
  eventId?: string;
  userData?: { email?: string; phone?: string; fbc?: string; fbp?: string };
  customData?: Record<string, unknown>;
};

export async function handleMetaCapiEvent(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as MetaCapiEventBody;
    if (!body.eventName || !body.eventSourceUrl) {
      return Response.json({ error: 'eventName e eventSourceUrl são obrigatórios.' }, { status: 400 });
    }

    const clientIp = request.headers.get('cf-connecting-ip') || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;

    await sendMetaCapiEvent({
      eventName: body.eventName,
      eventSourceUrl: body.eventSourceUrl,
      eventId: body.eventId,
      userData: {
        email: body.userData?.email,
        phone: body.userData?.phone,
        fbc: body.userData?.fbc,
        fbp: body.userData?.fbp,
        clientIp,
        userAgent,
      },
      customData: body.customData,
    });

    // Sempre 200: é um envio best-effort de telemetria, não deve virar erro visível pro usuário.
    return Response.json({ success: true });
  } catch (err: any) {
    console.error('Erro ao processar evento da Meta CAPI:', err);
    return Response.json({ success: false }, { status: 200 });
  }
}
