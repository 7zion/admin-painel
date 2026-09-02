import { MapPin, CalendarDays } from 'lucide-react';
import { EditableField } from '../../admin/EditableField';
import { useSettingsContext } from '../../../lib/settings-context';

export function ContatoLocation() {
  const { contactSettings } = useSettingsContext();
  const address = contactSettings?.companyAddress?.trim();

  return (
    <section className="bg-brand-bg py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 items-center">

          <div className="lg:w-1/2 w-full relative">
            <div className="aspect-[16/9] lg:aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden shadow-sm relative">
              {address ? (
                <iframe
                  title="Localização no mapa"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <>
                  <EditableField id="contato_loc_img" defaultValue="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1600&auto=format&fit=crop" type="image" className="w-full h-full">
                    {(url) => (
                      <img
                        src={url}
                        alt="Mapa"
                        className="w-full h-full object-cover grayscale opacity-60 mix-blend-multiply"
                      />
                    )}
                  </EditableField>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-white px-6 py-4 rounded shadow-lg flex flex-col items-center max-w-xs text-center border-t-4 border-brand-rust">
                      <EditableField id="icon_ContatoLocation_MapPin_5heda" defaultValue="" type="image">{(url) => url ? <img src={url} alt="MapPin" className="w-8 h-8 text-brand-rust mb-2 object-contain" /> : <MapPin className="w-8 h-8 text-brand-rust mb-2" />}</EditableField>
                      <EditableField id="contato_loc_badge_title" defaultValue="MORAES">
                        {(text, styles) => (
                          <h4 className="font-serif font-bold text-lg text-brand-text leading-tight" style={styles}>{text}</h4>
                        )}
                      </EditableField>
                      <EditableField id="contato_loc_badge_sub" defaultValue="Tijolos Revestimentos">
                        {(text, styles) => (
                          <p className="text-[9px] uppercase tracking-widest font-bold text-brand-text/70" style={styles}>{text}</p>
                        )}
                      </EditableField>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="lg:w-1/2 flex flex-col justify-center">
            <EditableField id="contato_loc_title" defaultValue="Onde estamos">
              {(text, styles) => (
                <h2 className="font-serif text-3xl font-bold text-brand-text mb-8" style={styles}>
                  {text}
                </h2>
              )}
            </EditableField>
            
            <div className="flex items-start gap-4 mb-6">
              <EditableField id="icon_ContatoLocation_MapPin_jzshq" defaultValue="" type="image">{(url) => url ? <img src={url} alt="MapPin" className="w-6 h-6 text-brand-rust flex-shrink-0 mt-1 object-contain" /> : <MapPin className="w-6 h-6 text-brand-rust flex-shrink-0 mt-1" strokeWidth={1.5} />}</EditableField>
              <div>
                <EditableField id="contato_loc_end_title" defaultValue="Bragança Paulista, São Paulo">
                  {(text, styles) => (
                    <h4 className="font-bold text-lg text-brand-text" style={styles}>{text}</h4>
                  )}
                </EditableField>
                <EditableField id="contato_loc_end_cep" defaultValue="CEP 12906-330">
                  {(text, styles) => (
                    <p className="text-sm text-brand-text/70" style={styles}>{text}</p>
                  )}
                </EditableField>
              </div>
            </div>
            
            <EditableField id="contato_loc_desc" defaultValue="Nossa unidade está localizada em Bragança Paulista, interior de São Paulo. Recebemos visitas com agendamento para apresentação de produtos e atendimento personalizado para seu projeto.">
              {(text, styles) => (
                <p className="text-brand-text/80 text-sm leading-relaxed mb-8 max-w-md" style={styles}>
                  {text}
                </p>
              )}
            </EditableField>
            
            <div className="flex items-start gap-4">
              <EditableField id="icon_ContatoLocation_CalendarDays_h000c" defaultValue="" type="image">{(url) => url ? <img src={url} alt="CalendarDays" className="w-6 h-6 text-brand-rust flex-shrink-0 mt-1 object-contain" /> : <CalendarDays className="w-6 h-6 text-brand-rust flex-shrink-0 mt-1" strokeWidth={1.5} />}</EditableField>
              <EditableField id="contato_loc_agenda" defaultValue="Agende sua visita com antecedência<br /><span class='text-brand-text/70 font-normal'>e conheça nossa estrutura e showroom.</span>" type="html">
                {(html, styles) => (
                  <p className="text-sm font-medium text-brand-rust-dark leading-relaxed" style={styles} dangerouslySetInnerHTML={{ __html: html }} />
                )}
              </EditableField>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
