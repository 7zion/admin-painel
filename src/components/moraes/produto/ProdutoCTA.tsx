import { MessageCircle, ShieldCheck } from 'lucide-react';
import { EditableField } from '../../admin/EditableField';
import { useSettingsContext } from '../../../lib/settings-context';

export function ProdutoCTA() {
  const { contactSettings } = useSettingsContext();
  const whatsappUrl = `https://wa.me/${contactSettings?.whatsappNumber || '5511995038661'}`;

  return (
    <section className="bg-[#8C5A3C] text-white py-12 relative overflow-hidden">
      
      {/* Texture background overlay */}
      <EditableField id="prod_cta_bg" defaultValue="https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?q=80&w=2000&auto=format&fit=crop" type="image">
        {(url) => (
          <div 
            className="absolute inset-0 z-0 opacity-10 mix-blend-multiply"
            style={{ backgroundImage: `url('${url}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          ></div>
        )}
      </EditableField>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
          
          <div className="flex items-center gap-8 lg:w-2/3">
            <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 hidden sm:block border-4 border-white/20 bg-white/10">
              <EditableField id="prod_cta_img" defaultValue="https://images.unsplash.com/photo-1599598425947-33002621ec66?q=80&w=200&auto=format&fit=crop" type="image" className="w-full h-full">
                {(url) => (
                  <img src={url} alt="Planta decorativa" className="w-full h-full object-cover" />
                )}
              </EditableField>
            </div>
            
            <div className="text-center sm:text-left">
              <EditableField id="prod_cta_title" defaultValue="Gostou deste revestimento?">
                {(text, styles) => (
                  <h2 
                    className="font-serif text-3xl font-bold mb-3 drop-shadow-sm"
                    style={{ ...styles, color: styles?.color || 'white' }}
                  >
                    {text}
                  </h2>
                )}
              </EditableField>
              <EditableField id="prod_cta_desc" defaultValue="Fale com nossa equipe no WhatsApp e receba orientação sobre quantidade, formas de aplicação e orçamento personalizado.">
                {(text, styles) => (
                  <p 
                    className="text-white/90 text-sm drop-shadow-sm max-w-lg leading-relaxed"
                    style={{ ...styles, color: styles?.color || 'rgba(255, 255, 255, 0.9)' }}
                  >
                    {text}
                  </p>
                )}
              </EditableField>
            </div>
          </div>
          
          <div className="lg:w-1/3 flex flex-col items-center lg:items-end gap-3 w-full">
            <a 
              href={whatsappUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-[#314A36] hover:bg-[#253929] text-white px-8 py-4 rounded font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <EditableField id="icon_ProdutoCTA_MessageCircle_fhymz" defaultValue="" type="image">{(url) => url ? <img src={url} alt="MessageCircle" className="w-5 h-5 object-contain" /> : <MessageCircle className="w-5 h-5" />}</EditableField>
              <EditableField id="prod_cta_btn" defaultValue="Solicitar no WhatsApp">
                {(text, styles) => <span style={{ ...styles, color: styles?.color || 'white' }}>{text}</span>}
              </EditableField>
            </a>
            <div className="flex items-center gap-2 text-white/90 text-[11px] font-medium tracking-wide">
              <EditableField id="icon_ProdutoCTA_ShieldCheck_qhfvh" defaultValue="" type="image">{(url) => url ? <img src={url} alt="ShieldCheck" className="w-4 h-4 object-contain" /> : <ShieldCheck className="w-4 h-4" />}</EditableField>
              <EditableField id="prod_cta_badge" defaultValue="Atendimento rápido e personalizado">
                {(text, styles) => (
                  <span style={{ ...styles, color: styles?.color || 'rgba(255, 255, 255, 0.9)' }}>
                    {text}
                  </span>
                )}
              </EditableField>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
