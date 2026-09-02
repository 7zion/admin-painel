import React from 'react';

export function BlogHero() {
  return (
    <section className="relative w-full bg-[#F9F8F6] overflow-hidden">
      <div className="absolute inset-y-0 right-0 w-full lg:w-[60%] h-full z-0 opacity-20 lg:opacity-100">
        <img 
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1600" 
          alt="Interior brick wall"
          className="w-full h-full object-cover object-right"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#F9F8F6] via-[#F9F8F6]/80 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 flex flex-col justify-center min-h-[600px]">
        <div className="max-w-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-8 bg-brand-rust" />
            <span className="text-brand-text/60 font-medium tracking-[0.2em] text-xs uppercase">Blog</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-[64px] text-brand-text font-serif leading-[1.1] mb-6">
            Inspiração, ideias<br />
            e conhecimento<br />
            <span className="text-brand-rust italic font-light">para transformar</span><br />
            <span className="text-brand-rust italic font-light">seus espaços.</span>
          </h1>
          <p className="text-brand-text/70 text-base sm:text-lg leading-relaxed max-w-sm font-medium">
            Conteúdos sobre revestimentos cerâmicos, tendências, dicas de instalação, conservação e muito mais.
          </p>
        </div>
      </div>
    </section>
  );
}
