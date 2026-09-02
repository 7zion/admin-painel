import { MessageCircle } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { EditableField } from '../../admin/EditableField';

export function CtaSection() {
  return (
    <EditableField id="home_cta_bg" defaultValue="https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?q=80&w=2072&auto=format&fit=crop" type="image">
      {(url) => (
        <section className="bg-brand-rust text-white py-12 relative overflow-hidden">
          {/* Decorative background image blended */}
          <div 
            className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay pointer-events-none"
            style={{ backgroundImage: `url('${url}')` }}
          ></div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-3/5">
              <EditableField id="home_cta_title" defaultValue="Seu projeto merece um acabamento com identidade.">
                {(text, styles) => (
                  <h2 className="font-serif text-2xl md:text-3xl font-bold mb-3 drop-shadow-sm" style={styles}>
                    {text}
                  </h2>
                )}
              </EditableField>
              <EditableField id="home_cta_desc" defaultValue="Fale com nossa equipe e receba orientação para escolher o revestimento ideal.">
                {(text, styles) => (
                  <p className="text-white/90 text-sm md:text-base drop-shadow-sm" style={styles}>
                    {text}
                  </p>
                )}
              </EditableField>
            </div>
            
            <div className="md:w-2/5 flex flex-col sm:flex-row items-center justify-end gap-4 w-full">
              <EditableField id="home_cta_btn1" defaultValue="Comprar pelo WhatsApp">
                {(text, styles) => (
                  <a 
                    href="https://wa.me/5511995038661" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto bg-brand-green hover:bg-brand-green-dark text-white px-6 py-3.5 rounded font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
                    style={styles}
                  >
                    <EditableField id="icon_CtaSection_MessageCircle_kv7id" defaultValue="" type="image">{(url) => url ? <img src={url} alt="MessageCircle" className="w-5 h-5 object-contain" /> : <MessageCircle className="w-5 h-5" />}</EditableField>
                    {text}
                  </a>
                )}
              </EditableField>
              <EditableField id="home_cta_btn2" defaultValue="Solicitar atendimento">
                {(text, styles) => (
                  <Link 
                    to="/contato" 
                    className="w-full sm:w-auto border border-white hover:bg-white/10 text-white px-6 py-3.5 rounded font-bold text-sm flex items-center justify-center transition-colors shadow-sm"
                    style={styles}
                  >
                    {text}
                  </Link>
                )}
              </EditableField>
            </div>
          </div>
        </section>
      )}
    </EditableField>
  );
}
