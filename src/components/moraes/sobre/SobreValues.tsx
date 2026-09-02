import { Leaf, Award, Heart, Home } from 'lucide-react';
import { EditableField } from '../../admin/EditableField';

export function SobreValues() {
  const values = [
    {
      id: 'sobre_val_1',
      icon: <EditableField id="icon_SobreValues_Leaf_yttvs" defaultValue="" type="image">{(url) => url ? <img src={url} alt="Leaf" className="w-6 h-6 text-brand-rust object-contain" /> : <Leaf className="w-6 h-6 text-brand-rust" strokeWidth={1.5} />}</EditableField>,
      titleDef: 'Autenticidade',
      descDef: 'Respeitamos a argila, o tempo e o processo. Cada peça carrega nossa identidade.',
    },
    {
      id: 'sobre_val_2',
      icon: <EditableField id="icon_SobreValues_Award_0obea" defaultValue="" type="image">{(url) => url ? <img src={url} alt="Award" className="w-6 h-6 text-brand-rust object-contain" /> : <Award className="w-6 h-6 text-brand-rust" strokeWidth={1.5} />}</EditableField>,
      titleDef: 'Qualidade',
      descDef: 'Não abrimos mão do padrão técnico e estético em tudo o que fazemos.',
    },
    {
      id: 'sobre_val_3',
      icon: <EditableField id="icon_SobreValues_Heart_vm9df" defaultValue="" type="image">{(url) => url ? <img src={url} alt="Heart" className="w-6 h-6 text-brand-rust object-contain" /> : <Heart className="w-6 h-6 text-brand-rust" strokeWidth={1.5} />}</EditableField>,
      titleDef: 'Confiança',
      descDef: 'Relacionamentos duradouros com clientes, arquitetos, construtoras e parceiros.',
    },
    {
      id: 'sobre_val_4',
      icon: <EditableField id="icon_SobreValues_Home_udvpe" defaultValue="" type="image">{(url) => url ? <img src={url} alt="Home" className="w-6 h-6 text-brand-rust object-contain" /> : <Home className="w-6 h-6 text-brand-rust" strokeWidth={1.5} />}</EditableField>,
      titleDef: 'Inovação com propósito',
      descDef: 'Evoluímos sem perder nossa essência. Tradicional, mas sempre atentos ao novo.',
    },
  ];

  return (
    <section className="bg-brand-bg py-20 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-8 bg-brand-rust"></div>
            <EditableField id="sobre_values_tag" defaultValue="Nossa essência em cada escolha">
              {(text, styles) => (
                <span className="text-[10px] uppercase tracking-widest font-bold text-brand-text" style={styles}>{text}</span>
              )}
            </EditableField>
            <div className="h-px w-8 bg-brand-rust"></div>
          </div>
          
          <EditableField id="sobre_values_title" defaultValue="Valores que nos guiam há quase <em class='font-serif italic text-brand-rust'>50 anos</em>" type="html">
            {(html, styles) => (
              <h2 
                className="font-serif text-3xl md:text-4xl font-bold text-brand-text leading-[1.2]"
                style={styles}
                dangerouslySetInnerHTML={{ __html: html }}
              />
            )}
          </EditableField>
        </div>

        <div className="relative">
          {/* Horizontal Line for desktop */}
          <div className="hidden md:block absolute top-6 left-[12.5%] right-[12.5%] h-px bg-brand-rust/30"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6 relative z-10">
            {values.map((val) => (
              <div key={val.id} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-brand-bg border border-brand-rust flex items-center justify-center mb-6 shadow-sm">
                  {val.icon}
                </div>
                <EditableField id={`${val.id}_title`} defaultValue={val.titleDef}>
                  {(text, styles) => (
                    <h3 className="font-bold text-sm text-brand-text mb-3 uppercase tracking-wider" style={styles}>{text}</h3>
                  )}
                </EditableField>
                <EditableField id={`${val.id}_desc`} defaultValue={val.descDef} type="html">
                  {(html, styles) => (
                    <p className="text-xs text-brand-text/70 leading-relaxed max-w-[220px]" style={styles} dangerouslySetInnerHTML={{ __html: html }} />
                  )}
                </EditableField>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
