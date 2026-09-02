import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { Product } from '../../../types/admin';
import { EditableField } from '../../admin/EditableField';

export interface HomeStoreSectionData {
  category: { id: string; name: string; displayTitle?: string };
  products: Product[];
}

function ProductCard({ prod }: { prod: Product }) {
  return (
    <div className="bg-white rounded overflow-hidden shadow-sm flex flex-col group border border-gray-100 h-full">
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
        <img
          src={prod.imageUrl}
          alt={prod.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded text-brand-text">
          {prod.tag || prod.category}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="font-bold text-sm text-brand-text leading-tight mb-1">{prod.name}</h4>
            {prod.tamanho && <span className="text-[11px] text-brand-text/60">{prod.tamanho}</span>}
          </div>
          <span className="text-xs font-medium text-brand-text/50 bg-gray-50 px-1.5 py-0.5 rounded">{prod.unidade || 'm²'}</span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2">
          <Link to="/produto/$id" params={{ id: prod.id }} className="flex-1 text-center border border-gray-200 hover:border-brand-rust text-brand-text text-xs font-semibold py-2 rounded transition-colors">
            Ver detalhes
          </Link>
        </div>
      </div>
    </div>
  );
}

function CategoryProductRow({ category, products }: HomeStoreSectionData) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(4);

  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth >= 1024) {
        setItemsPerPage(4);
      } else {
        // Mobile e tablet mostram 2 produtos por vez — evita ficar só 1 por
        // tela, que deixava o carrossel com pouca informação visível.
        setItemsPerPage(2);
      }
    };

    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  const maxScrollIndex = Math.max(0, products.length - itemsPerPage);

  const handleNext = useCallback(() => {
    if (products.length <= itemsPerPage) return;
    setCurrentIndex((prev) => (prev >= maxScrollIndex ? 0 : prev + 1));
  }, [products.length, itemsPerPage, maxScrollIndex]);

  const handlePrev = useCallback(() => {
    if (products.length <= itemsPerPage) return;
    setCurrentIndex((prev) => (prev <= 0 ? maxScrollIndex : prev - 1));
  }, [products.length, itemsPerPage, maxScrollIndex]);

  useEffect(() => {
    if (!isAutoPlaying || products.length <= itemsPerPage) return;
    const timer = setInterval(handleNext, 4000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, products.length, itemsPerPage, handleNext]);

  const translatePercent = -(currentIndex * (100 / itemsPerPage));

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <h3 className="font-serif text-2xl font-bold text-brand-text mb-6 text-center">
        {category.displayTitle || category.name}
      </h3>

      <div className="overflow-hidden px-1 py-2 -mx-1">
        <motion.div
          className="flex gap-4"
          animate={{ x: `${translatePercent}%` }}
          transition={{ type: 'spring', stiffness: 150, damping: 20 }}
        >
          {products.map((prod) => (
            <div key={prod.id} className="w-1/2 lg:w-1/4 flex-shrink-0">
              <ProductCard prod={prod} />
            </div>
          ))}
        </motion.div>
      </div>

      {products.length > itemsPerPage && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-[-10px] md:left-[-18px] top-[calc(50%+24px)] -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center text-brand-text hover:bg-brand-rust hover:text-white transition-all z-10 border border-gray-100 cursor-pointer focus:outline-none active:scale-95"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-[-10px] md:right-[-18px] top-[calc(50%+24px)] -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center text-brand-text hover:bg-brand-rust hover:text-white transition-all z-10 border border-gray-100 cursor-pointer focus:outline-none active:scale-95"
            aria-label="Próximo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
}

export function StoreSection({ serverSections = [] }: { serverSections?: HomeStoreSectionData[] }) {
  return (
    <section className="py-20 bg-[#EFECE8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <EditableField id="home_store_title" defaultValue="Explore nossa loja" type="text">
            {(title, titleStyles) => (
              <h2 className="font-serif text-4xl font-bold text-brand-text mb-4" style={titleStyles}>
                {title}
              </h2>
            )}
          </EditableField>
          <div className="w-16 h-0.5 bg-brand-rust opacity-40 mb-6 mx-auto"></div>
          <EditableField id="home_store_subtitle" defaultValue="Clique nos produtos para ver detalhes e comprar de forma prática pelo WhatsApp." type="html">
            {(subtitle, subtitleStyles) => (
              <p className="text-sm text-brand-text/80 leading-relaxed" style={subtitleStyles} dangerouslySetInnerHTML={{ __html: subtitle }} />
            )}
          </EditableField>
        </div>

        {serverSections.length === 0 ? (
          <div className="flex justify-center items-center h-32 text-brand-text/50 font-medium italic">
            Nenhuma categoria selecionada para exibir na home. Configure em Produtos → Gerenciar Categorias.
          </div>
        ) : (
          <div className="space-y-16">
            {serverSections.map((section) => (
              <CategoryProductRow key={section.category.id} category={section.category} products={section.products} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
