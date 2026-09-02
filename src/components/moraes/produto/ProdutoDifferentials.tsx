import { Award, Factory, Columns3, Users } from 'lucide-react';
import { EditableField } from '../../admin/EditableField';

export function ProdutoDifferentials() {
  const diffs = [
    {
      id: 'prod_diff_1',
      icon: <EditableField id="icon_ProdutoDifferentials_Award_13ex6" defaultValue="" type="image">{(url) => url ? <img src={url} alt="Award" className="w-8 h-8 text-brand-rust object-contain" /> : <Award className="w-8 h-8 text-brand-rust" strokeWidth={1.5} />}</EditableField>,
      titleDef: 'Quase 50 anos\nde tradição',
      descDef: 'Experiência e credibilidade que acompanham gerações de projetos.'
    },
    {
      id: 'prod_diff_2',
      icon: <EditableField id="icon_ProdutoDifferentials_Factory_31gx5" defaultValue="" type="image">{(url) => url ? <img src={url} alt="Factory" className="w-8 h-8 text-brand-rust object-contain" /> : <Factory className="w-8 h-8 text-brand-rust" strokeWidth={1.5} />}</EditableField>,
      titleDef: 'Fabricação própria\nem Tambaú, São Paulo',
      descDef: 'Produção com controle de qualidade em todas as etapas.'
    },
    {
      id: 'prod_diff_3',
      icon: <EditableField id="icon_ProdutoDifferentials_Columns3_aw5c3" defaultValue="" type="image">{(url) => url ? <img src={url} alt="Columns3" className="w-8 h-8 text-brand-rust object-contain" /> : <Columns3 className="w-8 h-8 text-brand-rust" strokeWidth={1.5} />}</EditableField>,
      titleDef: 'Acabamento com\nidentidade artesanal',
      descDef: 'Peças únicas que carregam a essência do feito à mão.'
    },
    {
      id: 'prod_diff_4',
      icon: <EditableField id="icon_ProdutoDifferentials_Users_rq97i" defaultValue="" type="image">{(url) => url ? <img src={url} alt="Users" className="w-8 h-8 text-brand-rust object-contain" /> : <Users className="w-8 h-8 text-brand-rust" strokeWidth={1.5} />}</EditableField>,
      titleDef: 'Atendimento para arquitetos,\nconstrutoras e consumidor final',
      descDef: 'Suporte especializado para transformar ideias em realidade.'
    }
  ];

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <EditableField id="prod_diff_title" defaultValue="Diferenciais Moraes" type="html">
          {(html, styles) => (
            <h2 
              className="font-serif text-2xl md:text-3xl font-bold text-brand-text mb-12 relative inline-block"
              style={styles}
            >
              <span dangerouslySetInnerHTML={{ __html: html }} />
              <div className="absolute -bottom-2 left-0 w-16 h-0.5 bg-brand-rust"></div>
            </h2>
          )}
        </EditableField>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {diffs.map((d) => (
            <div key={d.id} className="flex gap-4 items-start">
              <div className="flex-shrink-0 mt-1">
                {d.icon}
              </div>
              <div>
                <EditableField id={`${d.id}_title`} defaultValue={d.titleDef} type="text">
                  {(text, styles) => (
                    <h4 className="text-[13px] font-bold text-brand-text mb-2 whitespace-pre-line leading-snug" style={styles}>{text}</h4>
                  )}
                </EditableField>
                <EditableField id={`${d.id}_desc`} defaultValue={d.descDef} type="text">
                  {(text, styles) => (
                    <p className="text-[11px] text-brand-text/70 leading-relaxed" style={styles}>{text}</p>
                  )}
                </EditableField>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
