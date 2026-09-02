import { createFileRoute } from '@tanstack/react-router'
import { ContatoHero } from '../components/moraes/contato/ContatoHero';
import { ContatoContent } from '../components/moraes/contato/ContatoContent';
import { ContatoFeatures } from '../components/moraes/contato/ContatoFeatures';
import { ContatoLocation } from '../components/moraes/contato/ContatoLocation';
import { ContatoFAQ } from '../components/moraes/contato/ContatoFAQ';
import { ContatoCTA } from '../components/moraes/contato/ContatoCTA';

export const Route = createFileRoute('/_public/contato')({
  component: Contato,
  head: () => ({
    meta: [
      { title: 'Contato | Moraes Tijolos Revestimento' },
      { name: 'description', content: 'Fale com nossa equipe e solicite um orçamento.' },
    ]
  }),
})

function Contato() {
  return (
    <main className="w-full bg-brand-bg">
      <ContatoHero />
      <ContatoContent />
      <ContatoFeatures />
      <ContatoLocation />
      <ContatoFAQ />
      <ContatoCTA />
    </main>
  );
}
