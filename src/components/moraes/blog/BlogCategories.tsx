import React from 'react';
import { Link } from '@tanstack/react-router';
import { Armchair, Map, Box, PenTool, Sparkles, Building2, Layers } from 'lucide-react';
import { BlogCategory } from '../../../types/admin';

// Generic icons if the category doesn't have one specifically defined
const ICONS = [Armchair, Map, Box, PenTool, Sparkles, Building2, Layers];

export function BlogCategories({ currentCategory, categories }: { currentCategory?: string, categories: BlogCategory[] }) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 text-center">
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="h-px w-8 bg-brand-text/20" />
        <span className="text-brand-text/50 font-semibold tracking-[0.15em] text-[10px] uppercase">Filtre por categorias</span>
        <div className="h-px w-8 bg-brand-text/20" />
      </div>
      
      <h2 className="text-3xl lg:text-4xl text-brand-text font-serif mb-16">
        Encontre projetos e inspirações
      </h2>
      
      <div className="flex flex-wrap justify-center gap-8 sm:gap-12 md:gap-16">
        {categories.map((cat, index) => {
          const isActive = currentCategory?.toLowerCase() === cat.name.toLowerCase();
          const Icon = ICONS[index % ICONS.length];
          return (
            <Link 
              key={cat.id}
              to="/blog"
              search={{ categoria: isActive ? undefined : cat.name.toLowerCase() }}
              className={`flex flex-col items-center gap-5 group transition-opacity ${isActive ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
            >
              <div className={`w-20 h-20 flex items-center justify-center border rounded-full transition-colors overflow-hidden ${isActive ? 'border-brand-rust text-brand-rust bg-brand-rust/5' : 'border-brand-text/20 text-brand-text group-hover:border-brand-rust group-hover:text-brand-rust group-hover:bg-brand-rust/5'}`}>
                {cat.imageUrl ? (
                  <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <Icon className="w-8 h-8 stroke-[1.5]" />
                )}
              </div>
              <div className="text-center">
                <span className={`text-[13px] font-semibold tracking-wide block ${isActive ? 'text-brand-rust' : 'text-brand-text'}`}>
                  {cat.displayTitle || cat.name}
                </span>
                {cat.description && (
                  <p className="text-[10px] text-brand-text/50 max-w-[120px] line-clamp-2 mt-1 mx-auto">
                    {cat.description}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
