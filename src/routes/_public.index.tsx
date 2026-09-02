import { createFileRoute } from '@tanstack/react-router'
import { HeroSection } from '../components/moraes/home/HeroSection';
import { FeaturesBar } from '../components/moraes/home/FeaturesBar';
import { DepartmentsSection } from '../components/moraes/home/DepartmentsSection';
import { StoreSection } from '../components/moraes/home/StoreSection';
import { FeaturedProductSection } from '../components/moraes/home/FeaturedProductSection';
import { AboutSection } from '../components/moraes/home/AboutSection';
import { UseCasesSection } from '../components/moraes/home/UseCasesSection';
import { CtaSection } from '../components/moraes/home/CtaSection';
import { fetchAllProductsServer, fetchAllProductCategoriesServer, fetchHomeStoreSections } from '../lib/cms-server';

export const Route = createFileRoute('/_public/')({
  loader: async () => {
    const [products, categories, storeSections] = await Promise.all([
      fetchAllProductsServer(),
      fetchAllProductCategoriesServer(),
      fetchHomeStoreSections(),
    ]);
    return { products, categories, storeSections };
  },
  component: Home,
  head: () => ({
    meta: [
      { title: 'Moraes Tijolos Revestimento' },
      { name: 'description', content: 'Revestimentos cerâmicos para projetos com personalidade. Tradição de quase 50 anos em Tambaú, SP.' },
    ]
  }),
})

function Home() {
  const { products, categories, storeSections } = Route.useLoaderData();
  return (
    <main className="w-full">
      <HeroSection />
      <FeaturesBar />
      <DepartmentsSection initialCategories={categories} />
      <StoreSection serverSections={storeSections} />
      <FeaturedProductSection serverProducts={products} />
      <AboutSection />
      <UseCasesSection />
      <CtaSection />
    </main>
  );
}
