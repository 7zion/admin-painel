import React from 'react';
import { BlogPost } from '../../../types/admin';
import { Calendar, Clock } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { calculateReadingTime } from '../../../lib/reading-time';

export function BlogList({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
      <div className="flex items-center justify-center gap-4 mb-6 text-center">
        <div className="h-px w-8 bg-brand-text/20" />
        <span className="text-brand-text/50 font-semibold tracking-[0.15em] text-[10px] uppercase">Últimos Artigos</span>
        <div className="h-px w-8 bg-brand-text/20" />
      </div>
      
      <h2 className="text-3xl lg:text-4xl text-brand-text font-serif text-center mb-16">
        Conteúdos para <span className="text-brand-rust italic font-light">inspirar</span> seus projetos
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-16 mb-16">
        {posts.map(post => {
          const formattedDate = new Date(post.createdAt || new Date()).toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'long', year: 'numeric'
          });
          const readTime = calculateReadingTime(post.content, post.summary);

          return (
            <div key={post.id} className="flex flex-col sm:flex-row gap-6 group">
              <div className="w-full sm:w-[45%] aspect-[4/3] overflow-hidden bg-gray-100 flex-shrink-0">
                <img 
                  src={post.imageUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800'} 
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="w-full sm:w-[55%] flex flex-col py-1">
                <span className="text-brand-text/50 font-semibold tracking-[0.15em] text-[10px] uppercase mb-3 block">
                  {post.category || 'Categoria'}
                </span>
                <Link to="/blog/$id" params={{ id: post.slug || post.id }} search={{ categoria: undefined }} className="block mb-4 flex-grow">
                  <h3 className="text-xl lg:text-[22px] text-brand-text font-serif leading-[1.3] group-hover:text-brand-rust transition-colors line-clamp-3">
                    {post.title}
                  </h3>
                </Link>
                <div className="flex flex-wrap items-center gap-4 text-xs text-brand-text/50 font-medium mb-6">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-brand-rust/80" />
                    <span>{formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-brand-rust/80" />
                    <span>{readTime}</span>
                  </div>
                </div>
                <Link 
                  to="/blog/$id" 
                  params={{ id: post.slug || post.id }}
                  search={{ categoria: undefined }}
                  className="inline-flex items-center text-[11px] font-semibold tracking-[0.2em] uppercase text-brand-rust hover:text-brand-rust/80 transition-colors"
                >
                  Ler Mais &rarr;
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center">
        <Link to="/blog" className="bg-brand-text/80 hover:bg-brand-rust text-white px-8 py-4 text-xs font-semibold tracking-widest uppercase transition-colors">
          Ver Todos os Artigos &rarr;
        </Link>
      </div>
    </section>
  );
}
