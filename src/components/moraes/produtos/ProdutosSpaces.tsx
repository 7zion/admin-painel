import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { EditableField } from '../../admin/EditableField';

export function ProdutosSpaces() {
  const spaces = [
    {
      id: 'produtos_space_1',
      imageDef: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=600&auto=format&fit=crop',
      titleDef: 'Fachadas residenciais\ne comerciais',
    },
    {
      id: 'produtos_space_2',
      imageDef: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop',
      titleDef: 'Paredes internas\ndecorativas',
    },
    {
      id: 'produtos_space_3',
      imageDef: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600&auto=format&fit=crop',
      titleDef: 'Áreas gourmet',
    },
    {
      id: 'produtos_space_4',
      imageDef: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=600&auto=format&fit=crop',
      titleDef: 'Salas, cozinhas\ne corredores',
    },
    {
      id: 'produtos_space_5',
      imageDef: 'https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?q=80&w=600&auto=format&fit=crop',
      titleDef: 'Muros\ne entradas',
    },
    {
      id: 'produtos_space_6',
      imageDef: 'https://images.unsplash.com/photo-1502005097973-6a7082348e28?q=80&w=600&auto=format&fit=crop',
      titleDef: 'Pisos internos\ne externos',
    },
    {
      id: 'produtos_space_7',
      imageDef: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=600&auto=format&fit=crop',
      titleDef: 'Projetos de arquitetos,\nconstrutoras e\nconsumidores finais',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 5 colunas no desktop, reduzindo progressivamente até 2 no mobile
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [maxScrollIndex, setMaxScrollIndex] = useState(0);

  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth >= 1280) {
        setItemsPerPage(5);
      } else if (window.innerWidth >= 1024) {
        setItemsPerPage(4);
      } else if (window.innerWidth >= 640) {
        setItemsPerPage(3);
      } else {
        setItemsPerPage(2);
      }
    };

    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  useEffect(() => {
    setMaxScrollIndex(Math.max(0, spaces.length - itemsPerPage));
  }, [spaces.length, itemsPerPage]);

  // Se a tela diminuir, evita ficar preso num índice que não existe mais
  useEffect(() => {
    setCurrentIndex((prev) => Math.min(prev, maxScrollIndex));
  }, [maxScrollIndex]);

  const handleNext = useCallback(() => {
    if (spaces.length <= itemsPerPage) return;
    setCurrentIndex((prev) => (prev >= maxScrollIndex ? 0 : prev + 1));
  }, [spaces.length, itemsPerPage, maxScrollIndex]);

  const handlePrev = useCallback(() => {
    if (spaces.length <= itemsPerPage) return;
    setCurrentIndex((prev) => (prev <= 0 ? maxScrollIndex : prev - 1));
  }, [spaces.length, itemsPerPage, maxScrollIndex]);

  useEffect(() => {
    if (isAutoPlaying && spaces.length > itemsPerPage) {
      timerRef.current = setInterval(handleNext, 5000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAutoPlaying, spaces.length, itemsPerPage, handleNext]);

  const stopAutoPlay = () => setIsAutoPlaying(false);
  const startAutoPlay = () => setIsAutoPlaying(true);

  // Desliza exatamente a largura de 1 item por vez
  const translatePercent = -(currentIndex * (100 / itemsPerPage));

  return (
    <section className="py-20 bg-[#F9F8F6] overflow-hidden">
      <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-12">
          <EditableField id="produtos_spaces_title" defaultValue="Escolha <em class='font-serif italic text-brand-rust'>por</em> ambiente" type="html">
            {(html, styles) => (
              <h2
                className="font-serif text-3xl md:text-4xl 2xl:text-5xl font-bold text-brand-text mb-4"
                style={styles}
                dangerouslySetInnerHTML={{ __html: html }}
              />
            )}
          </EditableField>
          <div className="w-16 h-px bg-brand-rust mx-auto opacity-40"></div>
        </div>

        <div
          className="relative"
          onMouseEnter={stopAutoPlay}
          onMouseLeave={startAutoPlay}
        >
          <div className="overflow-hidden px-2 py-4 -mx-2">
            <motion.div
              className="flex gap-4 md:gap-6"
              animate={{ x: `${translatePercent}%` }}
              transition={{ type: 'spring', stiffness: 150, damping: 20 }}
            >
              {spaces.map((space) => (
                <div
                  key={space.id}
                  className="w-[calc(50%-8px)] sm:w-[calc(33.333%-10.67px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] xl:w-[calc(20%-19.2px)] flex-shrink-0 flex flex-col group cursor-pointer"
                >
                  {/* Proporção 9:16 — formato de story do Instagram */}
                  <div className="w-full aspect-[9/16] rounded-xl overflow-hidden shadow-sm mb-4 bg-gray-100">
                    <EditableField id={`${space.id}_img`} defaultValue={space.imageDef} type="image" className="w-full h-full">
                      {(url) => (
                        <img
                          src={url}
                          alt={space.titleDef.replace('\n', ' ')}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </EditableField>
                  </div>
                  <EditableField id={`${space.id}_title`} defaultValue={space.titleDef} type="text">
                    {(text, styles) => (
                      <p className="text-[11px] md:text-xs font-semibold text-brand-text text-center px-1 whitespace-pre-line leading-snug" style={styles}>
                        {text}
                      </p>
                    )}
                  </EditableField>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Setas de navegação */}
          {spaces.length > itemsPerPage && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-[-10px] md:left-[-30px] top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-brand-text hover:bg-brand-rust hover:text-white transition-all z-10 border border-gray-100 cursor-pointer focus:outline-none active:scale-95"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-[-10px] md:right-[-30px] top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-brand-text hover:bg-brand-rust hover:text-white transition-all z-10 border border-gray-100 cursor-pointer focus:outline-none active:scale-95"
                aria-label="Próximo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Indicadores */}
          {spaces.length > itemsPerPage && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: maxScrollIndex + 1 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentIndex(i);
                    stopAutoPlay();
                  }}
                  className={`h-1.5 transition-all duration-300 cursor-pointer rounded-full ${
                    currentIndex === i
                      ? 'bg-brand-rust w-8'
                      : 'bg-gray-200 w-3 hover:bg-gray-300'
                  }`}
                  aria-label={`Ir para slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
