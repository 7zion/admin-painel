import { EditableField } from '../../admin/EditableField';

export function ProdutoSpaces() {
  const spaces = [
    {
      id: 'prod_space_1',
      imgDef: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=600&auto=format&fit=crop',
      titleDef: 'Fachadas',
      descDef: 'Valoriza a arquitetura com charme rústico e imponência.'
    },
    {
      id: 'prod_space_2',
      imgDef: 'https://images.unsplash.com/photo-1622372736597-9eb9cce329ce?q=80&w=600&auto=format&fit=crop',
      titleDef: 'Áreas Gourmet',
      descDef: 'Cria ambientes acolhedores e perfeitos para receber.'
    },
    {
      id: 'prod_space_3',
      imgDef: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop',
      titleDef: 'Salas e Home Theaters',
      descDef: 'Destaque de parede que traz conforto e personalidade.'
    },
    {
      id: 'prod_space_4',
      imgDef: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600&auto=format&fit=crop',
      titleDef: 'Corredores e Entradas',
      descDef: 'Boas-vindas com estilo e acabamento de alto padrão.'
    }
  ];

  return (
    <section className="py-16 bg-[#F4F1EC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <EditableField id="prod_spaces_title" defaultValue="Ambientes que valorizam o revestimento" type="html">
          {(html, styles) => (
            <h2 
              className="font-serif text-2xl md:text-3xl font-bold text-brand-text mb-8 relative inline-block"
              style={styles}
            >
              <span dangerouslySetInnerHTML={{ __html: html }} />
              <div className="absolute -bottom-2 left-0 w-16 h-0.5 bg-brand-rust"></div>
            </h2>
          )}
        </EditableField>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
          {spaces.map((s) => (
            <div key={s.id} className="flex flex-col bg-[#F9F8F6] pb-4 rounded overflow-hidden border border-gray-100 shadow-sm">
              <div className="aspect-[4/3] overflow-hidden mb-4 bg-gray-200">
                <EditableField id={`${s.id}_img`} defaultValue={s.imgDef} type="image" className="w-full h-full">
                  {(url) => (
                    <img src={url} alt={s.titleDef} className="w-full h-full object-cover" />
                  )}
                </EditableField>
              </div>
              <EditableField id={`${s.id}_title`} defaultValue={s.titleDef}>
                {(text, styles) => (
                  <h4 className="text-sm font-bold text-brand-text text-center mb-2 px-4" style={styles}>{text}</h4>
                )}
              </EditableField>
              <EditableField id={`${s.id}_desc`} defaultValue={s.descDef}>
                {(text, styles) => (
                  <p className="text-[11px] text-brand-text/70 text-center leading-relaxed px-4" style={styles}>{text}</p>
                )}
              </EditableField>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
