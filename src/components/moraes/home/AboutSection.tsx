import { MapPin } from 'lucide-react';
import { EditableField } from '../../admin/EditableField';

export function AboutSection() {
  return (
    <section className="py-20 bg-brand-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-stretch">
          
          {/* Main Image */}
          <div className="lg:w-1/2 aspect-[4/3] lg:aspect-auto lg:min-h-[500px] overflow-hidden rounded shadow-sm">
            <EditableField id="home_about_img1" defaultValue="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1000&auto=format&fit=crop" type="image" className="w-full h-full">
              {(url) => <img src={url} alt="Fachada Moraes Tijolos Revestimentos" className="w-full h-full object-cover" />}
            </EditableField>
          </div>

          {/* Content */}
          <div className="lg:w-1/2 flex flex-col justify-center py-6">
            <EditableField id="home_about_title" defaultValue="Sobre a Moraes">
              {(text, styles) => (
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-text mb-6" style={styles}>{text}</h2>
              )}
            </EditableField>
            <div className="w-16 h-0.5 bg-brand-rust opacity-40 mb-8"></div>
            
            <EditableField id="home_about_desc" defaultValue="Somos fabricantes de revestimentos cerâmicos com foco em fachadas, paredes decorativas, áreas gourmet, pisos internos e externos e projetos arquitetônicos. Unimos tradição artesanal, quase 50 anos de experiência e design contemporâneo para criar produtos autênticos, duráveis e cheios de personalidade.">
              {(text, styles) => (
                <p className="text-brand-text/80 leading-relaxed mb-10 text-sm md:text-base" style={styles}>{text}</p>
              )}
            </EditableField>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-sm font-semibold text-brand-text mb-12">
              <div className="flex items-center gap-2">
                <EditableField id="icon_AboutSection_MapPin_eecrl" defaultValue="" type="image">{(url) => url ? <img src={url} alt="MapPin" className="w-5 h-5 text-brand-rust object-contain" /> : <MapPin className="w-5 h-5 text-brand-rust" strokeWidth={1.5} />}</EditableField>
                <EditableField id="home_about_loc" defaultValue="Tambaú, São Paulo">
                  {(text, styles) => <span style={styles}>{text}</span>}
                </EditableField>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-brand-rust" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <EditableField id="home_about_exp" defaultValue="Quase 50 anos de tradição">
                   {(text, styles) => <span style={styles}>{text}</span>}
                </EditableField>
              </div>
            </div>

            {/* Small Images */}
            <div className="grid grid-cols-2 gap-4 mt-auto">
               <div className="aspect-[4/3] rounded overflow-hidden shadow-sm">
                 <EditableField id="home_about_img2" defaultValue="https://images.unsplash.com/photo-1600607688969-a5bfcd64bd03?q=80&w=600&auto=format&fit=crop" type="image" className="w-full h-full">
                   {(url) => <img src={url} alt="Interior" className="w-full h-full object-cover" />}
                 </EditableField>
               </div>
               <div className="aspect-[4/3] rounded overflow-hidden shadow-sm">
                 <EditableField id="home_about_img3" defaultValue="https://images.unsplash.com/photo-1622372736597-9eb9cce329ce?q=80&w=600&auto=format&fit=crop" type="image" className="w-full h-full">
                   {(url) => <img src={url} alt="Exterior" className="w-full h-full object-cover" />}
                 </EditableField>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
