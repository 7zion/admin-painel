import { MessageCircle } from 'lucide-react';
import { EditableField } from '../../admin/EditableField';

export function ContatoCTA() {
  return (
    <section className="bg-brand-bg py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-lg overflow-hidden flex items-center min-h-[300px]">
          
          <EditableField id="contato_cta_img" defaultValue="https://images.unsplash.com/photo-1596489370836-47a80b6883ec?q=80&w=2072&auto=format&fit=crop" type="image">
            {(url) => (
              <div 
                className="absolute inset-0 z-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${url}')` }}
              >
                <div className="absolute inset-0 bg-black/50 lg:bg-gradient-to-r lg:from-black/80 lg:to-transparent"></div>
              </div>
            )}
          </EditableField>

          <div className="relative z-10 p-8 md:p-12 w-full flex flex-col lg:flex-row items-center justify-between gap-10">
            
            <div className="lg:w-1/2 text-center lg:text-left">
              <EditableField id="contato_cta_title" defaultValue="Seu projeto começa com<br />a <em class='font-serif italic text-brand-rust'>escolha certa.</em>" type="html">
                {(html, styles) => (
                  <h2 
                    className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-[1.1] mb-4 drop-shadow-md"
                    style={{ ...styles, color: styles?.color || 'white' }}
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                )}
              </EditableField>
              
              <EditableField id="contato_cta_desc" defaultValue="Fale com nossa equipe e receba orientação sobre o revestimento ideal para valorizar seu projeto.">
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
                <EditableField id="icon_ContatoCTA_MessageCircle_nsydc" defaultValue="" type="image">{(url) => url ? <img src={url} alt="MessageCircle" className="w-5 h-5 object-contain" /> : <MessageCircle className="w-5 h-5" />}</EditableField>
                <EditableField id="contato_cta_btn1" defaultValue="Falar no WhatsApp">
                  {(text, styles) => <span style={{ ...styles, color: styles?.color || 'white' }}>{text}</span>}
                </EditableField>
              </a>
              <button 
                type="button" 
                className="w-full sm:w-auto border border-brand-rust bg-brand-rust/20 hover:bg-brand-rust/40 text-white px-8 py-4 rounded font-bold text-sm text-center transition-colors shadow-sm backdrop-blur-sm"
              >
                <EditableField id="contato_cta_btn2" defaultValue="Solicitar orçamento">
                  {(text, styles) => <span style={{ ...styles, color: styles?.color || 'white' }}>{text}</span>}
                </EditableField>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
