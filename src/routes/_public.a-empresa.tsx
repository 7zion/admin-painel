import { createFileRoute } from '@tanstack/react-router'
import { SobreHero } from '../components/moraes/sobre/SobreHero';
import { SobreHistory } from '../components/moraes/sobre/SobreHistory';
import { SobreSpaces } from '../components/moraes/sobre/SobreSpaces';
import { SobreProcess } from '../components/moraes/sobre/SobreProcess';
import { SobreValues } from '../components/moraes/sobre/SobreValues';
import { SobreCTA } from '../components/moraes/sobre/SobreCTA';

export const Route = createFileRoute('/_public/a-empresa')({
  component: Empresa,
  head: () => ({
    meta: [
      { title: 'A Empresa | Moraes Tijolos Revestimento' },
      { name: 'description', content: 'Conheça a história e os valores da Moraes Tijolos Revestimento. Quase 50 anos de tradição em Tambaú, SP.' },
    ]
  }),
})

function Empresa() {
  return (
    <main className="w-full bg-brand-bg">
      <SobreHero />
      <SobreHistory />
      <SobreSpaces />
      <SobreProcess />
      <SobreValues />
      <SobreCTA />
    </main>
  );
}
