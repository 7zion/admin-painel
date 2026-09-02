import { Home, Image as ImageIcon, Flame, Armchair, DoorClosed, LayoutGrid, Users } from 'lucide-react';
import { EditableField } from '../../admin/EditableField';

export function UseCasesSection() {
  const cases = [
    {
      id: 'usecase_1',
      icon: <EditableField id="icon_UseCasesSection_Home_vgs2n" defaultValue="" type="image">{(url) => url ? <img src={url} alt="Home" className="w-8 h-8 text-brand-rust mb-4 mx-auto object-contain" /> : <Home className="w-8 h-8 text-brand-rust mb-4 mx-auto" strokeWidth={1} />}</EditableField>,
      titleDefault: 'Fachadas residenciais e comerciais',
    },
    {
      id: 'usecase_2',
      icon: <ImageIcon className="w-8 h-8 text-brand-rust mb-4 mx-auto" strokeWidth={1} />,
      titleDefault: 'Paredes internas decorativas',
    },
    {
      id: 'usecase_3',
      icon: <EditableField id="icon_UseCasesSection_Flame_thpt2" defaultValue="" type="image">{(url) => url ? <img src={url} alt="Flame" className="w-8 h-8 text-brand-rust mb-4 mx-auto object-contain" /> : <Flame className="w-8 h-8 text-brand-rust mb-4 mx-auto" strokeWidth={1} />}</EditableField>,
      titleDefault: 'Áreas gourmet',
    },
    {
      id: 'usecase_4',
      icon: <EditableField id="icon_UseCasesSection_Armchair_u725r" defaultValue="" type="image">{(url) => url ? <img src={url} alt="Armchair" className="w-8 h-8 text-brand-rust mb-4 mx-auto object-contain" /> : <Armchair className="w-8 h-8 text-brand-rust mb-4 mx-auto" strokeWidth={1} />}</EditableField>,
      titleDefault: 'Salas, cozinhas e corredores',
    },
    {
      id: 'usecase_5',
      icon: <EditableField id="icon_UseCasesSection_DoorClosed_xvch5" defaultValue="" type="image">{(url) => url ? <img src={url} alt="DoorClosed" className="w-8 h-8 text-brand-rust mb-4 mx-auto object-contain" /> : <DoorClosed className="w-8 h-8 text-brand-rust mb-4 mx-auto" strokeWidth={1} />}</EditableField>,
      titleDefault: 'Muros e entradas',
    },
    {
      id: 'usecase_6',
      icon: <EditableField id="icon_UseCasesSection_LayoutGrid_w7ejo" defaultValue="" type="image">{(url) => url ? <img src={url} alt="LayoutGrid" className="w-8 h-8 text-brand-rust mb-4 mx-auto object-contain" /> : <LayoutGrid className="w-8 h-8 text-brand-rust mb-4 mx-auto" strokeWidth={1} />}</EditableField>,
      titleDefault: 'Pisos internos e externos',
    },
    {
      id: 'usecase_7',
      icon: <EditableField id="icon_UseCasesSection_Users_om8is" defaultValue="" type="image">{(url) => url ? <img src={url} alt="Users" className="w-8 h-8 text-brand-rust mb-4 mx-auto object-contain" /> : <Users className="w-8 h-8 text-brand-rust mb-4 mx-auto" strokeWidth={1} />}</EditableField>,
      titleDefault: 'Projetos de arquitetos, construtoras e consumidores finais',
    },
  ];

  return (
    <section className="py-20 bg-white border-t border-gray-100 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        <EditableField id="home_usecases_title" defaultValue="Onde nossos produtos se destacam">
          {(text, styles) => (
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-text mb-4" style={styles}>
              {text}
            </h2>
          )}
        </EditableField>

        <div className="w-24 h-0.5 bg-brand-rust mx-auto opacity-40 mb-16"></div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
          {cases.map((item) => (
            <div key={item.id} className="flex flex-col items-center">
              {item.icon}
              <EditableField id={`home_${item.id}_title`} defaultValue={item.titleDefault}>
                {(text, styles) => (
                  <p className="text-[11px] font-semibold text-brand-text leading-tight uppercase tracking-wide px-2 max-w-[140px] mx-auto" style={styles}>
                    {text}
                  </p>
                )}
              </EditableField>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
