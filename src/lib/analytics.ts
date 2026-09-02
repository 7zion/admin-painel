import { supabase } from './supabase';
import { isLikelyBot } from './is-bot';

export const trackEvent = async (eventName: string, eventData: any = {}) => {
  try {
    if (isLikelyBot()) return;

    const { data: marketingSettings } = await supabase.from('settings').select('data').eq('id', 'marketingModule').maybeSingle();
    if (marketingSettings && marketingSettings.data?.isEnabled === false) {
      return;
    }

    const visitorId = localStorage.getItem('visitor_id') || `vid_${Math.random().toString(36).substr(2, 9)}`;
    const sessionId = sessionStorage.getItem('session_id') || `sess_${Math.random().toString(36).substr(2, 9)}`;

    if (!localStorage.getItem('visitor_id')) {
      localStorage.setItem('visitor_id', visitorId);
    }
    if (!sessionStorage.getItem('session_id')) {
      sessionStorage.setItem('session_id', sessionId);
    }

    const payload = {
      eventName,
      visitorId,
      sessionId,
      path: window.location.pathname,
      ...eventData,
    };

    await supabase.from('analytics_events').insert({ payload });
  } catch (err) {
    console.warn('Event tracking failed', err);
  }
};
