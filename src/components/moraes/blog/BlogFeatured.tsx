import React from 'react';
import { BlogPost } from '../../../types/admin';
import { Calendar, Clock, Tag } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { calculateReadingTime } from '../../../lib/reading-time';

export function BlogFeatured({ post }: { post: BlogPost }) {
  const formattedDate = new Date(post.createdAt || new Date()).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
  const readTime = calculateReadingTime(post.content, post.summary);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 lg:-mt-20 relative z-20 mb-24">
      <div className="bg-white rounded-none shadow-xl overflow-hidden flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/2 aspect-[4/3] lg:aspect-auto lg:min-h-[500px] relative">
          <img 
            src={post.imageUrl || 'https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80&w=1200'} 
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-8 bg-brand-rust" />
            <span className="text-brand-text/50 font-semibold tracking-[0.15em] text-[10px] uppercase">Artigo em Destaque</span>
          </div>
          
          <h2 className="text-3xl lg:text-[42px] text-brand-text font-serif leading-[1.1] mb-6">
            {post.title}
          </h2>
          
          <p className="text-brand-text/70 leading-relaxed mb-8 text-sm lg:text-base font-medium max-w-md">
            {post.summary}
          </p>
          
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-xs font-medium text-brand-text/60 mb-10">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-rust/80" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-rust/80" />
              <span>{readTime}</span>
            </div>
            {post.category && (
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-brand-rust/80" />
                <span>{post.category}</span>
              </div>
            )}
          </div>
          
          <Link 
            to="/blog/$id"
            params={{ id: post.slug || post.id }}
            search={{ categoria: undefined }}
            className="inline-flex items-center justify-center bg-brand-rust hover:bg-brand-rust/90 text-white px-8 py-4 text-xs font-semibold tracking-widest uppercase transition-colors self-start"
          >
            Ler Artigo Completo &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
