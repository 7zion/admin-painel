import { MessageCircle } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { EditableField } from '../../admin/EditableField';

export function HeroSection() {
  return (
    <EditableField id="home_hero_bg" defaultValue="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop" type="image">
      {(bgUrl) => (
        <section className="relative h-[85vh] min-h-[600px] flex items-center">
          {/* Background Image */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${bgUrl}')` }}
          >
            <div className="absolute inset-0 bg-black/40"></div>
          </div>

          <div className="relative z-10 max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-white">
            <div className="max-w-2xl 2xl:max-w-4xl">
              <EditableField id="home_hero_title" defaultValue="Revestimentos<br />cerâmicos para projetos<br />com personalidade." type="html">
                {(title, titleStyles) => (
                  <h1 
                    className="font-serif text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl font-bold leading-[1.1] mb-6 text-white drop-shadow-lg"
                    style={{ ...titleStyles, color: titleStyles?.color || 'white' }}
                    dangerouslySetInnerHTML={{ __html: title }}
                  />
                )}
              </EditableField>
              <EditableField id="home_hero_subtitle" defaultValue="Soluções artesanais e contemporâneas para fachadas,<br />paredes, áreas gourmet e pisos. Tradição de quase<br />50 anos em Tambaú, São Paulo." type="html">
                {(subtitle, subtitleStyles) => (
                  <p 
                    className="text-lg md:text-xl 2xl:text-2xl text-white/90 mb-10 leading-relaxed font-medium drop-shadow"
                    style={{ ...subtitleStyles, color: subtitleStyles?.color || 'rgba(255, 255, 255, 0.9)' }}
                    dangerouslySetInnerHTML={{ __html: subtitle }}
                  />
                )}
              </EditableField>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <EditableField id="home_hero_btn1" defaultValue="Ver produtos">
                  {(btn1, btn1Styles) => (
                    <Link 
                      to="/produtos" 
                      className="bg-brand-rust hover:bg-brand-rust-dark text-white px-8 h-12 flex items-center justify-center rounded font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                      style={btn1Styles}
                    >
                      {btn1}
                    </Link>
                  )}
                </EditableField>
                <EditableField id="home_hero_btn2" defaultValue="Falar no WhatsApp">
                  {(btn2, btn2Styles) => (
                    <a 
                      href="https://wa.me/5511995038661" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="border border-white hover:bg-white/10 text-white px-8 h-12 flex items-center justify-center rounded font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] gap-2"
                      style={btn2Styles}
                    >
                      <EditableField id="icon_HeroSection_MessageCircle_ehwhd" defaultValue="" type="image">{(url) => url ? <img src={url} alt="MessageCircle" className="w-5 h-5 object-contain" /> : <MessageCircle className="w-5 h-5" />}</EditableField>
                      {btn2}
                    </a>
                  )}
                </EditableField>
              </div>
            </div>
          </div>
        </section>
      )}
    </EditableField>
  );
}
