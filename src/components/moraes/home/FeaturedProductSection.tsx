import { MessageCircle, LayoutGrid, Hammer, Ruler, Box } from 'lucide-react';
import { EditableField } from '../../admin/EditableField';
import { Product } from '../../../types/admin';
import { useSettingsContext } from '../../../lib/settings-context';
import { useState, useEffect } from 'react';

export function FeaturedProductSection({ serverProducts = [] }: { serverProducts?: Product[] }) {
  const { widgetSettings: widgetConfig, contactSettings } = useSettingsContext();
  const globalWhatsapp = contactSettings?.whatsappNumber || widgetConfig?.whatsappNumber || '5511995038661';
  
  const featuredProduct = serverProducts.find(p => p.isFeatured) || serverProducts[0];
  
  const [activeIndex, setActiveIndex] = useState(0);

  const allImages = featuredProduct 
    ? [featuredProduct.imageUrl, ...(featuredProduct.galleryUrls || [])].filter(Boolean) 
    : [];

  useEffect(() => {
    if (allImages.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % allImages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [allImages.length]);

  if (!featuredProduct) return null;

  return (
    <section className="py-20 bg-[#EFECE8] border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-bg rounded-lg shadow-sm border border-gray-100 p-6 lg:p-8 flex flex-col lg:flex-row gap-10">
          
          {/* Images */}
          <div className="lg:w-1/2 flex gap-4">
            <div className="w-20 flex-shrink-0 hidden sm:block relative overflow-hidden">
              <div 
                className="flex flex-col gap-3 absolute top-0 left-0 w-full transition-transform duration-700 ease-in-out"
                style={{ transform: `translateY(-${activeIndex * (80 + 12)}px)` }}
              >
                {allImages.map((url, i) => (
                  <div key={i} className={`w-20 h-20 flex-shrink-0 bg-gray-200 rounded overflow-hidden cursor-pointer border-2 transition-colors duration-300 ${i === activeIndex ? "border-brand-rust" : "border-transparent hover:border-gray-300"}`}
                    onClick={() => setActiveIndex(i)}>
                    <img src={url} alt="Thumb" className="w-full h-full object-cover" />
                  </div>
                ))}
                {allImages.length > 0 && allImages.map((url, i) => (
                  <div key={`dup-${i}`} className={`w-20 h-20 flex-shrink-0 bg-gray-200 rounded overflow-hidden cursor-pointer border-2 transition-colors duration-300 ${i === activeIndex ? "border-brand-rust" : "border-transparent hover:border-gray-300"}`}
                    onClick={() => setActiveIndex(i)}>
                    <img src={url} alt="Thumb" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex-1 bg-gray-200 rounded overflow-hidden aspect-[4/3] lg:aspect-auto lg:h-[450px]">
              <img src={allImages[activeIndex] || featuredProduct.imageUrl} alt={featuredProduct.name} className="w-full h-full object-cover transition-all duration-500" />
            </div>
          </div>

          {/* Details */}
          <div className="lg:w-1/2 flex flex-col justify-center">
            <div className="text-[10px] text-brand-text/50 uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
              <span className="hover:text-brand-text cursor-pointer">Loja</span>
              <span>/</span>
              <span className="hover:text-brand-text cursor-pointer">Brick</span>
              <span>/</span>
              <span className="text-brand-text">{featuredProduct.name}</span>
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-text">{featuredProduct.name}</h2>
              {featuredProduct.tag && <span className="text-[10px] uppercase font-bold border border-gray-300 text-brand-text/60 px-2 py-0.5 rounded">{featuredProduct.tag}</span>}
            </div>
            
            <p className="text-brand-text/80 text-sm leading-relaxed mb-8 max-w-lg">{featuredProduct.description}</p>

            <div className="space-y-5 mb-8">
              <div className="flex items-start gap-3">
                <EditableField id="icon_FeaturedProductSection_LayoutGrid_7568n" defaultValue="" type="image">{(url) => url ? <img src={url} alt="LayoutGrid" className="w-5 h-5 text-brand-rust mt-0.5 flex-shrink-0 object-contain" /> : <LayoutGrid className="w-5 h-5 text-brand-rust mt-0.5 flex-shrink-0" strokeWidth={1.5} />}</EditableField>
                <div>
                  <h4 className="text-xs font-bold text-brand-text">Aplicações sugeridas</h4>
                  <p className="text-xs text-brand-text/70">{featuredProduct.aplicacao || 'Consulte-nos'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <EditableField id="icon_FeaturedProductSection_Hammer_k2svv" defaultValue="" type="image">{(url) => url ? <img src={url} alt="Hammer" className="w-5 h-5 text-brand-rust mt-0.5 flex-shrink-0 object-contain" /> : <Hammer className="w-5 h-5 text-brand-rust mt-0.5 flex-shrink-0" strokeWidth={1.5} />}</EditableField>
                <div>
                  <h4 className="text-xs font-bold text-brand-text">Acabamento</h4>
                  <p className="text-xs text-brand-text/70">{featuredProduct.acabamento || 'Padrão'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <EditableField id="icon_FeaturedProductSection_Ruler_tknlq" defaultValue="" type="image">{(url) => url ? <img src={url} alt="Ruler" className="w-5 h-5 text-brand-rust mt-0.5 flex-shrink-0 object-contain" /> : <Ruler className="w-5 h-5 text-brand-rust mt-0.5 flex-shrink-0" strokeWidth={1.5} />}</EditableField>
                <div>
                  <h4 className="text-xs font-bold text-brand-text">Formato</h4>
                  <p className="text-xs text-brand-text/70">{featuredProduct.tamanho || 'Diversos'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <EditableField id="icon_FeaturedProductSection_Box_d7qis" defaultValue="" type="image">{(url) => url ? <img src={url} alt="Box" className="w-5 h-5 text-brand-rust mt-0.5 flex-shrink-0 object-contain" /> : <Box className="w-5 h-5 text-brand-rust mt-0.5 flex-shrink-0" strokeWidth={1.5} />}</EditableField>
                <div>
                  <h4 className="text-xs font-bold text-brand-text">Unidade</h4>
                  <p className="text-xs text-brand-text/70">{featuredProduct.unidade || 'm²'}</p>
                </div>
              </div>
            </div>

            {/* WhatsApp Box */}
            <div className="bg-[#F5F3ED] rounded p-6 max-w-sm">
              <EditableField id="home_featured_cta_title" defaultValue="Solicite pelo WhatsApp">
                {(text, styles) => <h4 className="font-serif text-lg font-bold text-brand-text mb-2" style={styles}>{text}</h4>}
              </EditableField>
              <EditableField id="home_featured_cta_desc" defaultValue="Fale com nossa equipe e receba orientações sobre quantidade, prazo de entrega e valores.">
                {(text, styles) => <p className="text-xs text-brand-text/70 leading-relaxed mb-5" style={styles}>{text}</p>}
              </EditableField>
              
              <EditableField id="home_featured_cta_btn" defaultValue="Solicitar no WhatsApp">
                {(text, styles) => (
                  <a 
                    href={`https://api.whatsapp.com/send?phone=${globalWhatsapp}${widgetConfig?.whatsappMessage ? '&text=' + encodeURIComponent(widgetConfig.whatsappMessage) : ''}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full bg-brand-green hover:bg-brand-green-dark text-white rounded py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm mb-4"
                    style={styles}
                  >
                    <EditableField id="icon_FeaturedProductSection_MessageCircle_2p3mb" defaultValue="" type="image">{(url) => url ? <img src={url} alt="MessageCircle" className="w-5 h-5 object-contain" /> : <MessageCircle className="w-5 h-5" />}</EditableField>
                    {text}
                  </a>
                )}
              </EditableField>
              
              <div className="flex items-center gap-2 text-xs text-brand-text/60 justify-center">
                <svg className="w-4 h-4 text-brand-rust" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Atendimento rápido e personalizado
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
