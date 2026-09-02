import { EditableField } from '../../admin/EditableField';

export function SobreHistory() {
  return (
    <section className="bg-brand-bg py-20 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col-reverse lg:flex-row gap-12 lg:gap-20 items-center">
          
          <div className="lg:w-1/2 w-full">
            <div className="aspect-[4/4] lg:aspect-[4/5] rounded-lg overflow-hidden shadow-md">
              <EditableField id="sobre_history_img" defaultValue="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1000&auto=format&fit=crop" type="image" className="w-full h-full">
                {(url) => (
                  <img 
                    src={url} 
                    alt="Parede de tijolos" 
                    className="w-full h-full object-cover"
                  />
                )}
              </EditableField>
            </div>
          </div>
          
          <div className="lg:w-1/2">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-8 bg-brand-rust"></div>
              <EditableField id="sobre_history_tag" defaultValue="Nossa História">
                {(text, styles) => (
                  <span className="text-[10px] uppercase tracking-widest font-bold text-brand-text" style={styles}>{text}</span>
                )}
              </EditableField>
            </div>
            
            <EditableField id="sobre_history_title" defaultValue="Do ofício à <em class='font-serif italic text-brand-rust'>excelência</em>,<br />geração após geração." type="html">
              {(html, styles) => (
                <h2 
                  className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-brand-text leading-[1.2] mb-10"
                  style={styles}
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              )}
            </EditableField>
            
            <div className="space-y-6 text-brand-text/80 text-sm md:text-base leading-relaxed">
              <EditableField id="sobre_history_p1" defaultValue="Desde o início, nossa missão sempre foi clara: produzir revestimentos cerâmicos com alma artesanal, beleza natural e desempenho técnico superior." type="text">
                {(text, styles) => <p style={styles}>{text}</p>}
              </EditableField>
              
              <EditableField id="sobre_history_p2" defaultValue="Ao longo de quase cinco décadas, combinamos conhecimento tradicional, tecnologia e rigor no processo produtivo para entregar produtos que resistem ao tempo — e às tendências." type="text">
                {(text, styles) => <p style={styles}>{text}</p>}
              </EditableField>
              
              <EditableField id="sobre_history_p3" defaultValue="Estamos em Tambaú, interior de São Paulo, com estrutura própria e equipe dedicada em cada etapa, do preparo da matéria-prima ao acabamento final." type="text">
                {(text, styles) => <p style={styles}>{text}</p>}
              </EditableField>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
