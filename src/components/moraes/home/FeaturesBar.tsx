import { Award, Factory, Users, Truck } from 'lucide-react';
import { EditableField } from '../../admin/EditableField';

export function FeaturesBar() {
  const features = [
    {
      id: 'feature_1',
      icon: <EditableField id="icon_FeaturesBar_Award_ullw4" defaultValue="" type="image">{(url) => url ? <img src={url} alt="Award" className="w-8 h-8 text-brand-rust object-contain" /> : <Award className="w-8 h-8 text-brand-rust" strokeWidth={1.5} />}</EditableField>,
      titleDefault: 'Quase 50 anos',
      subtitleDefault: 'de tradição',
    },
    {
      id: 'feature_2',
      icon: <EditableField id="icon_FeaturesBar_Factory_y5jor" defaultValue="" type="image">{(url) => url ? <img src={url} alt="Factory" className="w-8 h-8 text-brand-rust object-contain" /> : <Factory className="w-8 h-8 text-brand-rust" strokeWidth={1.5} />}</EditableField>,
      titleDefault: 'Fabricação',
      subtitleDefault: 'própria',
    },
    {
      id: 'feature_3',
      icon: <EditableField id="icon_FeaturesBar_Users_hkzm4" defaultValue="" type="image">{(url) => url ? <img src={url} alt="Users" className="w-8 h-8 text-brand-rust object-contain" /> : <Users className="w-8 h-8 text-brand-rust" strokeWidth={1.5} />}</EditableField>,
      titleDefault: 'Atendimento para',
      subtitleDefault: 'arquitetos, construtoras\ne consumidor final',
    },
    {
      id: 'feature_4',
      icon: <EditableField id="icon_FeaturesBar_Truck_dv212" defaultValue="" type="image">{(url) => url ? <img src={url} alt="Truck" className="w-8 h-8 text-brand-rust object-contain" /> : <Truck className="w-8 h-8 text-brand-rust" strokeWidth={1.5} />}</EditableField>,
      titleDefault: 'Entrega para',
      subtitleDefault: 'diversos projetos',
    },
  ];

  return (
    <section className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200 py-6">
          {features.map((feature) => (
            <div key={feature.id} className="flex items-center gap-4 px-6 py-4 md:py-2">
              <div className="flex-shrink-0">
                {feature.icon}
              </div>
              <div className="text-sm">
                <EditableField id={`home_${feature.id}_title`} defaultValue={feature.titleDefault}>
                  {(title, titleStyles) => (
                    <span className="block font-semibold text-brand-text leading-tight" style={titleStyles}>{title}</span>
                  )}
                </EditableField>
                <EditableField id={`home_${feature.id}_subtitle`} defaultValue={feature.subtitleDefault} type="html">
                  {(subtitle, subtitleStyles) => (
                    <span className="block text-brand-text/70 leading-tight whitespace-pre-line" style={subtitleStyles} dangerouslySetInnerHTML={{ __html: subtitle }} />
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
