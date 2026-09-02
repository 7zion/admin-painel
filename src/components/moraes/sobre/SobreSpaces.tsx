import { EditableField } from '../../admin/EditableField';

export function SobreSpaces() {
  const spaces = [
    {
      id: 'sobre_space_1',
      imageDef: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=600&auto=format&fit=crop',
      titleDef: 'Fachadas residenciais e comerciais',
    },
    {
      id: 'sobre_space_2',
      imageDef: 'https://images.unsplash.com/photo-1600607688969-a5bfcd64bd03?q=80&w=600&auto=format&fit=crop',
      titleDef: 'Paredes internas decorativas',
    },
    {
      id: 'sobre_space_3',
      imageDef: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600&auto=format&fit=crop',
      titleDef: 'Áreas gourmet',
    },
    {
      id: 'sobre_space_4',
      imageDef: 'https://images.unsplash.com/photo-1622372736597-9eb9cce329ce?q=80&w=600&auto=format&fit=crop',
      titleDef: 'Salas, cozinhas e corredores',
    },
    {
      id: 'sobre_space_5',
      imageDef: 'https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?q=80&w=600&auto=format&fit=crop',
      titleDef: 'Muros e entradas',
    },
    {
      id: 'sobre_space_6',
      imageDef: 'https://images.unsplash.com/photo-1502005097973-6a7082348e28?q=80&w=600&auto=format&fit=crop',
      titleDef: 'Pisos internos e externos',
    },
  ];

  return (
    <section className="bg-[#EFECE8] py-20 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-8 bg-brand-rust"></div>
            <EditableField id="sobre_spaces_tag" defaultValue="Feitos para transformar espaços">
              {(text, styles) => (
                <span className="text-[10px] uppercase tracking-widest font-bold text-brand-text" style={styles}>{text}</span>
              )}
            </EditableField>
            <div className="h-px w-8 bg-brand-rust"></div>
          </div>
          
          <EditableField id="sobre_spaces_title" defaultValue="Onde nossos revestimentos <em class='font-serif italic text-brand-rust'>ganham vida</em>" type="html">
            {(html, styles) => (
              <h2 
                className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-brand-text leading-[1.2]"
                style={styles}
                dangerouslySetInnerHTML={{ __html: html }}
              />
            )}
          </EditableField>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {spaces.map((space) => (
            <div key={space.id} className="flex flex-col items-center">
              <div className="w-full aspect-[3/4] rounded overflow-hidden shadow-sm mb-4">
                <EditableField id={`${space.id}_img`} defaultValue={space.imageDef} type="image" className="w-full h-full">
                  {(url) => (
                    <img 
                      src={url} 
                      alt={space.titleDef} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  )}
                </EditableField>
              </div>
              <EditableField id={`${space.id}_title`} defaultValue={space.titleDef}>
                {(text, styles) => (
                  <p className="text-xs font-semibold text-brand-text text-center px-2" style={styles}>
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
