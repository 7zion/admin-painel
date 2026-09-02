import { createFileRoute } from '@tanstack/react-router'
import { ProjetosHero } from '../components/moraes/projetos/ProjetosHero';
import { ProjetosGrid } from '../components/moraes/projetos/ProjetosGrid';
import { ProjetoDestaque } from '../components/moraes/projetos/ProjetoDestaque';
import { RevestimentosAplicados } from '../components/moraes/projetos/RevestimentosAplicados';
import { FeaturesBar } from '../components/moraes/home/FeaturesBar';
import { ProjetosCTA } from '../components/moraes/projetos/ProjetosCTA';

export const Route = createFileRoute('/_public/projetos')({
  component: Projetos,
  head: () => ({
    meta: [
      { title: 'Projetos | Moraes Tijolos Revestimento' },
      { name: 'description', content: 'Conheça projetos reais que utilizam os revestimentos cerâmicos da Moraes e inspire-se com soluções que unem beleza, personalidade e atemporalidade.' },
    ]
  }),
})

function Projetos() {
  return (
    <main className="w-full bg-[#F9F8F6]">
      <ProjetosHero />
      <ProjetosGrid />
      <ProjetoDestaque />
      <RevestimentosAplicados />
      <FeaturesBar />
      <ProjetosCTA />
    </main>
  );
}
