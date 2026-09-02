import { MessageCircle, MapPin, Mail, Phone, Clock, FileText, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { EditableField } from '../../admin/EditableField';
import { trackMetaEvent } from '../../../lib/meta-capi';
import { useSettingsContext } from '../../../lib/settings-context';

export function ContatoContent() {
  const { contactSettings } = useSettingsContext();
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', cidade: '', assunto: '', mensagem: '' });

  const updateField = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = () => {
    if (!form.nome.trim() || (!form.email.trim() && !form.telefone.trim())) {
      alert('Preencha ao menos o nome e um e-mail ou telefone para contato.');
      return;
    }

    trackMetaEvent('Lead', {
      email: form.email || undefined,
      phone: form.telefone || undefined,
      customData: { content_name: 'Formulário de Contato', subject: form.assunto || undefined },
    });

    const whatsappNumber = contactSettings?.whatsappNumber || '5511995038661';
    const lines = [
      `Olá, meu nome é ${form.nome}.`,
      form.assunto && `Assunto: ${form.assunto}`,
      form.cidade && `Cidade/Estado: ${form.cidade}`,
      form.mensagem && `Mensagem: ${form.mensagem}`,
      form.email && `E-mail para contato: ${form.email}`,
    ].filter(Boolean);

    window.open(`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="bg-brand-bg py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          
          {/* Form Side */}
          <div className="lg:w-7/12">
            <div className="bg-white p-8 md:p-10 rounded shadow-sm border border-gray-100">
              <EditableField id="contato_form_title" defaultValue="Envie uma mensagem">
                {(text, styles) => (
                  <h3 className="font-serif text-2xl font-bold text-brand-text mb-6" style={styles}>{text}</h3>
                )}
              </EditableField>
              
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" value={form.nome} onChange={updateField('nome')} placeholder="Nome completo" className="w-full border border-gray-200 rounded px-4 py-3 text-sm focus:outline-none focus:border-brand-rust" />
                  <input type="email" value={form.email} onChange={updateField('email')} placeholder="E-mail" className="w-full border border-gray-200 rounded px-4 py-3 text-sm focus:outline-none focus:border-brand-rust" />
                </div>

                <input type="tel" value={form.telefone} onChange={updateField('telefone')} placeholder="Telefone / WhatsApp" className="w-full border border-gray-200 rounded px-4 py-3 text-sm focus:outline-none focus:border-brand-rust" />

                <input type="text" value={form.cidade} onChange={updateField('cidade')} placeholder="Cidade / Estado" className="w-full border border-gray-200 rounded px-4 py-3 text-sm focus:outline-none focus:border-brand-rust" />

                <input type="text" value={form.assunto} onChange={updateField('assunto')} placeholder="Assunto" className="w-full border border-gray-200 rounded px-4 py-3 text-sm focus:outline-none focus:border-brand-rust" />

                <textarea rows={4} value={form.mensagem} onChange={updateField('mensagem')} placeholder="Mensagem" className="w-full border border-gray-200 rounded px-4 py-3 text-sm focus:outline-none focus:border-brand-rust resize-none"></textarea>

                <button type="submit" className="w-full bg-brand-rust hover:bg-brand-rust-dark text-white py-4 rounded font-bold text-sm transition-colors mt-2 cursor-pointer">
                  <EditableField id="contato_form_btn" defaultValue="Enviar mensagem">
                    {(text, styles) => <span style={{ ...styles, color: styles?.color || 'white' }}>{text}</span>}
                  </EditableField>
                </button>
              </form>
              
              <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-100">
                <EditableField id="icon_ContatoContent_ShieldCheck_m5h0c" defaultValue="" type="image">{(url) => url ? <img src={url} alt="ShieldCheck" className="w-6 h-6 text-brand-rust flex-shrink-0 object-contain" /> : <ShieldCheck className="w-6 h-6 text-brand-rust flex-shrink-0" strokeWidth={1.5} />}</EditableField>
                <EditableField id="contato_form_disclaimer" defaultValue="Nossa equipe responde com orientação para seu projeto e informações sobre produtos e aplicações.">
                  {(text, styles) => (
                    <p className="text-xs text-brand-text/70 font-medium" style={styles}>
                      {text}
                    </p>
                  )}
                </EditableField>
              </div>
            </div>
          </div>

          {/* Info Side */}
          <div className="lg:w-5/12 space-y-4">
            
            {/* WhatsApp Card */}
            <div className="bg-[#EBE7E0] p-6 rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-green text-white rounded-full flex items-center justify-center flex-shrink-0">
                  <EditableField id="icon_ContatoContent_MessageCircle_jawf7" defaultValue="" type="image">{(url) => url ? <img src={url} alt="MessageCircle" className="w-6 h-6 object-contain" /> : <MessageCircle className="w-6 h-6" />}</EditableField>
                </div>
                <div>
                  <EditableField id="contato_info_wts_lbl" defaultValue="WhatsApp / Atendimento comercial">
                    {(text, styles) => <p className="text-[10px] uppercase tracking-wider font-bold text-brand-text/60 mb-0.5" style={styles}>{text}</p>}
                  </EditableField>
                  <EditableField id="contato_info_wts_val" defaultValue="+55 11 99503-8661">
                    {(text, styles) => <p className="text-base font-bold text-brand-text" style={styles}>{text}</p>}
                  </EditableField>
                </div>
              </div>
              <a href="https://wa.me/5511995038661" target="_blank" rel="noopener noreferrer" className="bg-brand-green hover:bg-brand-green-dark text-white px-4 py-3 sm:py-2 rounded text-xs font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap w-full sm:w-auto">
                <EditableField id="icon_ContatoContent_MessageCircle_19jde" defaultValue="" type="image">{(url) => url ? <img src={url} alt="MessageCircle" className="w-4 h-4 object-contain" /> : <MessageCircle className="w-4 h-4" />}</EditableField>
                <EditableField id="contato_info_wts_btn" defaultValue="Falar no WhatsApp">
                  {(text, styles) => <span style={{ ...styles, color: styles?.color || 'white' }}>{text}</span>}
                </EditableField>
              </a>
            </div>

            {/* Other Info Cards */}
            <div className="bg-[#EBE7E0] p-6 rounded space-y-6">
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#DCD8D0] rounded-full flex items-center justify-center flex-shrink-0">
                  <EditableField id="icon_ContatoContent_Phone_nn2hv" defaultValue="" type="image">{(url) => url ? <img src={url} alt="Phone" className="w-5 h-5 text-brand-rust object-contain" /> : <Phone className="w-5 h-5 text-brand-rust" />}</EditableField>
                </div>
                <div>
                  <EditableField id="contato_info_tel_lbl" defaultValue="Telefone">
                    {(text, styles) => <p className="text-[10px] uppercase tracking-wider font-bold text-brand-text/60 mb-0.5" style={styles}>{text}</p>}
                  </EditableField>
                  <EditableField id="contato_info_tel_val" defaultValue="+55 11 99503-8661">
                    {(text, styles) => <p className="text-sm font-bold text-brand-text" style={styles}>{text}</p>}
                  </EditableField>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#DCD8D0] rounded-full flex items-center justify-center flex-shrink-0">
                  <EditableField id="icon_ContatoContent_Mail_ulwto" defaultValue="" type="image">{(url) => url ? <img src={url} alt="Mail" className="w-5 h-5 text-brand-rust object-contain" /> : <Mail className="w-5 h-5 text-brand-rust" />}</EditableField>
                </div>
                <div>
                  <EditableField id="contato_info_mail_lbl" defaultValue="E-mail">
                    {(text, styles) => <p className="text-[10px] uppercase tracking-wider font-bold text-brand-text/60 mb-0.5" style={styles}>{text}</p>}
                  </EditableField>
                  <EditableField id="contato_info_mail_val" defaultValue="atendimento@moraestijolos.com.br">
                    {(text, styles) => <p className="text-sm font-bold text-brand-text" style={styles}>{text}</p>}
                  </EditableField>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#DCD8D0] rounded-full flex items-center justify-center flex-shrink-0">
                  <EditableField id="icon_ContatoContent_MapPin_71uzt" defaultValue="" type="image">{(url) => url ? <img src={url} alt="MapPin" className="w-5 h-5 text-brand-rust object-contain" /> : <MapPin className="w-5 h-5 text-brand-rust" />}</EditableField>
                </div>
                <div>
                  <EditableField id="contato_info_end_lbl" defaultValue="Endereço">
                    {(text, styles) => <p className="text-[10px] uppercase tracking-wider font-bold text-brand-text/60 mb-0.5" style={styles}>{text}</p>}
                  </EditableField>
                  <EditableField id="contato_info_end_val" defaultValue="R. Sen. Roberto Símonsen, 381 - Parque Brasil<br />Bragança Paulista - SP<br />CEP 12906-330" type="html">
                    {(html, styles) => (
                      <p className="text-sm font-bold text-brand-text leading-snug" style={styles} dangerouslySetInnerHTML={{ __html: html }} />
                    )}
                  </EditableField>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#DCD8D0] rounded-full flex items-center justify-center flex-shrink-0">
                  <EditableField id="icon_ContatoContent_Clock_00xt2" defaultValue="" type="image">{(url) => url ? <img src={url} alt="Clock" className="w-5 h-5 text-brand-rust object-contain" /> : <Clock className="w-5 h-5 text-brand-rust" />}</EditableField>
                </div>
                <div>
                  <EditableField id="contato_info_hor_lbl" defaultValue="Horário de atendimento">
                    {(text, styles) => <p className="text-[10px] uppercase tracking-wider font-bold text-brand-text/60 mb-0.5" style={styles}>{text}</p>}
                  </EditableField>
                  <EditableField id="contato_info_hor_val" defaultValue="Segunda a sexta a partir das 08:00">
                    {(text, styles) => <p className="text-sm font-bold text-brand-text" style={styles}>{text}</p>}
                  </EditableField>
                </div>
              </div>
            </div>

            <button type="button" className="w-full border border-brand-text/20 hover:border-brand-text/40 hover:bg-black/5 text-brand-text py-4 rounded font-bold text-sm flex items-center justify-center gap-2 transition-all">
              <EditableField id="icon_ContatoContent_FileText_njoyp" defaultValue="" type="image">{(url) => url ? <img src={url} alt="FileText" className="w-5 h-5 object-contain" /> : <FileText className="w-5 h-5" />}</EditableField>
              <EditableField id="contato_info_orc_btn" defaultValue="Solicitar orçamento">
                {(text, styles) => <span style={styles}>{text}</span>}
              </EditableField>
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
