export type MetaCapiEventName = 'Lead' | 'Contact' | 'ViewContent';

interface TrackMetaEventOptions {
  email?: string;
  phone?: string;
  customData?: Record<string, unknown>;
}

const getCookie = (name: string): string | undefined => {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
};

// Dispara um evento para a Meta Conversions API via nosso servidor (o token nunca
// fica exposto no bundle do client). Best-effort com keepalive: se a página navegar
// embora logo em seguida (ex: abrir o WhatsApp), o navegador ainda tenta completar
// a requisição em segundo plano.
export function trackMetaEvent(eventName: MetaCapiEventName, options: TrackMetaEventOptions = {}) {
  try {
    fetch('/api/meta-capi/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        eventName,
        eventSourceUrl: window.location.href,
        userData: {
          email: options.email,
          phone: options.phone,
          fbc: getCookie('_fbc'),
          fbp: getCookie('_fbp'),
        },
        customData: options.customData,
      }),
    }).catch(() => {
      // silencioso: telemetria não deve interromper o fluxo do usuário
    });
  } catch {
    // no-op
  }
}
