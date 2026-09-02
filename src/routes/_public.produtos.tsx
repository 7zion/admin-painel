import { createFileRoute } from '@tanstack/react-router'
import { ProdutosHero } from '../components/moraes/produtos/ProdutosHero';
import { ProdutosCategories } from '../components/moraes/produtos/ProdutosCategories';
import { ProdutosCatalog } from '../components/moraes/produtos/ProdutosCatalog';
import { ProdutosSpaces } from '../components/moraes/produtos/ProdutosSpaces';
import { ProdutosFeatured } from '../components/moraes/produtos/ProdutosFeatured';
import { ProdutosBenefits } from '../components/moraes/produtos/ProdutosBenefits';
import { ProdutosCTA } from '../components/moraes/produtos/ProdutosCTA';
import { fetchAllProductsServer, fetchAllProductCategoriesServer, fetchProductsModuleSettings } from '../lib/cms-server';

export const Route = createFileRoute('/_public/produtos')({
  loader: async () => {
    const [products, categories, productsModule] = await Promise.all([
      fetchAllProductsServer(),
      fetchAllProductCategoriesServer(),
      fetchProductsModuleSettings()
    ]);
    return { products, categories, defaultCategory: (productsModule as any)?.defaultCategory || undefined };
  },
  validateSearch: (search: Record<string, unknown>): { categoria?: string } => {
    return {
      categoria: search.categoria as string | undefined,
    }
  },
  component: Produtos,
  head: () => ({
    meta: [
      { title: 'Produtos | Moraes Tijolos Revestimento' },
      { name: 'description', content: 'Explore nossa curadoria de peças cerâmicas para fachadas, paredes internas, áreas gourmet e pisos.' },
    ]
  }),
})

function Produtos() {
  const { products, categories, defaultCategory } = Route.useLoaderData();
  return (
    <main className="w-full bg-[#F9F8F6]">
      <ProdutosHero />
      <ProdutosCategories serverCategories={categories} />
      <ProdutosCatalog serverProducts={products} serverCategories={categories} defaultCategory={defaultCategory} />
      <ProdutosSpaces />
      <ProdutosFeatured serverProducts={products} />
      <ProdutosBenefits />
      <ProdutosCTA />
    </main>
  );
}
