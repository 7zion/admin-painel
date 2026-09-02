import { MessageCircle } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { EditableField } from '../../admin/EditableField';

export function ProjetosCTA() {
  return (
    <section className="py-12 lg:py-16 bg-[#F9F8F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-rust rounded-lg overflow-hidden relative shadow-lg">
          
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
          
          <div className="flex flex-col md:flex-row items-stretch relative z-10">
            <div className="w-full md:w-1/3 h-64 md:h-auto min-h-[300px] bg-gray-200">
              <EditableField id="proj_cta_img" defaultValue="https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=600&auto=format&fit=crop" type="image" className="w-full h-full">
                {(url) => (
                  <img 
                    src={url} 
                    alt="Detalhe" 
                    className="w-full h-full object-cover"
                  />
                )}
              </EditableField>
            </div>
            
            <div className="w-full md:w-2/3 p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="lg:max-w-xl text-center lg:text-left">
                <EditableField id="proj_cta_title" defaultValue="Quer ver seu projeto aqui também?">
                  {(text, styles) => (
                    <h2 
                      className="font-serif text-3xl font-bold text-[#F9F8F6] mb-4"
                      style={{ ...styles, color: styles?.color || '#F9F8F6' }}
                    >
                      {text}
                    </h2>
                  )}
                </EditableField>
                
                <EditableField id="proj_cta_desc" defaultValue="Arquitetos, construtoras e clientes: envie seu projeto para o nosso time e mostre como você usa os revestimentos Moraes para transformar espaços em obras únicas e inspiradoras.">
                  {(text, styles) => (
                    <p 
                      className="text-[#F9F8F6]/80 text-sm leading-relaxed"
                      style={{ ...styles, color: styles?.color || 'rgba(249, 248, 246, 0.8)' }}
                    >
                      {text}
                    </p>
                  )}
                </EditableField>
              </div>
              
              <div className="flex flex-col sm:flex-row lg:flex-col gap-4 min-w-[240px]">
                <a 
                  href="https://wa.me/5511995038661" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-brand-green hover:bg-brand-green-dark text-white px-6 py-4 rounded text-sm font-bold flex items-center justify-center gap-2 transition-colors w-full text-center"
                >
                  <EditableField id="icon_ProjetosCTA_MessageCircle_iz7r6" defaultValue="" type="image">{(url) => url ? <img src={url} alt="MessageCircle" className="w-5 h-5 object-contain" /> : <MessageCircle className="w-5 h-5" />}</EditableField>
                  <EditableField id="proj_cta_btn1" defaultValue="Falar no WhatsApp">
                    {(text, styles) => <span style={{ ...styles, color: styles?.color || 'white' }}>{text}</span>}
                  </EditableField>
                </a>
                
                <Link 
                  to="/produtos" 
                  className="border border-[#F9F8F6] hover:bg-[#F9F8F6]/10 text-[#F9F8F6] px-6 py-4 rounded text-sm font-bold transition-colors w-full text-center"
                >
                  <EditableField id="proj_cta_btn2" defaultValue="Conhecer produtos">
                    {(text, styles) => <span style={{ ...styles, color: styles?.color || '#F9F8F6' }}>{text}</span>}
                  </EditableField>
                </Link>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
