import { CheckCircle2 } from 'lucide-react';
import { EditableField } from '../../admin/EditableField';

export function ProdutoWhyChoose() {
  const points = [
    { id: 'prod_why_p1', def: 'Realça a beleza natural dos materiais' },
    { id: 'prod_why_p2', def: 'Harmonia perfeita com madeira, metal e pedra' },
    { id: 'prod_why_p3', def: 'Acabamento artesanal que valoriza cada detalhe' },
    { id: 'prod_why_p4', def: 'Ideal para projetos que buscam autenticidade e exclusividade' }
  ];

  return (
    <section className="py-16 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-10 items-stretch">
          
          <div className="lg:w-1/4 hidden lg:block">
            <div className="h-full min-h-[300px] rounded overflow-hidden bg-gray-200">
              <EditableField id="prod_why_img1" defaultValue="https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?q=80&w=600&auto=format&fit=crop" type="image" className="w-full h-full">
                {(url) => (
                  <img src={url} alt="Detalhe tijolo" className="w-full h-full object-cover" />
                )}
              </EditableField>
            </div>
          </div>
          
          <div className="lg:w-2/4 px-0 lg:px-8 flex flex-col justify-center">
            <EditableField id="prod_why_title" defaultValue="Por que escolher este revestimento?">
              {(text, styles) => (
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-brand-text mb-6" style={styles}>
                  {text}
                </h2>
              )}
            </EditableField>
            
            <EditableField id="prod_why_desc" defaultValue="Combinando a força do design rústico com a sofisticação das formas contemporâneas. Tonalidades marcantes que criam ambientes cheios de personalidade e elegância.">
              {(text, styles) => (
                <p className="text-sm text-brand-text/80 leading-relaxed mb-8" style={styles}>
                  {text}
                </p>
              )}
            </EditableField>
            
            <ul className="space-y-4">
              {points.map((p) => (
                <li key={p.id} className="flex items-start gap-3">
                  <EditableField id="icon_ProdutoWhyChoose_CheckCircle2_wm6oe" defaultValue="" type="image">{(url) => url ? <img src={url} alt="CheckCircle2" className="w-5 h-5 text-brand-rust flex-shrink-0 object-contain" /> : <CheckCircle2 className="w-5 h-5 text-brand-rust flex-shrink-0" strokeWidth={2} />}</EditableField>
                  <EditableField id={p.id} defaultValue={p.def}>
                    {(text, styles) => (
                      <span className="text-xs text-brand-text font-medium leading-relaxed mt-0.5" style={styles}>{text}</span>
                    )}
                  </EditableField>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="lg:w-1/4">
            <div className="h-full min-h-[300px] rounded overflow-hidden bg-gray-200">
              <EditableField id="prod_why_img2" defaultValue="https://images.unsplash.com/photo-1622372736597-9eb9cce329ce?q=80&w=600&auto=format&fit=crop" type="image" className="w-full h-full">
                {(url) => (
                  <img src={url} alt="Ambiente gourmet" className="w-full h-full object-cover" />
                )}
              </EditableField>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
