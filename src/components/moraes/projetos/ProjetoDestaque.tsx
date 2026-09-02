import { Link } from '@tanstack/react-router';
import { EditableField } from '../../admin/EditableField';

const svgMapPin = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>`;
const svgGrip = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="19" cy="5" r="1"/><circle cx="5" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/><circle cx="12" cy="19" r="1"/><circle cx="19" cy="19" r="1"/><circle cx="5" cy="19" r="1"/></svg>`;
const svgBox = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`;
const svgHash = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>`;

export function ProjetoDestaque() {
  return (
    <section className="bg-[#F9F8F6] py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
          
          <div className="lg:w-3/5">
            <div className="aspect-[16/10] rounded overflow-hidden bg-gray-200">
              <EditableField id="proj_destaque_img" defaultValue="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop" type="image" className="w-full h-full">
                {(url) => (
                  <img 
                    src={url} 
                    alt="Projeto em Destaque" 
                    className="w-full h-full object-cover"
                  />
                )}
              </EditableField>
            </div>
          </div>
          
          <div className="lg:w-2/5">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-px bg-brand-rust"></div>
              <EditableField id="proj_destaque_tag" defaultValue="Projeto em destaque">
                {(text, styles) => (
                  <span className="text-xs font-bold text-brand-rust uppercase tracking-widest" style={styles}>{text}</span>
                )}
              </EditableField>
            </div>
            
            <EditableField id="proj_destaque_title" defaultValue="Casa Terracota Contemporânea">
              {(text, styles) => (
                <h2 className="font-serif text-3xl lg:text-4xl font-bold text-brand-text mb-6" style={styles}>
                  {text}
                </h2>
              )}
            </EditableField>
            
            <EditableField id="proj_destaque_desc" defaultValue="Nesta residência, o Brick Rusticatto Fumê valoriza as linhas arquitetônicas e cria uma atmosfera acolhedora e sofisticada. A combinação de texturas naturais, iluminação e paisagismo resulta em um projeto atemporal, com personalidade e presença.">
              {(text, styles) => (
                <p className="text-brand-text/80 text-sm leading-relaxed mb-8" style={styles}>
                  {text}
                </p>
              )}
            </EditableField>

            <div className="space-y-4 text-sm border-t border-b border-gray-200 py-6 mb-8">
              <div className="flex items-start gap-4">
                <EditableField id="proj_destaque_icon1" defaultValue={svgMapPin} type="html">
                  {(html) => <div className="w-4 h-4 text-brand-rust mt-0.5 flex-shrink-0 [&>svg]:w-4 [&>svg]:h-4" dangerouslySetInnerHTML={{ __html: html }} />}
                </EditableField>
                <div className="grid grid-cols-2 w-full">
                  <EditableField id="proj_destaque_lbl1" defaultValue="Local">
                    {(text, styles) => <span className="font-bold text-brand-text" style={styles}>{text}</span>}
                  </EditableField>
                  <EditableField id="proj_destaque_val1" defaultValue="Interior de São Paulo">
                    {(text, styles) => <span className="text-brand-text/80" style={styles}>{text}</span>}
                  </EditableField>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <EditableField id="proj_destaque_icon2" defaultValue={svgGrip} type="html">
                  {(html) => <div className="w-4 h-4 text-brand-rust mt-0.5 flex-shrink-0 [&>svg]:w-4 [&>svg]:h-4" dangerouslySetInnerHTML={{ __html: html }} />}
                </EditableField>
                <div className="grid grid-cols-2 w-full">
                  <EditableField id="proj_destaque_lbl2" defaultValue="Aplicação">
                    {(text, styles) => <span className="font-bold text-brand-text" style={styles}>{text}</span>}
                  </EditableField>
                  <EditableField id="proj_destaque_val2" defaultValue="Fachada e muro">
                    {(text, styles) => <span className="text-brand-text/80" style={styles}>{text}</span>}
                  </EditableField>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <EditableField id="proj_destaque_icon3" defaultValue={svgBox} type="html">
                  {(html) => <div className="w-4 h-4 text-brand-rust mt-0.5 flex-shrink-0 [&>svg]:w-4 [&>svg]:h-4" dangerouslySetInnerHTML={{ __html: html }} />}
                </EditableField>
                <div className="grid grid-cols-2 w-full">
                  <EditableField id="proj_destaque_lbl3" defaultValue="Produto">
                    {(text, styles) => <span className="font-bold text-brand-text" style={styles}>{text}</span>}
                  </EditableField>
                  <EditableField id="proj_destaque_val3" defaultValue="Brick Rusticatto Fumê">
                    {(text, styles) => <span className="text-brand-text/80" style={styles}>{text}</span>}
                  </EditableField>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <EditableField id="proj_destaque_icon4" defaultValue={svgHash} type="html">
                  {(html) => <div className="w-4 h-4 text-brand-rust mt-0.5 flex-shrink-0 [&>svg]:w-4 [&>svg]:h-4" dangerouslySetInnerHTML={{ __html: html }} />}
                </EditableField>
                <div className="grid grid-cols-2 w-full">
                  <EditableField id="proj_destaque_lbl4" defaultValue="Estilo">
                    {(text, styles) => <span className="font-bold text-brand-text" style={styles}>{text}</span>}
                  </EditableField>
                  <EditableField id="proj_destaque_val4" defaultValue="Contemporâneo com toque rústico">
                    {(text, styles) => <span className="text-brand-text/80" style={styles}>{text}</span>}
                  </EditableField>
                </div>
              </div>
            </div>

            <Link to="/produtos" search={{ categoria: undefined }} className="inline-block bg-brand-rust hover:bg-brand-rust-dark text-white px-6 py-3 rounded text-sm font-bold transition-colors">
              <EditableField id="proj_destaque_btn" defaultValue="Ver produtos">
                {(text, styles) => <span style={{ ...styles, color: styles?.color || 'white' }}>{text}</span>}
              </EditableField>
            </Link>
          </div>
          
        </div>
      </div>
    </section>
  );
}
