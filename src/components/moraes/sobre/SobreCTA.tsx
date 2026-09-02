import { Link } from '@tanstack/react-router';
import { EditableField } from '../../admin/EditableField';

export function SobreCTA() {
  return (
    <section className="relative py-24 flex items-center">
      {/* Background Image */}
      <EditableField id="sobre_cta_img" defaultValue="https://images.unsplash.com/photo-1596489370836-47a80b6883ec?q=80&w=2072&auto=format&fit=crop" type="image">
        {(url) => (
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${url}')` }}
          >
            <div className="absolute inset-0 bg-black/60"></div>
          </div>
        )}
      </EditableField>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          
          <div className="lg:w-2/3">
            <EditableField id="sobre_cta_title" defaultValue="Mais do que revestimentos,<br />entregamos <em class='font-serif italic text-brand-rust'>significado.</em>" type="html">
              {(html, styles) => (
                <h2 
                  className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-[1.2] mb-6 drop-shadow-md"
                  style={{ ...styles, color: styles?.color || 'white' }}
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              )}
            </EditableField>
            
            <EditableField id="sobre_cta_desc" defaultValue="Cada projeto é único. E ter Moraes ao seu lado é garantir solidez, beleza e história em cada detalhe.">
              {(text, styles) => (
                <p 
                  className="text-white/90 text-sm md:text-base leading-relaxed max-w-xl drop-shadow"
                  style={{ ...styles, color: styles?.color || 'rgba(255, 255, 255, 0.9)' }}
                >
                  {text}
                </p>
              )}
            </EditableField>
          </div>
          
          <div className="lg:w-1/3 flex justify-lg-end w-full lg:w-auto">
            <EditableField id="sobre_cta_btn" defaultValue="Conheça nossos produtos">
              {(text, styles) => (
                <Link 
                  to="/produtos" 
                  className="w-full lg:w-auto border border-white hover:bg-white/10 text-white px-8 py-4 rounded font-bold text-sm text-center uppercase tracking-wider transition-colors backdrop-blur-sm"
                  style={{ ...styles, color: styles?.color || 'white' }}
                >
                  {text}
                </Link>
              )}
            </EditableField>
          </div>
          
        </div>
      </div>
    </section>
  );
}
