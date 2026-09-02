import { HeartHandshake, Truck, MessageCircle } from 'lucide-react';
import { EditableField } from '../../admin/EditableField';

export function ProdutosBenefits() {
  const benefits = [
    {
      id: 'produtos_benefit_1',
      icon: <EditableField id="icon_ProdutosBenefits_HeartHandshake_pnv0n" defaultValue="" type="image">{(url) => url ? <img src={url} alt="HeartHandshake" className="w-10 h-10 text-brand-rust object-contain" /> : <HeartHandshake className="w-10 h-10 text-brand-rust" strokeWidth={1} />}</EditableField>,
      titleDef: 'Atendimento consultivo',
      descDef: 'Nossa equipe técnica orienta na escolha do revestimento ideal para cada projeto.',
    },
    {
      id: 'produtos_benefit_2',
      icon: <EditableField id="icon_ProdutosBenefits_Truck_n7gvf" defaultValue="" type="image">{(url) => url ? <img src={url} alt="Truck" className="w-10 h-10 text-brand-rust object-contain" /> : <Truck className="w-10 h-10 text-brand-rust" strokeWidth={1} />}</EditableField>,
      titleDef: 'Envio para diferentes projetos',
      descDef: 'Atendemos obras de todos os portes, com agilidade e segurança na entrega.',
    },
    {
      id: 'produtos_benefit_3',
      icon: <EditableField id="icon_ProdutosBenefits_MessageCircle_jlfno" defaultValue="" type="image">{(url) => url ? <img src={url} alt="MessageCircle" className="w-10 h-10 text-brand-rust object-contain" /> : <MessageCircle className="w-10 h-10 text-brand-rust" strokeWidth={1} />}</EditableField>,
      titleDef: 'Compra prática pelo WhatsApp',
      descDef: 'Solicite informações, orçamentos e amostras de forma rápida e personalizada.',
    },
  ];

  return (
    <section className="bg-white py-12 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          {benefits.map((benefit) => (
            <div key={benefit.id} className="flex items-start gap-5 pt-8 md:pt-0 md:px-6 first:pt-0 first:px-0 lg:px-10">
              <div className="flex-shrink-0">
                {benefit.icon}
              </div>
              <div>
                <EditableField id={`${benefit.id}_title`} defaultValue={benefit.titleDef}>
                  {(text, styles) => (
                    <h4 className="font-bold text-sm text-brand-text mb-1.5 leading-tight" style={styles}>{text}</h4>
                  )}
                </EditableField>
                <EditableField id={`${benefit.id}_desc`} defaultValue={benefit.descDef}>
                  {(text, styles) => (
                    <p className="text-xs text-brand-text/70 leading-relaxed" style={styles}>{text}</p>
                  )}
                </EditableField>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
