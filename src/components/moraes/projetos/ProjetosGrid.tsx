import { EditableField } from '../../admin/EditableField';

const defaultBoxSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`;
const defaultBuildingSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>`;

const projects = [
  {
    id: 'proj_1',
    title: 'Casa Brisa',
    category: 'Fachada residencial',
    product: 'Brick Brisa',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop',
    iconSvg: defaultBoxSvg
  },
  {
    id: 'proj_2',
    title: 'Espaço Gourmet Tambaú',
    category: 'Área gourmet',
    product: 'Brick Rusticatto Fumê',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=600&auto=format&fit=crop',
    iconSvg: defaultBoxSvg
  },
  {
    id: 'proj_3',
    title: 'Residência Jardim',
    category: 'Sala integrada',
    product: 'Brick Branco Rosé',
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=600&auto=format&fit=crop',
    iconSvg: defaultBoxSvg
  },
  {
    id: 'proj_4',
    title: 'Fachada Urban',
    category: 'Muro e entrada',
    product: 'Rockface Urban',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600&auto=format&fit=crop',
    iconSvg: defaultBuildingSvg
  },
  {
    id: 'proj_5',
    title: 'Casa Terracota',
    category: 'Área gourmet',
    product: 'Piso Lastra Mescla',
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=600&auto=format&fit=crop',
    iconSvg: defaultBoxSvg
  },
  {
    id: 'proj_6',
    title: 'Residência Nonna',
    category: 'Fachada residencial',
    product: 'Brick Natura',
    image: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?q=80&w=600&auto=format&fit=crop',
    iconSvg: defaultBoxSvg
  },
  {
    id: 'proj_7',
    title: 'Casa Natura',
    category: 'Sala de estar',
    product: 'Rockface Urban',
    image: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=600&auto=format&fit=crop',
    iconSvg: defaultBuildingSvg
  },
  {
    id: 'proj_8',
    title: 'Projeto Pedra Urbana',
    category: 'Fachada e muro',
    product: 'Brick Rusticatto Fumê',
    image: 'https://images.unsplash.com/photo-1600585153490-76fb20a32601?q=80&w=600&auto=format&fit=crop',
    iconSvg: defaultBoxSvg
  }
];

export function ProjetosGrid() {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {projects.map((project) => (
            <div key={project.id} className="group cursor-pointer">
              <div className="aspect-[4/3] rounded overflow-hidden bg-gray-100 mb-6">
                <EditableField id={`${project.id}_image`} defaultValue={project.image} type="image" className="w-full h-full">
                  {(url) => (
                    <img 
                      src={url} 
                      alt={project.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                    />
                  )}
                </EditableField>
              </div>
              
              <div className="text-center">
                <EditableField id={`${project.id}_title`} defaultValue={project.title}>
                  {(text, styles) => (
                    <h3 className="font-serif text-xl font-bold text-brand-text mb-1" style={styles}>{text}</h3>
                  )}
                </EditableField>
                
                <EditableField id={`${project.id}_category`} defaultValue={project.category}>
                  {(text, styles) => (
                    <p className="text-brand-text/60 text-sm mb-4" style={styles}>{text}</p>
                  )}
                </EditableField>
                
                <div className="flex items-center justify-center gap-2 text-brand-rust text-sm font-medium">
                  <EditableField id={`${project.id}_icon`} defaultValue={project.iconSvg} type="html">
                    {(html) => (
                      <div className="w-4 h-4 text-brand-rust flex items-center justify-center [&>svg]:w-4 [&>svg]:h-4" dangerouslySetInnerHTML={{ __html: html }} />
                    )}
                  </EditableField>
                  <EditableField id={`${project.id}_product`} defaultValue={project.product}>
                    {(text, styles) => (
                      <span style={styles}>{text}</span>
                    )}
                  </EditableField>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
