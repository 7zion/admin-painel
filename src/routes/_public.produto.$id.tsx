import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect } from 'react';
import { ProdutoHero } from '../components/moraes/produto/ProdutoHero';
import { ProdutoBenefits } from '../components/moraes/produto/ProdutoBenefits';
import { ProdutoSpaces } from '../components/moraes/produto/ProdutoSpaces';
import { ProdutoDifferentials } from '../components/moraes/produto/ProdutoDifferentials';
import { ProdutoWhyChoose } from '../components/moraes/produto/ProdutoWhyChoose';
import { ProdutoCTA } from '../components/moraes/produto/ProdutoCTA';
import { ChevronRight } from 'lucide-react';
import { fetchProductServer } from '../lib/cms-server';
import { Product } from '../types/admin';
import { trackMetaEvent } from '../lib/meta-capi';

export const Route = createFileRoute('/_public/produto/$id')({
  loader: async ({ params }) => {
    const product = await fetchProductServer({ data: params.id });
    return { product: product as Product | null };
  },
  component: Produto,
  head: ({ loaderData }) => {
    const product = loaderData?.product;
    if (product) {
      return {
        meta: [
          { title: `${product.name} | Moraes Tijolos Revestimento` },
          { name: 'description', content: product.description || `Conheça o produto ${product.name} da Moraes Tijolos.` },
        ]
      }
    }
    return {
      meta: [
        { title: 'Produto | Moraes Tijolos Revestimento' },
        { name: 'description', content: 'Detalhes do produto Moraes.' },
      ]
    }
  },
})

function Produto() {
  const { product } = Route.useLoaderData();

  useEffect(() => {
    if (!product) return;
    trackMetaEvent('ViewContent', {
      customData: {
        content_name: product.name,
        content_ids: [product.id],
        content_type: 'product',
        content_category: product.category,
      },
    });
  }, [product?.id]);

  if (!product) return <div className="py-20 text-center text-brand-text">Produto não encontrado.</div>;

  return (
    <main className="w-full bg-[#F9F8F6]">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-2 text-xs text-brand-text/60 font-medium">
          <Link to="/produtos" search={{ categoria: undefined }} className="hover:text-brand-rust transition-colors">Produtos</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="hover:text-brand-rust cursor-pointer transition-colors">{product.category || 'Categoria'}</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-brand-text font-bold">{product.name}</span>
        </div>
      </div>

      <ProdutoHero product={product} />
      <ProdutoBenefits />
      <ProdutoSpaces />
      <ProdutoDifferentials />
      <ProdutoWhyChoose />
      <ProdutoCTA />
    </main>
  );
}
