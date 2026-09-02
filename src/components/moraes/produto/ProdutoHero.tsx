import { MessageCircle, LayoutGrid, Palette, Box } from 'lucide-react';
import { Product } from '../../../types/admin';
import { EditableField } from '../../admin/EditableField';
import { useState, useEffect } from 'react';
import { useSettingsContext } from '../../../lib/settings-context';

interface ProdutoHeroProps {
  product: Product;
}

export function ProdutoHero({ product }: ProdutoHeroProps) {
  const allImages = [product.imageUrl, ...(product.galleryUrls || [])].filter(Boolean);
  const [activeImage, setActiveImage] = useState(allImages[0] || product.imageUrl);
  const { contactSettings } = useSettingsContext();
  
  // Ensure the active image updates when the product changes
  useEffect(() => {
    setActiveImage(allImages[0] || product.imageUrl);
  }, [product.id, product.imageUrl, product.galleryUrls]);

  const globalWhatsapp = contactSettings?.whatsappNumber || '5511995038661';

  return (
    <section className="py-10 bg-[#F9F8F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          
          {/* Images */}
          <div className="lg:w-1/2">
            <div className="flex flex-col gap-4">
              <div className="w-full aspect-square rounded overflow-hidden shadow-sm bg-gray-200">
                <img src={activeImage} alt={product.name} className="w-full h-full object-cover" />
              </div>
              
              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {allImages.map((img, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`aspect-square rounded overflow-hidden cursor-pointer border-2 transition-colors bg-gray-200 ${activeImage === img ? 'border-brand-rust' : 'border-transparent hover:border-gray-300'}`}
                    >
                      <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Info */}
          <div className="lg:w-1/2 flex flex-col">
            <div className="mb-2">
              <span className="text-[10px] uppercase tracking-widest font-bold text-brand-text/50 bg-gray-200 px-2 py-1 rounded">
                {product.tag || product.category}
              </span>
            </div>
            
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-brand-text mb-4">
              {product.name}
            </h1>
            
            <p className="text-brand-text/80 text-sm md:text-base leading-relaxed mb-8">
              {product.description || 'Um revestimento que traz personalidade e elegância aos espaços.'}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 mb-8 text-sm">
              <div className="flex items-start gap-4">
                <EditableField id="icon_ProdutoHero_LayoutGrid_7gflg" defaultValue="" type="image">{(url) => url ? <img src={url} alt="LayoutGrid" className="w-4 h-4 text-brand-rust mt-0.5 flex-shrink-0 object-contain" /> : <LayoutGrid className="w-4 h-4 text-brand-rust mt-0.5 flex-shrink-0" strokeWidth={2} />}</EditableField>
                <div className="flex w-full">
                  <EditableField id="prod_hero_label_tamanho" defaultValue="Tamanho">
                    {(text, styles) => <span className="font-bold text-brand-text w-1/3" style={styles}>{text}</span>}
                  </EditableField>
                  <span className="text-brand-text/80">{product.tamanho || '-'}</span>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <EditableField id="icon_ProdutoHero_Box_9ovxf" defaultValue="" type="image">{(url) => url ? <img src={url} alt="Box" className="w-4 h-4 text-brand-rust mt-0.5 flex-shrink-0 object-contain" /> : <Box className="w-4 h-4 text-brand-rust mt-0.5 flex-shrink-0" strokeWidth={2} />}</EditableField>
                <div className="flex w-full">
                  <EditableField id="prod_hero_label_unidade" defaultValue="Unidade">
                    {(text, styles) => <span className="font-bold text-brand-text w-1/3" style={styles}>{text}</span>}
                  </EditableField>
                  <span className="text-brand-text/80">{product.unidade || '-'}</span>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <EditableField id="icon_ProdutoHero_LayoutGrid_wuhqc" defaultValue="" type="image">{(url) => url ? <img src={url} alt="LayoutGrid" className="w-4 h-4 text-brand-rust mt-0.5 flex-shrink-0 object-contain" /> : <LayoutGrid className="w-4 h-4 text-brand-rust mt-0.5 flex-shrink-0" strokeWidth={2} />}</EditableField>
                <div className="flex w-full">
                  <EditableField id="prod_hero_label_aplicacao" defaultValue="Aplicação">
                    {(text, styles) => <span className="font-bold text-brand-text w-1/3" style={styles}>{text}</span>}
                  </EditableField>
                  <span className="text-brand-text/80">{product.aplicacao || '-'}</span>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <EditableField id="icon_ProdutoHero_Palette_xciu2" defaultValue="" type="image">{(url) => url ? <img src={url} alt="Palette" className="w-4 h-4 text-brand-rust mt-0.5 flex-shrink-0 object-contain" /> : <Palette className="w-4 h-4 text-brand-rust mt-0.5 flex-shrink-0" strokeWidth={2} />}</EditableField>
                <div className="flex w-full">
                  <EditableField id="prod_hero_label_estilo" defaultValue="Estilo">
                    {(text, styles) => <span className="font-bold text-brand-text w-1/3" style={styles}>{text}</span>}
                  </EditableField>
                  <span className="text-brand-text/80">{product.estilo || '-'}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-[#F0EEE9] rounded p-5 mb-8">
              <EditableField id="prod_hero_info_title" defaultValue="Informações principais">
                {(text, styles) => (
                  <h4 className="font-bold text-xs text-brand-text uppercase tracking-wider mb-4" style={styles}>{text}</h4>
                )}
              </EditableField>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-gray-300/50 pb-2">
                  <EditableField id="prod_hero_label_categoria" defaultValue="Categoria">
                    {(text, styles) => <span className="font-bold text-brand-text" style={styles}>{text}</span>}
                  </EditableField>
                  <span className="text-brand-text/80">{product.category || '-'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-300/50 pb-2">
                  <EditableField id="prod_hero_label_colecao" defaultValue="Coleção">
                    {(text, styles) => <span className="font-bold text-brand-text" style={styles}>{text}</span>}
                  </EditableField>
                  <span className="text-brand-text/80">{product.colecao || '-'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-300/50 pb-2">
                  <EditableField id="prod_hero_label_acabamento" defaultValue="Acabamento">
                    {(text, styles) => <span className="font-bold text-brand-text" style={styles}>{text}</span>}
                  </EditableField>
                  <span className="text-brand-text/80">{product.acabamento || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <EditableField id="prod_hero_label_tonalidade" defaultValue="Tonalidade">
                    {(text, styles) => <span className="font-bold text-brand-text" style={styles}>{text}</span>}
                  </EditableField>
                  <span className="text-brand-text/80">{product.tonalidade || '-'}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 mt-auto">
              <a href={`https://wa.me/${product.ctaValue || globalWhatsapp}`} target="_blank" rel="noopener noreferrer" className="bg-brand-green hover:bg-brand-green-dark text-white px-6 py-4 rounded text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm">
                <EditableField id="icon_ProdutoHero_MessageCircle_kyful" defaultValue="" type="image">{(url) => url ? <img src={url} alt="MessageCircle" className="w-5 h-5 object-contain" /> : <MessageCircle className="w-5 h-5" />}</EditableField>
                <EditableField id="prod_hero_btn1" defaultValue="Solicitar no WhatsApp">
                  {(text, styles) => <span style={{ ...styles, color: styles?.color || 'white' }}>{text}</span>}
                </EditableField>
              </a>
              <button type="button" onClick={() => window.history.back()} className="border border-brand-text/20 hover:border-brand-text/40 hover:bg-black/5 text-brand-text px-6 py-4 rounded text-sm font-bold flex items-center justify-center transition-all">
                <EditableField id="prod_hero_btn2" defaultValue="Ver outros produtos">
                  {(text, styles) => <span style={styles}>{text}</span>}
                </EditableField>
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
}
