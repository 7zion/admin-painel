import { useEffect } from 'react';
import { useSiteSettings } from '../hooks/useSiteSettings';

// Título, descrição e keywords de cada página já são definidos via SSR pelo
// "head()" de cada rota (_public.produto.$id.tsx, _public.blog.$id.tsx etc.),
// através do <HeadContent /> do TanStack Router — é o jeito correto, porque
// fica presente no HTML inicial (bots que não rodam JS, ex: a maioria dos
// crawlers de preview de redes sociais, dependem disso).
//
// Este componente rodava por cima e SOBRESCREVIA esse título correto pelo
// título genérico do site assim que os settings globais terminavam de
// carregar no cliente — toda página acabava mostrando o mesmo título/
// descrição da home na aba do navegador (e para qualquer coisa que leia o
// DOM pós-JS), o que é ruim tanto para SEO (título duplicado em todo o site)
// quanto para UX. Mantemos aqui só a atualização do favicon, que não conflita
// com nada por página.
export function SEOMetadata() {
  const { settings, isLoading } = useSiteSettings();

  useEffect(() => {
    if (isLoading) return;

    if (settings.siteFavicon) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.siteFavicon;
    }
  }, [settings, isLoading]);

  return null;
}
