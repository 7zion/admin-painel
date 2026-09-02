import { Paintbrush, Palette, Home, Puzzle, Building, ShieldCheck } from 'lucide-react';
import { EditableField } from '../../admin/EditableField';

export function ProdutoBenefits() {
  const benefits = [
    {
      id: 'prod_ben_1',
      icon: <EditableField id="icon_ProdutoBenefits_Paintbrush_kqsm6" defaultValue="" type="image">{(url) => url ? <img src={url} alt="Paintbrush" className="w-8 h-8 text-brand-rust object-contain" /> : <Paintbrush className="w-8 h-8 text-brand-rust" strokeWidth={1.5} />}</EditableField>,
      titleDef: 'Estética artesanal\ne sofisticada',
      descDef: 'Textura rústica que valoriza ambientes com autenticidade e personalidade.'
    },
    {
      id: 'prod_ben_2',
      icon: <EditableField id="icon_ProdutoBenefits_Palette_n22fu" defaultValue="" type="image">{(url) => url ? <img src={url} alt="Palette" className="w-8 h-8 text-brand-rust object-contain" /> : <Palette className="w-8 h-8 text-brand-rust" strokeWidth={1.5} />}</EditableField>,
      titleDef: 'Tonalidade fumê\nelegante e atemporal',
      descDef: 'Cores neutras que combinam com diferentes estilos e materiais.'
    },
    {
      id: 'prod_ben_3',
      icon: <EditableField id="icon_ProdutoBenefits_Home_waii8" defaultValue="" type="image">{(url) => url ? <img src={url} alt="Home" className="w-8 h-8 text-brand-rust object-contain" /> : <Home className="w-8 h-8 text-brand-rust" strokeWidth={1.5} />}</EditableField>,
      titleDef: 'Excelente composição\npara fachadas e\náreas gourmet',
      descDef: 'Ideal para criar atmosferas acolhedoras e sofisticadas.'
    },
    {
      id: 'prod_ben_4',
      icon: <EditableField id="icon_ProdutoBenefits_Puzzle_hpxi4" defaultValue="" type="image">{(url) => url ? <img src={url} alt="Puzzle" className="w-8 h-8 text-brand-rust object-contain" /> : <Puzzle className="w-8 h-8 text-brand-rust" strokeWidth={1.5} />}</EditableField>,
      titleDef: 'Encaixe prático\ne bom acabamento\nvisual',
      descDef: 'Facilita a instalação e garante um resultado uniforme.'
    },
    {
      id: 'prod_ben_5',
      icon: <EditableField id="icon_ProdutoBenefits_Building_bbfsx" defaultValue="" type="image">{(url) => url ? <img src={url} alt="Building" className="w-8 h-8 text-brand-rust object-contain" /> : <Building className="w-8 h-8 text-brand-rust" strokeWidth={1.5} />}</EditableField>,
      titleDef: 'Versatilidade para\nprojetos residenciais\ne comerciais',
      descDef: 'Perfeito para diferentes ambientes e propostas de design.'
    },
    {
      id: 'prod_ben_6',
      icon: <EditableField id="icon_ProdutoBenefits_ShieldCheck_trgws" defaultValue="" type="image">{(url) => url ? <img src={url} alt="ShieldCheck" className="w-8 h-8 text-brand-rust object-contain" /> : <ShieldCheck className="w-8 h-8 text-brand-rust" strokeWidth={1.5} />}</EditableField>,
      titleDef: 'Resistência e\ndurabilidade',
      descDef: 'Cerâmica de alta qualidade, resistente ao tempo e à umidade.'
    }
  ];

  return (
    <section className="py-16 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <EditableField id="prod_benefits_title" defaultValue="Benefícios do produto" type="html">
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
          {benefits.map((b) => (
            <div key={b.id} className="bg-white border border-gray-200 p-6 flex flex-col items-center text-center rounded-sm">
              <div className="mb-4">
                {b.icon}
              </div>
              <EditableField id={`${b.id}_title`} defaultValue={b.titleDef} type="text">
                {(text, styles) => (
                  <h4 className="text-[11px] font-bold text-brand-text leading-snug mb-3 whitespace-pre-line" style={styles}>{text}</h4>
                )}
              </EditableField>
              <EditableField id={`${b.id}_desc`} defaultValue={b.descDef} type="text">
                {(text, styles) => (
                  <p className="text-[10px] text-brand-text/70 leading-relaxed" style={styles}>{text}</p>
                )}
              </EditableField>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
