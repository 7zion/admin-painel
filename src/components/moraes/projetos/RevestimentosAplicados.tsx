import { Link } from '@tanstack/react-router';
import { EditableField } from '../../admin/EditableField';

const categories = [
  {
    id: 'proj_rev_1',
    title: 'Tijolinhos / Brick',
    description: 'Textura e aconchego para fachadas, paredes e ambientes diversos.',
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=400&auto=format&fit=crop',
    link: '/produtos'
  },
  {
    id: 'proj_rev_2',
    title: 'Cimentícios',
    description: 'Visual urbano e minimalista para espaços contemporâneos.',
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=400&auto=format&fit=crop',
    link: '/produtos'
  },
  {
    id: 'proj_rev_3',
    title: 'Pedras e Fachadas / Rockface',
    description: 'Relevo natural que valoriza muros, fachadas e áreas externas.',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=400&auto=format&fit=crop',
    link: '/produtos'
  },
  {
    id: 'proj_rev_4',
    title: 'Pisos Rústicos',
    description: 'Pisos cerâmicos artesanais que unem beleza, resistência e conforto.',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=400&auto=format&fit=crop',
    link: '/produtos'
  }
];

export function RevestimentosAplicados() {
  return (
    <section className="bg-[#F9F8F6] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <EditableField id="proj_rev_title" defaultValue="Revestimentos aplicados em projetos reais">
          {(text, styles) => (
            <h2 className="font-serif text-3xl font-bold text-brand-text text-center mb-12" style={styles}>
              {text}
            </h2>
          )}
        </EditableField>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link key={category.id} to={category.link} className="group block bg-white rounded overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                <EditableField id={`${category.id}_image`} defaultValue={category.image} type="image" className="w-full h-full">
                  {(url) => (
                    <img 
                      src={url} 
                      alt={category.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                    />
                  )}
                </EditableField>
              </div>
              <div className="p-6 text-center flex flex-col h-full">
                <EditableField id={`${category.id}_title`} defaultValue={category.title}>
                  {(text, styles) => (
                    <h3 className="font-serif text-lg font-bold text-brand-text mb-2" style={styles}>{text}</h3>
                  )}
                </EditableField>
                <EditableField id={`${category.id}_desc`} defaultValue={category.description}>
                  {(text, styles) => (
                    <p className="text-brand-text/70 text-xs leading-relaxed" style={styles}>{text}</p>
                  )}
                </EditableField>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
