import { HeartHandshake, ShieldCheck, MapPin } from 'lucide-react';
import { EditableField } from '../../admin/EditableField';

export function SobreHero() {
  return (
    <section className="bg-brand-bg pt-12 md:pt-20 pb-16 md:pb-24 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
          
          <div className="lg:w-1/2">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-8 bg-brand-rust"></div>
              <EditableField id="sobre_hero_tag" defaultValue="Quem Somos">
                {(text, styles) => (
                  <span className="text-[10px] uppercase tracking-widest font-bold text-brand-text" style={styles}>{text}</span>
                )}
              </EditableField>
            </div>
            
            <EditableField id="sobre_hero_title" defaultValue="Tradição que<br />se vê em cada<br /><em class='font-serif italic text-brand-rust'>detalhe.</em>" type="html">
              {(html, styles) => (
                <h1 
                  className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-brand-text leading-[1.1] mb-8"
                  style={styles}
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              )}
            </EditableField>
            
            <EditableField id="sobre_hero_desc" defaultValue="Há quase 50 anos, transformamos a argila em revestimentos que unem o artesanal ao contemporâneo, valorizando espaços e histórias.">
              {(text, styles) => (
                <p className="text-brand-text/80 text-lg leading-relaxed mb-12 max-w-md" style={styles}>{text}</p>
              )}
            </EditableField>
            
            <div className="flex flex-wrap items-start gap-6 md:gap-10">
              <div className="flex flex-col gap-3">
                <EditableField id="icon_SobreHero_HeartHandshake_6tud7" defaultValue="" type="image">{(url) => url ? <img src={url} alt="HeartHandshake" className="w-8 h-8 text-brand-rust object-contain" /> : <HeartHandshake className="w-8 h-8 text-brand-rust" strokeWidth={1.5} />}</EditableField>
                <EditableField id="sobre_hero_feat1" defaultValue="Produção<br/>artesanal" type="html">
                  {(html, styles) => (
                    <span className="text-xs font-bold text-brand-text leading-tight uppercase tracking-wider" style={styles} dangerouslySetInnerHTML={{ __html: html }} />
                  )}
                </EditableField>
              </div>
              <div className="w-px h-12 bg-gray-200 hidden md:block"></div>
              <div className="flex flex-col gap-3">
                <EditableField id="icon_SobreHero_ShieldCheck_y64fy" defaultValue="" type="image">{(url) => url ? <img src={url} alt="ShieldCheck" className="w-8 h-8 text-brand-rust object-contain" /> : <ShieldCheck className="w-8 h-8 text-brand-rust" strokeWidth={1.5} />}</EditableField>
                <EditableField id="sobre_hero_feat2" defaultValue="Qualidade<br/>que dura" type="html">
                  {(html, styles) => (
                    <span className="text-xs font-bold text-brand-text leading-tight uppercase tracking-wider" style={styles} dangerouslySetInnerHTML={{ __html: html }} />
                  )}
                </EditableField>
              </div>
              <div className="w-px h-12 bg-gray-200 hidden md:block"></div>
              <div className="flex flex-col gap-3">
                <EditableField id="icon_SobreHero_MapPin_kermp" defaultValue="" type="image">{(url) => url ? <img src={url} alt="MapPin" className="w-8 h-8 text-brand-rust object-contain" /> : <MapPin className="w-8 h-8 text-brand-rust" strokeWidth={1.5} />}</EditableField>
                <EditableField id="sobre_hero_feat3" defaultValue="Feito em<br/>Tambaú - SP" type="html">
                  {(html, styles) => (
                    <span className="text-xs font-bold text-brand-text leading-tight uppercase tracking-wider" style={styles} dangerouslySetInnerHTML={{ __html: html }} />
                  )}
                </EditableField>
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/2 w-full">
            <div className="aspect-[4/3] rounded-lg overflow-hidden shadow-md">
              <EditableField id="sobre_hero_img" defaultValue="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200&auto=format&fit=crop" type="image" className="w-full h-full">
                {(url) => (
                  <img 
                    src={url} 
                    alt="Tijolo Moraes" 
                    className="w-full h-full object-cover"
                  />
                )}
              </EditableField>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
