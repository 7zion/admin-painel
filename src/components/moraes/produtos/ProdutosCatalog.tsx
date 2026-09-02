import { MessageCircle } from 'lucide-react';
import { Link, useSearch } from '@tanstack/react-router';
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../../lib/supabase';
import { productRowToApp, productCategoryRowToApp } from '../../../lib/supabase-mappers';
import { Product, ProductCategory } from '../../../types/admin';
import { EditableField } from '../../admin/EditableField';
import { useSettingsContext } from '../../../lib/settings-context';

export function ProdutosCatalog({
  serverProducts = [],
  serverCategories = [],
  defaultCategory
}: {
  serverProducts?: Product[],
  serverCategories?: ProductCategory[],
  defaultCategory?: string
}) {
  const { categoria } = useSearch({ from: '/_public/produtos' });
  // "all" é um valor explícito pro botão "Todos" — precisa ser diferente de
  // undefined pra poder sobrepor a categoria padrão configurada no admin.
  const isAllSelected = categoria === 'all' || (!categoria && !defaultCategory);
  const effectiveCategoria = isAllSelected ? undefined : (categoria || defaultCategory);
  const [products, setProducts] = useState<Product[]>(serverProducts);
  const [categories, setCategories] = useState<ProductCategory[]>(serverCategories);
  const [loading, setLoading] = useState(serverProducts.length === 0);
  const { contactSettings } = useSettingsContext();

  const globalWhatsapp = contactSettings?.whatsappNumber || '5511995038661';

  useEffect(() => {
    async function loadData() {
      try {
        const [{ data: prodRows, error: prodError }, { data: catRows, error: catError }] = await Promise.all([
          supabase.from('products').select('*'),
          supabase.from('product_categories').select('*')
        ]);
        if (prodError) throw prodError;
        if (catError) throw catError;
        setProducts((prodRows || []).map(productRowToApp) as Product[]);
        setCategories((catRows || []).map(productCategoryRowToApp) as ProductCategory[]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!effectiveCategoria) return products;
    return products.filter(p => (p.category || 'Sem Categoria').toLowerCase() === effectiveCategoria.toLowerCase());
  }, [products, effectiveCategoria]);

  if (loading) {
    return <div className="py-20 text-center text-brand-text/50">Carregando produtos...</div>;
  }

  return (
    <section className="py-16 bg-[#F9F8F6]" id="produtos-catalog">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <EditableField id="produtos_catalog_title" defaultValue="Catálogo de <em class='font-serif italic text-brand-rust'>produtos</em>" type="html">
            {(html, styles) => (
              <h2 
                className="font-serif text-3xl md:text-4xl font-bold text-brand-text mb-4"
                style={styles}
                dangerouslySetInnerHTML={{ __html: html }}
              />
            )}
          </EditableField>
          <div className="w-16 h-px bg-brand-rust mx-auto opacity-40 mb-8"></div>
          
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            <Link
              to="/produtos"
              search={{ categoria: 'all' }}
              hash="produtos-catalog"
              className={`px-4 py-2 text-[11px] md:text-xs font-semibold border rounded transition-colors ${
                isAllSelected
                  ? 'bg-brand-rust text-white border-brand-rust'
                  : 'bg-white text-brand-text/70 border-gray-200 hover:border-brand-rust hover:text-brand-rust shadow-sm'
              }`}
            >
              Todos
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to="/produtos"
                search={{ categoria: cat.name }}
                hash="produtos-catalog"
                className={`px-4 py-2 text-[11px] md:text-xs font-semibold border rounded transition-colors ${
                  !isAllSelected && effectiveCategoria === cat.name
                    ? 'bg-brand-rust text-white border-brand-rust'
                    : 'bg-white text-brand-text/70 border-gray-200 hover:border-brand-rust hover:text-brand-rust shadow-sm'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {filteredProducts.map((prod) => (
            <div key={prod.id} className="bg-white rounded overflow-hidden shadow-sm flex flex-col group border border-gray-100">
              <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                <img 
                  src={prod.imageUrl} 
                  alt={prod.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded text-brand-text">
                  {prod.tag || prod.category}
                </div>
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-4 gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-brand-text leading-tight mb-0.5">{prod.name}</h4>
                    {prod.tamanho && <span className="text-[10px] text-brand-text/60">{prod.tamanho}</span>}
                  </div>
                  <span className="text-[10px] font-bold text-brand-text/50 bg-gray-50 px-1.5 py-0.5 rounded flex-shrink-0">{prod.unidade || 'm²'}</span>
                </div>
                
                <div className="mt-auto flex items-center justify-between gap-2">
                  <Link to="/produto/$id" params={{ id: prod.id }} className="flex-1 text-center border border-gray-200 hover:border-brand-rust text-brand-text text-[11px] font-semibold py-2 rounded transition-colors">
                    Ver detalhes
                  </Link>
                </div>
              </div>
            </div>
          ))}
          
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-12 text-center text-brand-text/50 text-sm">
              Nenhum produto encontrado nesta categoria.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
