import React from 'react';
import { Lock, Instagram, Facebook, Phone, Mail, MapPin } from 'lucide-react';

export function BlogCTA() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
      <div className="bg-[#EBE5DE] rounded-none flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Newsletter */}
        <div className="w-full lg:w-1/2 p-10 sm:p-12 lg:p-16 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-brand-text/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-6 bg-brand-rust" />
            <span className="text-brand-text/50 font-semibold tracking-[0.15em] text-[10px] uppercase">Receba conteúdos exclusivos</span>
          </div>
          
          <h2 className="text-3xl lg:text-[32px] text-brand-text font-serif leading-tight mb-10 max-w-sm">
            Cadastre-se e receba dicas, lançamentos e inspirações no seu e-mail.
          </h2>
          
          <form className="flex flex-col sm:flex-row w-full mb-5">
            <input 
              type="email" 
              placeholder="Seu melhor e-mail" 
              className="flex-grow px-6 py-4 bg-white text-brand-text placeholder-brand-text/40 focus:outline-none focus:ring-1 focus:ring-brand-rust text-sm"
              required
            />
            <button 
              type="submit" 
              className="bg-brand-text/80 hover:bg-brand-rust text-white px-8 py-4 text-xs font-semibold tracking-widest uppercase transition-colors whitespace-nowrap"
            >
              Quero Receber
            </button>
          </form>
          
          <div className="flex items-center gap-2 text-brand-text/50 text-[11px] font-medium">
            <Lock className="w-3 h-3" />
            <span>Respeitamos sua privacidade. Não enviamos spam.</span>
          </div>
        </div>

        {/* Right: Share */}
        <div className="w-full lg:w-1/2 flex">
          <div className="w-full sm:w-3/5 p-10 sm:p-12 lg:p-16 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-6 bg-brand-text/20" />
              <span className="text-brand-text/50 font-semibold tracking-[0.15em] text-[10px] uppercase">Compartilhe conhecimento</span>
            </div>
            
            <h2 className="text-2xl lg:text-[28px] text-brand-text font-serif leading-[1.2] mb-10">
              Gostou de algum artigo?<br />
              Compartilhe com quem também ama transformar ambientes.
            </h2>
            
            <div className="flex flex-wrap items-center gap-3">
              <a href="#" className="w-10 h-10 rounded-full border border-brand-text/20 flex items-center justify-center hover:border-brand-rust hover:text-brand-rust transition-colors text-brand-text/70 bg-[#EBE5DE]">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-brand-text/20 flex items-center justify-center hover:border-brand-rust hover:text-brand-rust transition-colors text-brand-text/70 bg-[#EBE5DE]">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-brand-text/20 flex items-center justify-center hover:border-brand-rust hover:text-brand-rust transition-colors text-brand-text/70 bg-[#EBE5DE]">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-brand-text/20 flex items-center justify-center hover:border-brand-rust hover:text-brand-rust transition-colors text-brand-text/70 bg-[#EBE5DE]">
                <MapPin className="w-4 h-4" /> {/* Replacing Pinterest with MapPin or just omit if no pin icon */}
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-brand-text/20 flex items-center justify-center hover:border-brand-rust hover:text-brand-rust transition-colors text-brand-text/70 bg-[#EBE5DE]">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
          <div className="hidden sm:block w-2/5 relative">
            <img 
              src="https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&q=80&w=400" 
              alt="Decorative"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
