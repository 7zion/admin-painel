import { Instagram, Facebook, LayoutTemplate } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { EditableField } from '../admin/EditableField';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { productCategoryRowToApp } from '../../lib/supabase-mappers';
import { ProductCategory } from '../../types/admin';
import { useSettingsContext } from '../../lib/settings-context';

export function Footer({ initialCategories = [] }: { initialCategories?: ProductCategory[] }) {
  const [categories, setCategories] = useState<ProductCategory[]>(initialCategories);
  const { settings } = useSettingsContext();

  useEffect(() => {
    async function loadCategories() {
      try {
        const { data, error } = await supabase.from('product_categories').select('*').order('created_at', { ascending: true });
        if (error) throw error;
        setCategories((data || []).map(productCategoryRowToApp) as ProductCategory[]);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    }
    loadCategories();

    const channel = supabase
      .channel('footer-categories-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_categories' }, loadCategories)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <footer className="bg-brand-footer text-brand-footer-text py-16 border-t-4 border-brand-rust">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
        
        {/* Marca e Sobre */}
        <div className="lg:col-span-2">
          <Link to="/" className="inline-block mb-6">
            <EditableField id="footer_logo" defaultValue="" type="image">
              {(url, styles) => {
                const logoUrl = url || settings.siteLogoFooter || settings.siteLogo;
                return logoUrl ? (
                  <img src={logoUrl} alt="Moraes Logo" className="h-10 w-auto object-contain brightness-0 invert" style={styles} />
                ) : (
                  <div className="h-10 flex items-center">
                    <span className="font-serif text-2xl font-bold text-white tracking-tight">
                      Moraes<span className="text-brand-rust">.</span>
                    </span>
                  </div>
                );
              }}
            </EditableField>
          </Link>
          <EditableField id="footer_desc" defaultValue="Tradição artesanal que transforma projetos em ambientes únicos.">
            {(text, styles) => (
              <p className="text-xs text-brand-footer-text/80 leading-relaxed max-w-xs" style={styles}>
                {text}
              </p>
            )}
          </EditableField>
        </div>

        {/* Navegação */}
        <div>
          <EditableField id="footer_nav_title" defaultValue="Navegação">
            {(text, styles) => (
              <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4" style={{ ...styles, color: styles?.color || 'white' }}>{text}</h4>
            )}
          </EditableField>
          <ul className="space-y-3">
            <li><Link to="/" className="text-sm hover:text-white transition-colors">
              <EditableField id="footer_nav_1" defaultValue="Home">{(text, styles) => <span style={styles}>{text}</span>}</EditableField>
            </Link></li>
            <li><Link to="/a-empresa" className="text-sm hover:text-white transition-colors">
              <EditableField id="footer_nav_2" defaultValue="A Empresa">{(text, styles) => <span style={styles}>{text}</span>}</EditableField>
            </Link></li>
            <li><Link to="/produtos" className="text-sm hover:text-white transition-colors">
              <EditableField id="footer_nav_3" defaultValue="Produtos">{(text, styles) => <span style={styles}>{text}</span>}</EditableField>
            </Link></li>
            <li><Link to="/projetos" className="text-sm hover:text-white transition-colors">
              <EditableField id="footer_nav_4" defaultValue="Projetos">{(text, styles) => <span style={styles}>{text}</span>}</EditableField>
            </Link></li>
            <li><Link to="/blog" className="text-sm hover:text-white transition-colors">
              <EditableField id="footer_nav_blog" defaultValue="Blog">{(text, styles) => <span style={styles}>{text}</span>}</EditableField>
            </Link></li>
            <li><Link to="/contato" className="text-sm hover:text-white transition-colors">
              <EditableField id="footer_nav_5" defaultValue="Contato">{(text, styles) => <span style={styles}>{text}</span>}</EditableField>
            </Link></li>
          </ul>
        </div>

        {/* Produtos */}
        <div>
          <EditableField id="footer_prod_title" defaultValue="Produtos">
            {(text, styles) => (
              <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4" style={{ ...styles, color: styles?.color || 'white' }}>{text}</h4>
            )}
          </EditableField>
          <ul className="space-y-3">
            {categories.slice(0, 5).map(cat => (
              <li key={cat.id}>
                <Link to="/produtos" search={{ categoria: cat.name }} hash="produtos-catalog" className="text-sm hover:text-white transition-colors">
                  {cat.name}
                </Link>
              </li>
            ))}
            {categories.length === 0 && (
              <li><span className="text-sm text-brand-footer-text/50">Carregando...</span></li>
            )}
          </ul>
        </div>

        {/* Atendimento */}
        <div>
          <EditableField id="footer_atend_title" defaultValue="Atendimento">
            {(text, styles) => (
              <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4" style={{ ...styles, color: styles?.color || 'white' }}>{text}</h4>
            )}
          </EditableField>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <EditableField id="footer_atend_tel" defaultValue="<span class='text-brand-rust'>✆</span> +55 (11) 99503-8661" type="html">
                {(html, styles) => <span style={styles} dangerouslySetInnerHTML={{ __html: html }} />}
              </EditableField>
            </li>
            <li className="flex items-center gap-2 text-xs text-brand-footer-text/80 break-words">
              <EditableField id="footer_atend_email" defaultValue="<span class='text-brand-rust'>✉</span> atendimento@moraestijolos.com.br" type="html">
                {(html, styles) => <span style={styles} dangerouslySetInnerHTML={{ __html: html }} />}
              </EditableField>
            </li>
            <li className="pt-2 text-xs text-brand-footer-text/80">
              <EditableField id="footer_atend_hor" defaultValue="Segunda a sexta a partir das 08:00">
                {(text, styles) => <span style={styles}>{text}</span>}
              </EditableField>
            </li>
          </ul>
        </div>

      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-white/10 text-center text-xs text-brand-footer-text/60">
        <EditableField id="footer_copy" defaultValue="© 2024 Moraes Tijolos Revestimentos. Todos os direitos reservados.">
          {(text, styles) => <span style={styles}>{text}</span>}
        </EditableField>
      </div>
    </footer>
  );
}
