import { useState, useEffect } from 'react';
import { EditableField } from '../../admin/EditableField';

export function ProjetosHero() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % 3);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-[#F9F8F6] pt-16 pb-12 lg:pt-24 lg:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
          
          <div className="lg:w-1/2">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-px bg-brand-rust"></div>
              <EditableField id="projetos_hero_tag" defaultValue="Projetos">
                {(text, styles) => (
                  <span className="text-xs font-bold text-brand-rust uppercase tracking-widest" style={styles}>{text}</span>
                )}
              </EditableField>
            </div>
            
            <EditableField id="projetos_hero_title" defaultValue="Projetos que <br/>ganham identidade <br/><em class='italic font-light text-brand-rust'>com a Moraes</em>" type="html">
              {(html, styles) => (
                <h1 
                  className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-brand-text mb-6 leading-tight"
                  style={styles}
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              )}
            </EditableField>
            
            <EditableField id="projetos_hero_desc" defaultValue="Conheça projetos reais que utilizam os revestimentos cerâmicos da Moraes e inspire-se com soluções que unem beleza, personalidade e atemporalidade em cada detalhe arquitetônico.">
              {(text, styles) => (
                <p className="text-brand-text/80 text-lg leading-relaxed mb-10 max-w-md" style={styles}>
                  {text}
                </p>
              )}
            </EditableField>
          </div>

          <div className="lg:w-1/2 w-full">
            <div className="grid grid-cols-2 gap-4 h-[400px] md:h-[500px]">
              <div className="rounded overflow-hidden">
                <EditableField id="projetos_hero_img1" defaultValue="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop" type="image" className="w-full h-full">
                  {(url) => <img src={url} alt="Projeto fachada" className="w-full h-full object-cover" />}
                </EditableField>
              </div>
              <div className="rounded overflow-hidden relative shadow-sm h-full">
                <div 
                  className="flex flex-col h-full w-full transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateY(-${activeIndex * 100}%)` }}
                >
                  <div className="h-full w-full flex-shrink-0">
                    <EditableField id="projetos_hero_img2" defaultValue="https://images.unsplash.com/photo-1600607688969-a5bfcd64bd03?q=80&w=800&auto=format&fit=crop" type="image" className="w-full h-full">
                      {(url) => <img src={url} alt="Projeto interior" className="w-full h-full object-cover" />}
                    </EditableField>
                  </div>
                  <div className="h-full w-full flex-shrink-0">
                    <EditableField id="projetos_hero_img3" defaultValue="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=400&auto=format&fit=crop" type="image" className="w-full h-full">
                      {(url) => <img src={url} alt="Projeto muro" className="w-full h-full object-cover" />}
                    </EditableField>
                  </div>
                  <div className="h-full w-full flex-shrink-0">
                    <EditableField id="projetos_hero_img4" defaultValue="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=400&auto=format&fit=crop" type="image" className="w-full h-full">
                      {(url) => <img src={url} alt="Projeto detalhe" className="w-full h-full object-cover" />}
                    </EditableField>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
