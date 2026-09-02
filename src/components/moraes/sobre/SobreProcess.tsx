import { CheckCircle2 } from 'lucide-react';
import { EditableField } from '../../admin/EditableField';

export function SobreProcess() {
  const checks = [
    { id: 'sobre_process_check1', def: 'Matéria-prima selecionada e sustentável' },
    { id: 'sobre_process_check2', def: 'Produção com controle de qualidade em cada etapa' },
    { id: 'sobre_process_check3', def: 'Técnicas artesanais que preservam textura e autenticidade' },
    { id: 'sobre_process_check4', def: 'Peças que unem estética, resistência e fácil aplicação' },
  ];

  return (
    <section className="bg-brand-bg py-20 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
          
          <div className="lg:w-1/2">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-8 bg-brand-rust"></div>
              <EditableField id="sobre_process_tag" defaultValue="Materiais nobres, processo cuidadoso">
                {(text, styles) => (
                  <span className="text-[10px] uppercase tracking-widest font-bold text-brand-text" style={styles}>{text}</span>
                )}
              </EditableField>
              <div className="h-px w-8 bg-brand-rust lg:hidden"></div>
            </div>
            
            <EditableField id="sobre_process_title" defaultValue="A beleza começa<br />na <em class='font-serif italic text-brand-rust'>essência.</em>" type="html">
              {(html, styles) => (
                <h2 
                  className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-brand-text leading-[1.2] mb-10"
                  style={styles}
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              )}
            </EditableField>
            
            <div className="space-y-5">
              {checks.map((check) => (
                <div key={check.id} className="flex items-start gap-4">
                  <EditableField id="icon_SobreProcess_CheckCircle2_9qyim" defaultValue="" type="image">{(url) => url ? <img src={url} alt="CheckCircle2" className="w-6 h-6 text-brand-rust flex-shrink-0 object-contain" /> : <CheckCircle2 className="w-6 h-6 text-brand-rust flex-shrink-0" strokeWidth={1.5} />}</EditableField>
                  <EditableField id={check.id} defaultValue={check.def}>
                    {(text, styles) => (
                      <p className="text-sm md:text-base text-brand-text/80 font-medium pt-0.5" style={styles}>
                        {text}
                      </p>
                    )}
                  </EditableField>
                </div>
              ))}
            </div>
          </div>
          
          <div className="lg:w-1/2 w-full">
            <div className="aspect-[4/3] rounded-lg overflow-hidden shadow-md">
              <EditableField id="sobre_process_img" defaultValue="https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=1000&auto=format&fit=crop" type="image" className="w-full h-full">
                {(url) => (
                  <img 
                    src={url} 
                    alt="Mãos trabalhando com argila" 
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
