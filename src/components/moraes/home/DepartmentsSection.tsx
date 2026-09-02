import { Link } from '@tanstack/react-router';
import { EditableField } from '../../admin/EditableField';
import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { productCategoryRowToApp } from '../../../lib/supabase-mappers';
import { ProductCategory } from '../../../types/admin';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DepartmentsSectionProps {
  initialCategories?: ProductCategory[];
}

export function DepartmentsSection({ initialCategories = [] }: DepartmentsSectionProps) {
  const [categories, setCategories] = useState<ProductCategory[]>(initialCategories);
  const [loading, setLoading] = useState(initialCategories.length === 0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [itemsPerPage, setItemsPerPage] = useState(4);
  const [maxScrollIndex, setMaxScrollIndex] = useState(0);

  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth >= 1024) {
        setItemsPerPage(4);
      } else if (window.innerWidth >= 768) {
        setItemsPerPage(3);
      } else {
        // Imagens em formato story são altas: 2 por vez evita card gigante no mobile
        setItemsPerPage(2);
      }
    };
    
    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  useEffect(() => {
    setMaxScrollIndex(Math.max(0, categories.length - itemsPerPage));
  }, [categories.length, itemsPerPage]);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from('product_categories').select('*').order('created_at', { ascending: true });
      if (error) {
        console.error("Error fetching categories:", error);
      } else {
        setCategories((data || []).map(productCategoryRowToApp) as ProductCategory[]);
      }
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel('product_categories-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_categories' }, load)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleNext = useCallback(() => {
    if (categories.length <= itemsPerPage) return;
    setCurrentIndex((prev) => (prev >= maxScrollIndex ? 0 : prev + 1));
  }, [categories.length, itemsPerPage, maxScrollIndex]);

  const handlePrev = useCallback(() => {
    if (categories.length <= itemsPerPage) return;
    setCurrentIndex((prev) => (prev <= 0 ? maxScrollIndex : prev - 1));
  }, [categories.length, itemsPerPage, maxScrollIndex]);

  useEffect(() => {
    if (isAutoPlaying && categories.length > itemsPerPage) {
      timerRef.current = setInterval(handleNext, 5000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAutoPlaying, categories.length, itemsPerPage, handleNext]);

  const stopAutoPlay = () => setIsAutoPlaying(false);
  const startAutoPlay = () => setIsAutoPlaying(true);

  // Calculate translate percentage based on current index
  // Each item takes 100/itemsPerPage % of the container
  const translatePercent = -(currentIndex * (100 / itemsPerPage));

  return (
    <section className="py-16 md:py-24 bg-brand-bg overflow-hidden">
      <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        <div className="text-center mb-16">
          <EditableField id="home_dept_title" defaultValue="Nossos departamentos" type="text">
            {(title, titleStyles) => (
              <h2 className="font-serif text-3xl md:text-4xl 2xl:text-5xl font-bold text-brand-text mb-4" style={titleStyles}>
                {title}
              </h2>
            )}
          </EditableField>
          <div className="w-24 h-1 bg-brand-rust mx-auto opacity-60"></div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="text-sm text-brand-text/50 animate-pulse">Carregando departamentos...</div>
          </div>
        ) : categories.length > 0 ? (
          <div 
            className="relative"
            onMouseEnter={stopAutoPlay}
            onMouseLeave={startAutoPlay}
          >
            {/* Carousel Container */}
            <div className="overflow-hidden px-2 py-4 -mx-2">
              <motion.div 
                className="flex gap-4 md:gap-6"
                animate={{ x: `${translatePercent}%` }}
                transition={{ type: "spring", stiffness: 150, damping: 20 }}
              >
                {categories.map((dept) => (
                  <div 
                    key={dept.id} 
                    className="w-[calc(50%-8px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] flex-shrink-0"
                  >
                    <Link 
                      to="/produtos" 
                      search={{ categoria: dept.name }}
                      hash="produtos-catalog"
                      className="group block bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col"
                    >
                      <div className="aspect-[4/5] overflow-hidden relative">
                        <img
                          src={dept.imageUrl || "https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?q=80&w=2072&auto=format&fit=crop"}
                          alt={dept.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                      </div>
                      <div className="p-4 md:p-6 text-center flex-1 flex flex-col justify-center border-t border-gray-50">
                        <h3 className="font-serif text-base md:text-xl font-bold text-brand-text mb-2 group-hover:text-brand-rust transition-colors">{dept.displayTitle || dept.name}</h3>
                        <p className="text-xs md:text-sm text-brand-text/60 line-clamp-2">
                          {dept.description || "Explorar toda a coleção deste departamento"}
                        </p>
                      </div>
                    </Link>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Navigation Arrows */}
            {categories.length > itemsPerPage && (
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

            {/* Dots Navigation */}
            {categories.length > itemsPerPage && (
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
        ) : (
          <div className="text-center py-12 text-sm text-brand-text/50">
            Nenhum departamento cadastrado.
          </div>
        )}
      </div>
    </section>
  );
}
