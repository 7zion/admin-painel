import { EditableField } from '../../admin/EditableField';
import { useEffect, useState } from 'react';

export function ProdutosHero() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % 3);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-brand-bg pt-12 md:pt-16 pb-12 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-8 items-stretch">
          
          {/* Content Left */}
          <div className="lg:w-1/2 flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-8 bg-brand-rust"></div>
              <EditableField id="produtos_hero_tag" defaultValue="Catálogo">
                {(text, styles) => (
                  <span className="text-[10px] uppercase tracking-widest font-bold text-brand-text" style={styles}>{text}</span>
                )}
              </EditableField>
            </div>
            
            <EditableField id="produtos_hero_title" defaultValue="Revestimentos para<br />projetos que pedem<br /><em class='font-serif italic text-brand-rust'>personalidade.</em>" type="html">
              {(html, styles) => (
                <h1 
                  className="font-serif text-4xl md:text-5xl lg:text-[54px] font-bold text-brand-text leading-[1.1] mb-6"
                  style={styles}
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              )}
            </EditableField>
            
            <EditableField id="produtos_hero_desc" defaultValue="Explore nossa curadoria de peças cerâmicas para fachadas, paredes internas, áreas gourmet e pisos. Produtos com estética artesanal e aplicação contemporânea.">
              {(text, styles) => (
                <p className="text-brand-text/80 text-sm md:text-base leading-relaxed max-w-lg" style={styles}>
                  {text}
                </p>
              )}
            </EditableField>
          </div>
          
          {/* Image Grid Right */}
          <div className="lg:w-1/2 w-full">
            <div className="grid grid-cols-2 gap-4 h-[500px]">
              <div className="rounded overflow-hidden shadow-sm h-full">
                <EditableField id="produtos_hero_img1" defaultValue="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=800&auto=format&fit=crop" type="image" className="w-full h-full">
                  {(url) => (
                    <img 
                      src={url} 
                      alt="Parede tijolo fachada noite" 
                      className="w-full h-full object-cover"
                    />
                  )}
                </EditableField>
              </div>
              <div className="rounded overflow-hidden shadow-sm h-full relative">
                <div 
                  className="flex flex-col h-full w-full transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateY(-${activeIndex * 100}%)` }}
                >
                  <div className="h-full w-full flex-shrink-0">
                    <EditableField id="produtos_hero_img2" defaultValue="https://images.unsplash.com/photo-1622372736597-9eb9cce329ce?q=80&w=800&auto=format&fit=crop" type="image" className="w-full h-full">
                      {(url) => (
                        <img 
                          src={url} 
                          alt="Poltrona couro parede cinza" 
                          className="w-full h-full object-cover"
                        />
                      )}
                    </EditableField>
                  </div>
                  <div className="h-full w-full flex-shrink-0">
                    <EditableField id="produtos_hero_img3" defaultValue="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop" type="image" className="w-full h-full">
                      {(url) => (
                        <img 
                          src={url} 
                          alt="Parede pedra" 
                          className="w-full h-full object-cover"
                        />
                      )}
                    </EditableField>
                  </div>
                  <div className="h-full w-full flex-shrink-0">
                    <EditableField id="produtos_hero_img4" defaultValue="https://images.unsplash.com/photo-1600607688969-a5bfcd64bd03?q=80&w=800&auto=format&fit=crop" type="image" className="w-full h-full">
                      {(url) => (
                        <img 
                          src={url} 
                          alt="Piso rústico" 
                          className="w-full h-full object-cover"
                        />
                      )}
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
