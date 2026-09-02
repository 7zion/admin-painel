import { Users, MessageSquareQuote } from 'lucide-react';
import { EditableField } from '../../admin/EditableField';

export function ContatoHero() {
  return (
    <section className="bg-brand-bg pt-12 md:pt-16 pb-12 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-8 items-center">
          
          {/* Content Left */}
          <div className="lg:w-1/2 flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-8 bg-brand-rust"></div>
              <EditableField id="contato_hero_tag" defaultValue="Contato">
                {(text, styles) => (
                  <span className="text-[10px] uppercase tracking-widest font-bold text-brand-text" style={styles}>{text}</span>
                )}
              </EditableField>
            </div>
            
            <EditableField id="contato_hero_title" defaultValue="Fale com a <em class='font-serif italic text-brand-rust'>Moraes</em>" type="html">
              {(html, styles) => (
                <h1 
                  className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-brand-text leading-[1.1] mb-6"
                  style={styles}
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              )}
            </EditableField>
            
            <EditableField id="contato_hero_desc" defaultValue="Estamos prontos para entender seu projeto e indicar os revestimentos ideais. Fale com nossa equipe sobre produtos, quantidades, acabamentos e orientações técnicas para arquitetos, construtores e clientes.">
              {(text, styles) => (
                <p className="text-brand-text/80 text-sm md:text-base leading-relaxed max-w-md mb-10" style={styles}>
                  {text}
                </p>
              )}
            </EditableField>

            <div className="flex flex-col sm:flex-row gap-8">
              <div className="flex items-start gap-4">
                <EditableField id="icon_ContatoHero_Users_8dja9" defaultValue="" type="image">{(url) => url ? <img src={url} alt="Users" className="w-8 h-8 text-brand-rust flex-shrink-0 object-contain" /> : <Users className="w-8 h-8 text-brand-rust flex-shrink-0" strokeWidth={1} />}</EditableField>
                <EditableField id="contato_hero_feat1" defaultValue="Atendemos arquitetos,<br />construtoras e<br />consumidor final" type="html">
                  {(html, styles) => (
                    <p className="text-xs font-bold text-brand-text leading-tight mt-1" style={styles} dangerouslySetInnerHTML={{ __html: html }} />
                  )}
                </EditableField>
              </div>
              <div className="flex items-start gap-4">
                <EditableField id="icon_ContatoHero_MessageSquareQuote_oapc3" defaultValue="" type="image">{(url) => url ? <img src={url} alt="MessageSquareQuote" className="w-8 h-8 text-brand-rust flex-shrink-0 object-contain" /> : <MessageSquareQuote className="w-8 h-8 text-brand-rust flex-shrink-0" strokeWidth={1} />}</EditableField>
                <EditableField id="contato_hero_feat2" defaultValue="Resposta rápida e<br />orientação personalizada<br />para cada projeto" type="html">
                  {(html, styles) => (
                    <p className="text-xs font-bold text-brand-text leading-tight mt-1" style={styles} dangerouslySetInnerHTML={{ __html: html }} />
                  )}
                </EditableField>
              </div>
            </div>
          </div>
          
          {/* Image Grid Right */}
          <div className="lg:w-1/2 w-full">
            <div className="aspect-[4/3] lg:aspect-auto lg:h-[500px] rounded overflow-hidden shadow-sm bg-gray-200">
              <EditableField id="contato_hero_img" defaultValue="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1000&auto=format&fit=crop" type="image" className="w-full h-full">
                {(url) => (
                  <img 
                    src={url} 
                    alt="Contato equipe Moraes" 
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
