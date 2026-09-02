import React, { useState } from 'react';
import { BlogPost } from '../../../types/admin';
import { EditableField } from '../../admin/EditableField';

export function BlogPostHero({ post }: { post: BlogPost }) {
  const [activeImage, setActiveImage] = useState(post.imageUrl);
  const images = [post.imageUrl, ...(post.galleryUrls || [])].filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left: Images */}
        <div className="lg:w-3/5">
          <div className="aspect-[16/10] rounded-sm overflow-hidden bg-gray-100 mb-4">
            <img src={activeImage} alt={post.title} className="w-full h-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {images.slice(0, 5).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`aspect-square rounded-sm overflow-hidden bg-gray-100 border-2 transition-all ${activeImage === img ? 'border-brand-rust' : 'border-transparent hover:opacity-80'}`}
                >
                  <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="lg:w-2/5 flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-[1px] bg-brand-rust"></div>
            <span className="text-xs font-bold text-brand-rust uppercase tracking-wider">{post.category || 'ARTIGO'}</span>
          </div>
          
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-brand-text mb-6 leading-tight">
            {post.title}
          </h1>
          
          <p className="text-sm text-brand-text/70 leading-relaxed mb-8">
            {post.summary}
          </p>

          <div className="border-t border-gray-200 py-4 flex flex-col gap-3 flex-grow">
            {post.local && (
              <div className="flex border-b border-gray-100 pb-3">
                <span className="text-xs font-bold text-brand-text/50 w-1/3 flex items-center gap-2">
                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  Local
                </span>
                <span className="text-sm text-brand-text font-medium flex-1">{post.local}</span>
              </div>
            )}
            {post.tipologia && (
              <div className="flex border-b border-gray-100 pb-3">
                <span className="text-xs font-bold text-brand-text/50 w-1/3 flex items-center gap-2">
                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  Tipologia
                </span>
                <span className="text-sm text-brand-text font-medium flex-1">{post.tipologia}</span>
              </div>
            )}
            {post.aplicacoes && (
              <div className="flex border-b border-gray-100 pb-3">
                <span className="text-xs font-bold text-brand-text/50 w-1/3 flex items-center gap-2">
                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                  Aplicações
                </span>
                <span className="text-sm text-brand-text font-medium flex-1">{post.aplicacoes}</span>
              </div>
            )}
            {post.produtosUtilizados && (
              <div className="flex border-b border-gray-100 pb-3">
                <span className="text-xs font-bold text-brand-text/50 w-1/3 flex items-center gap-2">
                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                  Produtos
                </span>
                <span className="text-sm text-brand-text font-medium flex-1">{post.produtosUtilizados}</span>
              </div>
            )}
            {post.estilo && (
              <div className="flex border-b border-gray-100 pb-3">
                <span className="text-xs font-bold text-brand-text/50 w-1/3 flex items-center gap-2">
                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  Estilo
                </span>
                <span className="text-sm text-brand-text font-medium flex-1">{post.estilo}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
