import { useEffect, useRef } from 'react';
import {  useLocation  } from '@tanstack/react-router';
import { supabase } from '../lib/supabase';
import { trackEvent } from '../lib/analytics';
import { isLikelyBot } from '../lib/is-bot';
import { useAuth } from '../lib/auth-context';
import { trackMetaEvent } from '../lib/meta-capi';

// Helper to get device info from UserAgent
const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  let device = 'Desktop';
  if (/mobile/i.test(ua)) device = 'Mobile';
  if (/tablet/i.test(ua)) device = 'Tablet';
  
  let browser = 'Unknown';
  if (/chrome|crios|crmo/i.test(ua)) browser = 'Chrome';
  else if (/firefox|iceweasel|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua)) browser = 'Safari';
  else if (/opr\//i.test(ua)) browser = 'Opera';
  else if (/edg/i.test(ua)) browser = 'Edge';

  let os = 'Unknown';
  if (/windows nt/i.test(ua)) os = 'Windows';
  else if (/mac os x/i.test(ua)) os = 'macOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/ios|iphone|ipad/i.test(ua)) os = 'iOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  return { device, browser, os };
};

export function AnalyticsTracker() {
  const location = useLocation();
  const { userRole } = useAuth();

  useEffect(() => {
    let cleanupScroll: () => void;

    const trackPage = async () => {
      try {
        if (isLikelyBot()) return;
        // Não conta como visita real quando é a própria equipe (admin/editor)
        // navegando pelo site logada — evita inflar as métricas de marketing
        // com o próprio time checando o site.
        if (userRole === 'admin' || userRole === 'editor') return;

        const { data: marketingSettings } = await supabase.from('settings').select('data').eq('id', 'marketingModule').maybeSingle();
        if (marketingSettings && marketingSettings.data?.isEnabled === false) {
           return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const utm_source = urlParams.get('utm_source') || '';
        const utm_medium = urlParams.get('utm_medium') || '';
        const utm_campaign = urlParams.get('utm_campaign') || '';
        const utm_term = urlParams.get('utm_term') || '';
        const utm_content = urlParams.get('utm_content') || '';
        const isNewSession = !sessionStorage.getItem('session_tracked');

        const { device, browser, os } = getDeviceInfo();
        
        let geoData = { country: 'Desconhecido', region: '', city: '' };
        
        // We only fetch geo on new session to save API calls
        if (isNewSession) {
          try {
            const res = await fetch('https://ipapi.co/json/');
            const data = await res.json() as any;
            geoData = { 
              country: data.country_name || 'Desconhecido', 
              region: data.region || '', 
              city: data.city || '' 
            };
          } catch (e) {}
        } else {
            // Get from session storage if possible, else skip
            const savedGeo = sessionStorage.getItem('geo_data');
            if (savedGeo) geoData = JSON.parse(savedGeo);
        }

        const visitorId = localStorage.getItem('visitor_id') || `vid_${Math.random().toString(36).substr(2, 9)}`;
        const sessionId = sessionStorage.getItem('session_id') || `sess_${Math.random().toString(36).substr(2, 9)}`;

        if (!localStorage.getItem('visitor_id')) {
          localStorage.setItem('visitor_id', visitorId);
        }
        if (!sessionStorage.getItem('session_id')) {
          sessionStorage.setItem('session_id', sessionId);
        }

        const visitData = {
          visitorId,
          sessionId,
          path: location.pathname,
          referrer: document.referrer || 'Direto',
          utm_source,
          utm_medium,
          utm_campaign,
          utm_term,
          utm_content,
          device,
          browser,
          os,
          country: geoData.country,
          region: geoData.region,
          city: geoData.city,
          userAgent: navigator.userAgent,
          isNewSession
        };

        if (isNewSession) {
          await supabase.from('analytics').insert({ payload: visitData });
          sessionStorage.setItem('session_tracked', 'true');
          sessionStorage.setItem('geo_data', JSON.stringify(geoData));
          
          // Track scroll depth over time
          let maxScroll = 0;
          const handleScroll = () => {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (docHeight > 0) {
              const currentScroll = (window.scrollY / docHeight) * 100;
              if (currentScroll > maxScroll) {
                maxScroll = currentScroll;
              }
            }
          };
          window.addEventListener('scroll', handleScroll);
          
          // Send scroll depth when leaving
          const handleBeforeUnload = () => {
             localStorage.setItem(`last_scroll_${sessionId}`, String(Math.round(maxScroll)));
          };
          window.addEventListener('beforeunload', handleBeforeUnload);
          
          cleanupScroll = () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('beforeunload', handleBeforeUnload);
          };
        } else {
           trackEvent('page_view', { path: location.pathname });
        }

      } catch (err) {
        console.warn('Analytics tracking failed', err);
      }
    };

    trackPage();
    
    return () => {
      if (cleanupScroll) {
        cleanupScroll();
      }
    };
  }, [location.pathname, userRole]);

  // Escuta cliques em qualquer link de WhatsApp do site (delegação de evento no
  // document, cobre botões atuais e futuros sem precisar instrumentar cada um) e
  // envia um evento "Contact" para a Meta Conversions API.
  useEffect(() => {
    if (isLikelyBot() || userRole) return;

    const handleClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest('a[href*="wa.me"], a[href*="api.whatsapp.com"]');
      if (!target) return;
      trackMetaEvent('Contact', { customData: { content_name: document.title } });
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [userRole]);

  return null;
}
