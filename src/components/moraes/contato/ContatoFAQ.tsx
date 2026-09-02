import { Plus } from 'lucide-react';
import { EditableField } from '../../admin/EditableField';

export function ContatoFAQ() {
  const faqs = [
    {
      id: 'contato_faq_1',
      qDef: 'Vocês atendem somente Bragança Paulista?',
      aDef: 'Atendemos Bragança Paulista e região, além de clientes de todo o Brasil com envio de produtos.'
    },
    {
      id: 'contato_faq_2',
      qDef: 'Posso comprar pelo WhatsApp?',
      aDef: 'Sim! Você pode solicitar orçamentos, tirar dúvidas e acompanhar seu pedido pelo WhatsApp.'
    },
    {
      id: 'contato_faq_3',
      qDef: 'Vocês atendem arquitetos e construtoras?',
      aDef: 'Sim. Oferecemos condições especiais e suporte técnico para profissionais e empresas.'
    },
    {
      id: 'contato_faq_4',
      qDef: 'Como escolher o revestimento ideal?',
      aDef: 'Nossa equipe orienta conforme o ambiente, estilo do projeto e funcionalidade desejada.'
    }
  ];

  return (
    <section className="bg-[#F4F1EC] py-20 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <EditableField id="contato_faq_title" defaultValue="Dúvidas frequentes">
            {(text, styles) => (
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-text mb-4" style={styles}>
                {text}
              </h2>
            )}
          </EditableField>
          <div className="w-16 h-px bg-brand-rust mx-auto opacity-40"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {faqs.map((faq) => (
            <div key={faq.id} className="bg-white p-6 rounded shadow-sm border border-gray-100 flex flex-col h-full">
              <div className="flex items-start justify-between gap-4 mb-4">
                <EditableField id={`${faq.id}_q`} defaultValue={faq.qDef}>
                  {(text, styles) => (
                    <h4 className="font-bold text-sm text-brand-text leading-snug" style={styles}>{text}</h4>
                  )}
                </EditableField>
                <EditableField id="icon_ContatoFAQ_Plus_y4ee5" defaultValue="" type="image">{(url) => url ? <img src={url} alt="Plus" className="w-4 h-4 text-brand-rust flex-shrink-0 object-contain" /> : <Plus className="w-4 h-4 text-brand-rust flex-shrink-0" strokeWidth={2} />}</EditableField>
              </div>
              
              <div className="mt-auto">
                <EditableField id={`${faq.id}_a`} defaultValue={faq.aDef}>
                  {(text, styles) => (
                    <p className="text-xs text-brand-text/70 leading-relaxed" style={styles}>{text}</p>
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
