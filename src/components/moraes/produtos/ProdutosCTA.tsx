import { MessageCircle } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { EditableField } from '../../admin/EditableField';

export function ProdutosCTA() {
  return (
    <section className="bg-brand-rust text-white py-16 relative overflow-hidden">
      {/* Decorative left image */}
      <div className="absolute left-0 bottom-0 w-64 h-64 opacity-40 mix-blend-multiply pointer-events-none hidden md:block">
        <EditableField id="produtos_cta_img1" defaultValue="https://images.unsplash.com/photo-1596489370836-47a80b6883ec?q=80&w=400&auto=format&fit=crop" type="image" className="w-full h-full">
          {(url) => (
            <img src={url} alt="Decor" className="w-full h-full object-cover rounded-tr-full" />
          )}
        </EditableField>
      </div>
      
      {/* Decorative right image */}
      <div className="absolute right-0 top-0 bottom-0 w-80 opacity-40 mix-blend-multiply pointer-events-none hidden lg:block">
        <EditableField id="produtos_cta_img2" defaultValue="https://images.unsplash.com/photo-1600607688969-a5bfcd64bd03?q=80&w=600&auto=format&fit=crop" type="image" className="w-full h-full">
          {(url) => (
            <img src={url} alt="Decor" className="w-full h-full object-cover" />
          )}
        </EditableField>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
          
          <div className="lg:w-1/2 text-center lg:text-left">
            <EditableField id="produtos_cta_title" defaultValue="Precisa de ajuda para escolher<br />o revestimento ideal?" type="html">
              {(html, styles) => (
                <h2 
                  className="font-serif text-3xl md:text-4xl font-bold mb-4 drop-shadow-sm leading-tight"
                  style={{ ...styles, color: styles?.color || 'white' }}
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              )}
            </EditableField>
            
            <EditableField id="produtos_cta_desc" defaultValue="Nossa equipe orienta arquitetos, construtoras e clientes finais na escolha do acabamento certo para cada projeto.">
              {(text, styles) => (
                <p 
                  className="text-white/90 text-sm md:text-base drop-shadow-sm max-w-md mx-auto lg:mx-0"
                  style={{ ...styles, color: styles?.color || 'rgba(255, 255, 255, 0.9)' }}
                >
                  {text}
                </p>
              )}
            </EditableField>
          </div>
          
          <div className="lg:w-1/2 flex flex-col sm:flex-row items-center justify-center lg:justify-end gap-4 w-full">
            <a 
              href="https://wa.me/5511995038661" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-brand-green hover:bg-brand-green-dark text-white px-8 py-4 rounded font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <EditableField id="icon_ProdutosCTA_MessageCircle_yfhod" defaultValue="" type="image">{(url) => url ? <img src={url} alt="MessageCircle" className="w-5 h-5 object-contain" /> : <MessageCircle className="w-5 h-5" />}</EditableField>
              Falar no WhatsApp
            </a>
            <EditableField id="produtos_cta_btn" defaultValue="Ver páginas de produto">
              {(text, styles) => (
                <Link 
                  to="/produtos" 
                  className="w-full sm:w-auto border border-white hover:bg-white/10 text-white px-8 py-4 rounded font-bold text-sm text-center transition-colors shadow-sm"
                  style={{ ...styles, color: styles?.color || 'white' }}
                >
                  {text}
                </Link>
              )}
            </EditableField>
          </div>

        </div>
      </div>
    </section>
  );
}
