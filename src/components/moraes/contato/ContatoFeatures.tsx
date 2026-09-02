import { Users, LayoutTemplate, Factory, Truck } from 'lucide-react';
import { EditableField } from '../../admin/EditableField';

export function ContatoFeatures() {
  const features = [
    {
      id: 'contato_feat_1',
      icon: <EditableField id="icon_ContatoFeatures_Users_0hvi0" defaultValue="" type="image">{(url) => url ? <img src={url} alt="Users" className="w-10 h-10 text-brand-rust flex-shrink-0 object-contain" /> : <Users className="w-10 h-10 text-brand-rust flex-shrink-0" strokeWidth={1} />}</EditableField>,
      titleDef: 'Atendimento para<br />arquitetos e construtoras',
      descDef: 'Suporte especializado do início ao acabamento.'
    },
    {
      id: 'contato_feat_2',
      icon: <EditableField id="icon_ContatoFeatures_LayoutTemplate_eyt1p" defaultValue="" type="image">{(url) => url ? <img src={url} alt="LayoutTemplate" className="w-10 h-10 text-brand-rust flex-shrink-0 object-contain" /> : <LayoutTemplate className="w-10 h-10 text-brand-rust flex-shrink-0" strokeWidth={1} />}</EditableField>,
      titleDef: 'Orientação sobre<br />revestimentos e aplicações',
      descDef: 'Indicação técnica para cada ambiente e estilo de projeto.'
    },
    {
      id: 'contato_feat_3',
      icon: <EditableField id="icon_ContatoFeatures_Factory_pea5s" defaultValue="" type="image">{(url) => url ? <img src={url} alt="Factory" className="w-10 h-10 text-brand-rust flex-shrink-0 object-contain" /> : <Factory className="w-10 h-10 text-brand-rust flex-shrink-0" strokeWidth={1} />}</EditableField>,
      titleDef: 'Fabricação<br />própria',
      descDef: 'Controle de qualidade em todas as etapas.'
    },
    {
      id: 'contato_feat_4',
      icon: <EditableField id="icon_ContatoFeatures_Truck_4gvdw" defaultValue="" type="image">{(url) => url ? <img src={url} alt="Truck" className="w-10 h-10 text-brand-rust flex-shrink-0 object-contain" /> : <Truck className="w-10 h-10 text-brand-rust flex-shrink-0" strokeWidth={1} />}</EditableField>,
      titleDef: 'Entrega para<br />diferentes projetos',
      descDef: 'Agilidade e segurança na entrega.'
    }
  ];

  return (
    <section className="bg-white py-12 border-b border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4 divide-y sm:divide-y-0 lg:divide-x divide-gray-200">
          
          {features.map((feat) => (
            <div key={feat.id} className="flex items-start gap-4 pt-6 sm:pt-0 lg:px-6 first:pt-0 first:px-0">
              {feat.icon}
              <div>
                <EditableField id={`${feat.id}_title`} defaultValue={feat.titleDef} type="html">
                  {(html, styles) => (
                    <h4 className="text-xs font-bold text-brand-text mb-1.5 leading-tight uppercase tracking-wider" style={styles} dangerouslySetInnerHTML={{ __html: html }} />
                  )}
                </EditableField>
                <EditableField id={`${feat.id}_desc`} defaultValue={feat.descDef}>
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
