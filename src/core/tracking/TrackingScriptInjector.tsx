import React, { useEffect } from 'react';
import { useSettingsContext } from '../../lib/settings-context';
import parse from 'html-react-parser';

const SCRIPT_BEARING_KEYS = ['gtm', 'ga', 'meta-pixel'] as const;

// html-react-parser precisa de um document.implementation.createHTMLDocument real
// pra funcionar. O runtime dos Cloudflare Workers em produção tem isso; o `vite dev`
// local não — e sem essa proteção, qualquer tag de rastreamento ativa derruba a
// página inteira em desenvolvimento local (500), mesmo sem afetar produção.
function safeParse(html: string): ReturnType<typeof parse> | null {
  try {
    return parse(html);
  } catch (err) {
    console.warn('Falha ao renderizar tag de rastreamento (ambiente sem suporte a html-react-parser):', err);
    return null;
  }
}

// Um <script> renderizado via html-react-parser + React (como abaixo, em
// TrackingHeadInjector/TrackingBodyInjector) aparece corretamente no DOM, mas
// o navegador NUNCA o executa — é uma proteção de segurança contra scripts
// vindos de innerHTML/parsers de HTML arbitrário, e o React não tem como
// contornar isso. Isso significa que GTM, GA (gtag.js) e Meta Pixel colados no
// painel de Rastreamento nunca disparavam de verdade, mesmo marcados "Ativo".
//
// A renderização via parse() continua existindo (abaixo) porque é necessária
// para as tags <meta> de verificação (GSC, Meta Domain) aparecerem no HTML
// inicial (SSR) — essas não precisam "executar", só estar presentes. Este
// componente cuida só dos <script>, injetando uma cópia real e executável
// deles via DOM no cliente.
function injectExecutableScripts(id: string, html: string, target: HTMLElement) {
  if (target.querySelector(`script[data-tracking-id="${id}"]`)) return;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;

  wrapper.querySelectorAll('script').forEach((oldScript) => {
    const newScript = document.createElement('script');
    Array.from(oldScript.attributes).forEach((attr) => newScript.setAttribute(attr.name, attr.value));
    if (oldScript.textContent) newScript.textContent = oldScript.textContent;
    newScript.setAttribute('data-tracking-id', id);
    target.appendChild(newScript);
  });
}

export function TrackingScriptActivator() {
  const { trackingSettings: settings } = useSettingsContext();

  useEffect(() => {
    if (!settings) return;
    SCRIPT_BEARING_KEYS.forEach((key) => {
      const cfg = (settings as any)[key];
      if (!cfg?.active) return;
      if (cfg.head) injectExecutableScripts(`head-${key}`, cfg.head, document.head);
      if (cfg.body) injectExecutableScripts(`body-${key}`, cfg.body, document.body);
    });
  }, [settings]);

  return null;
}

export function TrackingHeadInjector({ settings }: { settings: any }) {
  if (!settings) return null;

  return (
    <>
      {settings.gsc?.active && settings.gsc.head && safeParse(settings.gsc.head)}
      {settings['meta-domain']?.active && settings['meta-domain'].head && safeParse(settings['meta-domain'].head)}
      {settings.ga?.active && settings.ga.head && safeParse(settings.ga.head)}
      {settings['meta-pixel']?.active && settings['meta-pixel'].head && safeParse(settings['meta-pixel'].head)}
      {settings.gtm?.active && settings.gtm.head && safeParse(settings.gtm.head)}
    </>
  );
}

export function TrackingBodyInjector() {
  const { trackingSettings: settings } = useSettingsContext();

  if (!settings) return null;

  return (
    <>
      {settings.gtm?.active && settings.gtm.body && safeParse(settings.gtm.body)}
      {settings['meta-pixel']?.active && settings['meta-pixel'].body && safeParse(settings['meta-pixel'].body)}
    </>
  );
}
