import { MessageCircle, LayoutGrid, Hammer, Ruler, Box } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { EditableField } from '../../admin/EditableField';
import { Product } from '../../../types/admin';
import { useSettingsContext } from '../../../lib/settings-context';

export function ProdutosFeatured({ serverProducts = [] }: { serverProducts?: Product[] }) {
  const { widgetSettings: widgetConfig, contactSettings } = useSettingsContext();
  const globalWhatsapp = contactSettings?.whatsappNumber || widgetConfig?.whatsappNumber || '5511995038661';
  
  const featuredProduct = serverProducts.find(p => p.isProductsFeatured) || serverProducts[0];
  
  if (!featuredProduct) return null;

  return (
    <section className="py-16 bg-[#EFECE8] border-t border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row bg-[#F9F8F6] rounded overflow-hidden shadow-sm border border-gray-100">
          
          {/* Left Image */}
          <div className="lg:w-[40%] aspect-[4/3] lg:aspect-auto bg-gray-200">
            <img 
               src={featuredProduct.imageUrl} 
               alt={featuredProduct.name}
               className="w-full h-full object-cover"
            />
          </div>

          {/* Center Content */}
          <div className="lg:w-[40%] p-8 lg:p-12 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-6 bg-brand-rust"></div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-brand-rust">
                {featuredProduct.tag || "Destaque da coleção"}
              </span>
            </div>
            
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-brand-text mb-4">
              {featuredProduct.name}
            </h2>
            
            <p className="text-brand-text/80 text-sm leading-relaxed mb-8">
              {featuredProduct.description}
            </p>

            <div className="space-y-4 mb-10 text-sm">
              <div className="flex items-start gap-3">
                <LayoutGrid className="w-4 h-4 text-brand-rust mt-0.5 flex-shrink-0" strokeWidth={2} />
                <p className="text-brand-text">
                  <span className='font-bold'>Aplicação:</span> {featuredProduct.aplicacao || 'Consulte-nos'}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Hammer className="w-4 h-4 text-brand-rust mt-0.5 flex-shrink-0" strokeWidth={2} />
                <p className="text-brand-text">
                  <span className='font-bold'>Estilo:</span> {featuredProduct.estilo || 'Padrão'}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Ruler className="w-4 h-4 text-brand-rust mt-0.5 flex-shrink-0" strokeWidth={2} />
                <p className="text-brand-text">
                  <span className='font-bold'>Formato:</span> {featuredProduct.tamanho || 'Diversos'}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Box className="w-4 h-4 text-brand-rust mt-0.5 flex-shrink-0" strokeWidth={2} />
                <p className="text-brand-text">
                  <span className='font-bold'>Unidade:</span> {featuredProduct.unidade || 'm²'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/produto/$id" params={{ id: featuredProduct.id }} className="bg-brand-rust hover:bg-brand-rust-dark text-white px-6 py-3 rounded text-sm font-bold text-center transition-colors shadow-sm">
                Ver página do produto
              </Link>
              <a href={`https://api.whatsapp.com/send?phone=${globalWhatsapp}${widgetConfig?.whatsappMessage ? '&text=' + encodeURIComponent(widgetConfig.whatsappMessage) : ''}`} target="_blank" rel="noopener noreferrer" className="border border-brand-text/20 hover:border-brand-text/40 hover:bg-black/5 text-brand-text px-6 py-3 rounded text-sm font-bold flex items-center justify-center gap-2 transition-all">
                <MessageCircle className="w-4 h-4" />
                Solicitar no WhatsApp
              </a>
            </div>
          </div>

          {/* Right Image (Texture) */}
          <div className="lg:w-[20%] hidden lg:block bg-gray-200">
            <img 
               src={featuredProduct.galleryUrls && featuredProduct.galleryUrls.length > 0 ? featuredProduct.galleryUrls[0] : featuredProduct.imageUrl} 
               alt={`Textura ${featuredProduct.name}`}
               className="w-full h-full object-cover"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
