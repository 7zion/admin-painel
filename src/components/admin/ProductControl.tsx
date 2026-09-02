import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { productRowToApp, productCategoryRowToApp, productToRow, categoryToRow, mergeSettings } from '../../lib/supabase-mappers';
import { uploadFileToR2, deleteFileFromR2 } from '../../lib/r2-upload';
import { MediaPickerModal } from './MediaPickerModal';
import { Product, ProductCategory } from '../../types/admin';
import Papa from 'papaparse';
import {
  Plus, Edit, Trash2, X, ShoppingBag, Upload, Image as ImageIcon, Sparkles, DollarSign, ToggleLeft, ToggleRight, Check, Loader2, ArrowRight, ChevronLeft, ChevronRight, CheckCircle2
} from 'lucide-react';

export function ProductControl() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [selectedProductCategory, setSelectedProductCategory] = useState<ProductCategory | null>(null);
  const [productCategoryName, setProductCategoryName] = useState('');
  const [productCategoryDisplayTitle, setProductCategoryDisplayTitle] = useState('');
  const [productCategoryDescription, setProductCategoryDescription] = useState('');
  const [productCategoryImageUrl, setProductCategoryImageUrl] = useState('');
  const [productCategoryShowOnHome, setProductCategoryShowOnHome] = useState(false);
  const [productCategoryHomeSortBy, setProductCategoryHomeSortBy] = useState<'name' | 'price' | 'tamanho'>('name');
  const [isUploadingProductCategoryIcon, setIsUploadingProductCategoryIcon] = useState(false);
  const [isDeletingProductCategory, setIsDeletingProductCategory] = useState<{ isOpen: boolean; category: ProductCategory | null; replacementCategoryId: string }>({ isOpen: false, category: null, replacementCategoryId: '' });

  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductsEnabled, setIsProductsEnabled] = useState(false);
  const [defaultCategoryFilter, setDefaultCategoryFilter] = useState('');
  const [isSavingDefaultCategory, setIsSavingDefaultCategory] = useState(false);
  const [toggling, setToggling] = useState(false);

  // Pagination states
  const [currentTab, setCurrentTab] = useState<'published' | 'drafts'>('published');
  const [currentPage, setCurrentPage] = useState(1);

  const handleTabChange = (tab: 'published' | 'drafts') => {
    setCurrentTab(tab);
    setCurrentPage(1);
    setSelectedIds(new Set());
  };

  const itemsPerPage = 10;

  // Filter states (busca por nome + categoria)
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Import/Export states
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [stock, setStock] = useState<number | ''>(10);
  
  // Customization fields
  const [itemType, setItemType] = useState<'product' | 'service'>('product');
  const [ctaType, setCtaType] = useState<'whatsapp' | 'form' | 'custom_link'>('whatsapp');
  const [ctaValue, setCtaValue] = useState('');
  
  // Customization - Especificações Equipamento
  const [tag, setTag] = useState('');
  const [tamanho, setTamanho] = useState('');
  const [unidade, setUnidade] = useState('');
  const [aplicacao, setAplicacao] = useState('');
  const [estilo, setEstilo] = useState('');
  const [acabamento, setAcabamento] = useState('');
  const [colecao, setColecao] = useState('');
  const [tonalidade, setTonalidade] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isProductsFeatured, setIsProductsFeatured] = useState(false);
  const [published, setPublished] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Drag & drop or upload state
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // SEO States
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [focusKeyword, setFocusKeyword] = useState('');
  const [isSeoExpanded, setIsSeoExpanded] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (error) {
        console.error('Error listening to products:', error);
        setLoading(false);
        return;
      }
      const fetchedProducts: Product[] = (data || [])
        .map(productRowToApp)
        .filter((item: any) => {
          const isLegacyService = ['Consultoria', 'Mentoria', 'Serviço Mensal'].includes(item.category);
          return item.itemType === 'product' || (!item.itemType && !isLegacyService);
        }) as Product[];
      fetchedProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setProducts(fetchedProducts);
      setLoading(false);
    };

    const loadCategories = async () => {
      const { data, error } = await supabase.from('product_categories').select('*');
      if (error) {
        console.error('Error listening to categories:', error);
        return;
      }
      const fetchedCategories = (data || []).map(productCategoryRowToApp) as ProductCategory[];
      fetchedCategories.sort((a, b) => a.name.localeCompare(b.name));
      if (fetchedCategories.length === 0) {
        const defaultCategories = ['Tijolinhos', 'Cimentícios', 'Pedras e Fachadas', 'Pisos Rústicos'];
        for (const name of defaultCategories) {
          const id = name.toLowerCase().replace(/ /g, '-');
          await supabase.from('product_categories').upsert({ id, name, created_at: new Date().toISOString() });
        }
      } else {
        setCategories(fetchedCategories);
        if (!category && fetchedCategories.length > 0) {
          setCategory(fetchedCategories[0].name);
        }
      }
    };

    const loadModuleSettings = async () => {
      const { data } = await supabase.from('settings').select('data').eq('id', 'productsModule').maybeSingle();
      setIsProductsEnabled(data?.data?.isEnabled === true);
      setDefaultCategoryFilter(data?.data?.defaultCategory || '');
    };

    loadProducts();
    loadCategories();
    loadModuleSettings();

    const channel = supabase
      .channel('product-control-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, loadProducts)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_categories' }, loadCategories)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, loadModuleSettings)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Pagination logic
  const filteredProducts = products.filter(p => {
    const matchesTab = currentTab === 'published' ? p.published !== false : p.published === false;
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesSearch = p.name.toLowerCase().startsWith(searchQuery.trim().toLowerCase());
    return matchesTab && matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSaveProductCategory = async () => {
    if (!productCategoryName.trim()) return;
    const id = selectedProductCategory ? selectedProductCategory.id : productCategoryName.toLowerCase().replace(/ /g, '-');
    try {
      const { error } = await supabase.from('product_categories').upsert({
        id,
        name: productCategoryName,
        display_title: productCategoryDisplayTitle,
        description: productCategoryDescription,
        image_url: productCategoryImageUrl,
        show_on_home: productCategoryShowOnHome,
        home_sort_by: productCategoryHomeSortBy,
        created_at: selectedProductCategory ? selectedProductCategory.createdAt : new Date().toISOString()
      });
      if (error) throw error;
      setProductCategoryName('');
      setProductCategoryDisplayTitle('');
      setProductCategoryDescription('');
      setProductCategoryImageUrl('');
      setProductCategoryShowOnHome(false);
      setProductCategoryHomeSortBy('name');
      setSelectedProductCategory(null);
    } catch (err) {
      console.error('Error saving product category:', err);
    }
  };

  const handleProductCategoryImageUpload = async (file: File) => {
    setIsUploadingProductCategoryIcon(true);
    try {
      const url = await uploadFileToR2(file, "categories");
      setProductCategoryImageUrl(url);
    } catch (err: any) {
      console.error('PRODUCT CATEGORY IMAGE UPLOAD ERROR:', err);
      alert(err?.message || 'Erro ao enviar imagem da categoria de produto.');
    } finally {
      setIsUploadingProductCategoryIcon(false);
    }
  };

  const executeDeleteProductCategory = async () => {
    if (!isDeletingProductCategory.category || !isDeletingProductCategory.replacementCategoryId) return;
    
    try {
      const replacementCategory = categories.find(c => c.id === isDeletingProductCategory.replacementCategoryId);
      if (!replacementCategory) return;

      const affectedProducts = products.filter(p => p.category === isDeletingProductCategory.category?.name);
      for (const product of affectedProducts) {
        const { error } = await supabase.from('products').update({ category: replacementCategory.name }).eq('id', product.id);
        if (error) throw error;
      }

      const { error: delError } = await supabase.from('product_categories').delete().eq('id', isDeletingProductCategory.category.id);
      if (delError) throw delError;

      setIsDeletingProductCategory({ isOpen: false, category: null, replacementCategoryId: '' });
    } catch (err) {
      console.error('Error deleting product category:', err);
    }
  };

  const toggleProductsVisibility = async () => {
    setToggling(true);
    try {
      await mergeSettings('productsModule', { isEnabled: !isProductsEnabled });
    } catch (err) {
      console.error('Failed to toggle products module', err);
    } finally {
      setToggling(false);
    }
  };

  const handleChangeDefaultCategory = async (value: string) => {
    setDefaultCategoryFilter(value);
    setIsSavingDefaultCategory(true);
    try {
      await mergeSettings('productsModule', { defaultCategory: value });
    } catch (err) {
      console.error('Failed to save default category filter', err);
    } finally {
      setIsSavingDefaultCategory(false);
    }
  };

  const handleExportTemplate = () => {
    const templateData = [
      {
        name: 'Produto Exemplo',
        description: 'Descrição detalhada do produto',
        price: 99.90,
        category: 'Tijolinhos',
        stock: 10,
        itemType: 'product',
        tag: 'Destaque',
        tamanho: '20x20',
        unidade: 'm2',
        aplicacao: 'Parede',
        estilo: 'Rústico',
        colecao: 'Terra',
        acabamento: 'Fosco',
        tonalidade: 'V3'
      }
    ];

    const csv = Papa.unparse(templateData, { delimiter: ';' });
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'planilha_produtos_modelo.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    
    // Read file text to clean up empty rows at the top (like ",,,,,")
    const text = await file.text();
    const cleanedText = text.replace(/^[\s,;]+[\r\n]+/g, '');

    Papa.parse(cleanedText, {
      header: true,
      skipEmptyLines: true,
      
      transformHeader: (header) => header.trim().replace(/^\uFEFF/, ''),
      complete: async (results) => {
        try {
          let successCount = 0;
          for (const row of results.data as any[]) {
            if (!row.name) continue; // Skip rows without name
            
            const newProduct = {
              id: 'prod_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
              name: String(row.name || '').trim(),
              description: row.description || '',
              price: parseFloat(String(row.price || '0').replace(/[R$\s]/g, '').replace(',', '.')) || 0,
              category: row.category || 'Geral',
              stock: parseInt(row.stock) || 10,
              itemType: row.itemType === 'service' ? 'service' : 'product',
              ctaType: 'whatsapp',
              tag: row.tag || '',
              tamanho: row.tamanho || '',
              unidade: row.unidade || '',
              aplicacao: row.aplicacao || '',
              estilo: row.estilo || '',
              colecao: row.colecao || '',
              acabamento: row.acabamento || '',
              tonalidade: row.tonalidade || '',
              imageUrl: '',
              galleryUrls: [],
              published: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            const { error } = await supabase.from('products').insert(productToRow(newProduct));
            if (error) throw error;
            successCount++;
          }
          
          alert(`Importação concluída! ${successCount} produtos importados com sucesso.`);
        } catch (error) {
          console.error("Error importing products:", error);
          alert("Ocorreu um erro ao importar os produtos: " + ((error as any).message || error));
        } finally {
          setIsImporting(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      },
      error: (error: any) => {
        console.error("PapaParse error:", error);
        alert("Erro ao ler o arquivo CSV.");
        setIsImporting(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    });
  };

  const openCreateForm = () => {    setSelectedProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setCategory('Tijolinhos');
    setImageUrl('');
    setGalleryUrls([]);
    setStock(10);
    setItemType('product');
    setCtaType('whatsapp');
    setCtaValue('');
    setSeoTitle('');
    setSeoDescription('');
    setFocusKeyword('');
    setIsSeoExpanded(false);
    
    setTag('');
    setTamanho('');
    setUnidade('');
    setAplicacao('');
    setEstilo('');
    setAcabamento('');
    setColecao('');
    setTonalidade('');
    setIsFeatured(false);
    setIsProductsFeatured(false);
    setPublished(true);
    
    setIsFormOpen(true);
  };

  const openEditForm = (product: Product) => {
    setSelectedProduct(product);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price);
    setCategory(product.category);
    setImageUrl(product.imageUrl);
    setGalleryUrls(product.galleryUrls || []);
    setStock(product.stock);
    setItemType(product.itemType || 'product');
    setCtaType(product.ctaType || 'whatsapp');
    setCtaValue(product.ctaValue || '');
    setSeoTitle(product.seoTitle || '');
    setSeoDescription(product.seoDescription || '');
    setFocusKeyword(product.focusKeyword || '');
    setIsSeoExpanded(false);

    setTag(product.tag || '');
    setTamanho(product.tamanho || '');
    setUnidade(product.unidade || '');
    setAplicacao(product.aplicacao || '');
    setEstilo(product.estilo || '');
    setAcabamento(product.acabamento || '');
    setColecao(product.colecao || '');
    setTonalidade(product.tonalidade || '');
    setIsFeatured(product.isFeatured || false);
    setIsProductsFeatured(product.isProductsFeatured || false);
    setPublished(product.published !== false);
    
    setIsFormOpen(true);
  };

  const handleImageUpload = async (files: FileList | File[]) => {
    setIsUploading(true);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadFileToR2(files[i], "products");
        newUrls.push(url);
      }
      if (!imageUrl && newUrls.length > 0) {
        setImageUrl(newUrls[0]);
        if (newUrls.length > 1) {
          setGalleryUrls(prev => [...prev, ...newUrls.slice(1)]);
        }
      } else {
        setGalleryUrls(prev => [...prev, ...newUrls]);
      }
    } catch (err: any) {
      console.error('SERVER UPLOAD ERROR:', err);
      alert(err?.message || 'Erro ao conectar ao Cloudflare R2. Falha no envio.');
    } finally {
      setIsUploading(false);
    }
  };

  const addImageUrl = (url: string) => {
    if (!imageUrl) setImageUrl(url);
    else setGalleryUrls(prev => [...prev, url]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleImageUpload(e.target.files);
    }
  };

  
  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedProducts.map(p => p.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkAction = async (action: 'publish' | 'draft' | 'delete') => {
    if (selectedIds.size === 0) return;
    if (action === 'delete') {
      if (!confirm(`Tem certeza que deseja excluir ${selectedIds.size} itens?`)) return;
    } else {
      if (!confirm(`Tem certeza que deseja marcar ${selectedIds.size} itens como ${action === 'publish' ? 'publicados' : 'rascunhos'}?`)) return;
    }

    try {
      const urlsToDelete: string[] = [];
      for (const id of selectedIds) {
        if (action === 'delete') {
          const product = products.find(p => p.id === id);
          if (product) urlsToDelete.push(...[product.imageUrl, ...(product.galleryUrls || [])].filter(Boolean));
          const { error } = await supabase.from('products').delete().eq('id', id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('products').update({ published: action === 'publish' }).eq('id', id);
          if (error) throw error;
        }
      }
      if (urlsToDelete.length > 0) {
        await Promise.allSettled(urlsToDelete.map((url) => deleteFileFromR2(url)));
      }
      setSelectedIds(new Set());
    } catch (err) {
      console.error('Error on bulk action:', err);
      alert('Ocorreu um erro.');
    }
  };

  const handleSubmit = async (e: React.FormEvent, options?: { keepOpen?: boolean }) => {
    e.preventDefault();
    if (!name || stock === '') {
      alert('Por favor, preencha o nome e o estoque.');
      return;
    }

    const finalCategory = category || 'Sem Categoria';
    const pathCollection = 'products';
    const id = selectedProduct ? selectedProduct.id : 'prod_' + Date.now();
    const now = new Date().toISOString();
    
    const productPayload: Product = {
      id,
      name,
      description,
      price: price === '' ? 0 : Number(price),
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=800&q=80',
      galleryUrls,
      category: finalCategory,
      stock: Number(stock),
      itemType,
      ctaType,
      ctaValue,
      tag,
      tamanho,
      unidade,
      aplicacao,
      estilo,
      acabamento,
      colecao,
      tonalidade,
      isFeatured,
      isProductsFeatured,
      seoTitle,
      seoDescription,
      focusKeyword,
      createdAt: selectedProduct ? selectedProduct.createdAt : now,
      updatedAt: now,
    };

    setIsSaving(true);
    try {
      const { error } = await supabase.from(pathCollection).upsert(productToRow(productPayload));
      if (error) throw error;
      if (options?.keepOpen) {
        setSelectedProduct(productPayload);
        setSaveFeedback('Alterações salvas.');
        setTimeout(() => setSaveFeedback(null), 2500);
      } else {
        setIsFormOpen(false);
        setSelectedProduct(null);
      }
    } catch (err) {
      console.error(`Error writing ${pathCollection}/${id}:`, err);
      alert('Erro ao salvar produto: ' + (err as any)?.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('Tem certeza de que deseja excluir este produto?')) {
      const pathCollection = 'products';
      const product = products.find(p => p.id === productId);
      try {
        const { error } = await supabase.from(pathCollection).delete().eq('id', productId);
        if (error) throw error;

        // Remove também as imagens do produto no Cloudflare R2 (capa + galeria).
        if (product) {
          const urlsToDelete = [product.imageUrl, ...(product.galleryUrls || [])].filter(Boolean);
          await Promise.allSettled(urlsToDelete.map((url) => deleteFileFromR2(url)));
        }
      } catch (err) {
        console.error(`Error deleting ${pathCollection}/${productId}:`, err);
        alert('Erro ao excluir produto: ' + (err as any)?.message);
      }
    }
  };

  return (
    <div className="space-y-6" id="product-control-root">
      <div className="flex justify-between items-center bg-[#0b0b0b] p-6 rounded-2xl border border-white/5" id="product-header-section">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Gerenciador de Produtos</h1>
          <p className="text-gray-400 text-sm mt-1">Cadastre e gerencie os infoprodutos, serviços ou mentorias.</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <label htmlFor="default-category-filter" className="text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
              Categoria padrão em /produtos
            </label>
            <select
              id="default-category-filter"
              value={defaultCategoryFilter}
              onChange={(e) => handleChangeDefaultCategory(e.target.value)}
              disabled={isSavingDefaultCategory}
              className="bg-[#121212] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <option value="">Todos (padrão)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="w-px h-8 bg-white/10 hidden sm:block"></div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-semibold transition-colors ${isProductsEnabled ? 'text-emerald-400' : 'text-gray-500'}`}>
              {isProductsEnabled ? 'Visível no Site' : 'Oculto no Site'}
            </span>
            <button
              onClick={toggleProductsVisibility}
              disabled={toggling}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer disabled:opacity-50 ${isProductsEnabled ? 'bg-emerald-500' : 'bg-white/10'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isProductsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="w-px h-8 bg-white/10 hidden sm:block"></div>

          <div className="flex gap-2">
            <button
              onClick={handleExportTemplate}
              className="bg-white/5 hover:bg-white/10 text-white font-medium px-4 py-2.5 rounded-xl border border-white/10 flex items-center gap-2 transition-all hover:scale-[1.02] text-sm cursor-pointer"
            >
              Exportar Modelo
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="bg-white/5 hover:bg-white/10 text-white font-medium px-4 py-2.5 rounded-xl border border-white/10 flex items-center gap-2 transition-all hover:scale-[1.02] text-sm cursor-pointer disabled:opacity-50"
            >
              {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} 
              {isImporting ? 'Importando...' : 'Importar CSV'}
            </button>
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImportCSV} 
            />
          </div>

          <div className="w-px h-8 bg-white/10 hidden sm:block"></div>

          <button
            onClick={() => setIsCategoryManagerOpen(true)}
            className="bg-white/5 hover:bg-white/10 text-white font-medium px-4 py-2.5 rounded-xl border border-white/10 flex items-center gap-2 transition-all hover:scale-[1.02] text-sm cursor-pointer"
          >
            Gerenciar Categorias
          </button>
          <button
            onClick={openCreateForm}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl border border-indigo-400/20 shadow-[0_0_20px_rgba(99,102,241,0.2)] flex items-center gap-2 transition-all hover:scale-[1.02] text-sm cursor-pointer"
            id="btn-create-product"
          >
            <Plus className="w-4 h-4" /> Novo Produto
          </button>
        </div>
      </div>

      
      
      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-white/5 mb-6">
        <button
          onClick={() => handleTabChange('published')}
          className={`pb-3 text-sm font-medium transition-colors relative ${currentTab === 'published' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
        >
          Publicados
          {currentTab === 'published' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-t-full"></span>
          )}
        </button>
        <button
          onClick={() => handleTabChange('drafts')}
          className={`pb-3 text-sm font-medium transition-colors relative ${currentTab === 'drafts' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
        >
          Rascunhos
          {currentTab === 'drafts' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-t-full"></span>
          )}
        </button>
      </div>

      {/* Busca por nome + Filtro por categoria */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6" id="product-filters">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar por nome..."
            className="w-full bg-[#0b0b0b] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-600"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-[#0b0b0b] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:w-56"
        >
          <option value="all">Todas as categorias</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
      </div>

      {selectedIds.size > 0 && (
        <div className="bg-[#121212] border border-white/10 rounded-2xl p-4 mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-300">
            <span className="font-bold text-white">{selectedIds.size}</span> itens selecionados
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkAction('publish')}
              className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-medium px-3 py-1.5 rounded-lg transition-colors border border-emerald-500/20"
            >
              Publicar
            </button>
            <button
              onClick={() => handleBulkAction('draft')}
              className="text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-medium px-3 py-1.5 rounded-lg transition-colors border border-amber-500/20"
            >
              Rascunho
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium px-3 py-1.5 rounded-lg transition-colors border border-red-500/20 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Excluir
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500" id="product-loading">Carregando produtos...</div>
      ) : products.length === 0 ? (
        <div className="bg-[#0b0b0b] border border-white/5 rounded-2xl p-12 text-center space-y-4" id="product-empty-state">
          <ShoppingBag className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-lg font-semibold text-white">Nenhum produto cadastrado</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Cadastre mentorias, e-books, consultorias de tráfego pago ou planos mensais para disponibilizar no site.
          </p>
          <button
            onClick={openCreateForm}
            className="text-sm bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 font-bold px-4 py-2 border border-indigo-500/30 rounded-xl transition-all cursor-pointer"
          >
            Cadastrar Primeiro Post
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-[#0b0b0b] border border-white/5 rounded-2xl p-12 text-center space-y-2" id="product-empty-filter-state">
          <ShoppingBag className="w-10 h-10 text-gray-600 mx-auto" />
          <h3 className="text-base font-semibold text-white">Nenhum produto encontrado</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">Ajuste a busca ou a categoria selecionada.</p>
        </div>
      ) : (
        <div className="bg-[#0b0b0b] border border-white/5 rounded-2xl overflow-hidden" id="products-table-wrapper">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" id="products-table">
              <thead>
                <tr className="border-b border-white/5 bg-[#121212]/50 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-4 px-6 w-12"><input type="checkbox" className="rounded bg-black/50 border-white/10" checked={selectedIds.size > 0 && selectedIds.size === paginatedProducts.length} onChange={toggleSelectAll} /></th>
                  <th className="py-4 px-6">Imagem & Nome</th>
                  <th className="py-4 px-6">Categoria</th>
                  <th className="py-4 px-6">Preço</th>
                  <th className="py-4 px-6">Vagas/Estoque</th>
                  <th className="py-4 px-6">Cadastrado em</th>
                  <th className="py-4 px-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                {paginatedProducts.map((product) => (
                  <tr key={product.id} className={`hover:bg-white/[0.01] transition-colors ${selectedIds.has(product.id) ? "bg-white/[0.02]" : ""}`} id={`product-row-${product.id}`}>
                    <td className="py-4 px-6 flex items-center gap-4">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-12 h-12 object-cover rounded-lg border border-white/10 bg-black/50" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="max-w-[280px]">
                        <p className="font-semibold text-white">{product.name}</p>
                        <p className="text-xs text-gray-400 line-clamp-1">{product.description}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6"><input type="checkbox" className="rounded bg-black/50 border-white/10" checked={selectedIds.has(product.id)} onChange={() => toggleSelect(product.id)} /></td>
                  <td className="py-4 px-6">
                      <span className="bg-purple-500/10 text-purple-400 border border-purple-500/25 text-xs px-2.5 py-1 rounded-full font-medium">
                        {product.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-white font-mono">
                      {product.price > 0 ? `R$ ${product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Sob Consulta'}
                    </td>
                    <td className="py-4 px-6">
                      {product.stock > 0 ? (
                        <span className="text-emerald-400 font-medium font-mono text-xs">
                          {product.stock} unidades
                        </span>
                      ) : (
                        <span className="text-red-400 font-medium text-xs">
                          Esgotado
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-400">
                      {new Date(product.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => openEditForm(product)}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white border border-white/15 transition-all inline-flex items-center cursor-pointer"
                        title="Editar produto"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 border border-red-500/20 transition-all inline-flex items-center cursor-pointer"
                        title="Excluir produto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-white/5 flex items-center justify-between bg-[#121212]/30">
              <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                Mostrando <span className="text-white">{Math.min(products.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(products.length, currentPage * itemsPerPage)}</span> de <span className="text-white">{products.length}</span> produtos
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        currentPage === i + 1 
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                          : 'bg-white/5 text-gray-500 hover:bg-white/10'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Centered Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" id="product-form-modal">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsFormOpen(false)} />
          
          <div className="relative w-full max-w-2xl bg-[#0c0c0c] border border-white/10 rounded-2xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden" id="product-modal-container">
            <div className="flex justify-between items-center border-b border-white/5 p-6 bg-[#0c0c0c] z-10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="text-indigo-400 w-5 h-5" />
                {selectedProduct ? 'Editar Produto' : 'Novo Produto/Serviço'}
              </h2>
              <button 
                onClick={() => setIsFormOpen(false)} 
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 border border-white/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form id="product-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {/* Product Name */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Nome do Produto / Serviço</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Consultoria Exclusiva de Tráfego Pago"
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* Price and Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" /> Preço (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value !== '' ? Number(e.target.value) : '')}
                    placeholder="Deixe em branco p/ ocultar ou R$ 0,00"
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Vagas / Estoque</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value !== '' ? Number(e.target.value) : '')}
                    placeholder="10"
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

                              <div className="space-y-2 flex items-center justify-between bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5">
              <div className="space-y-2 flex items-center justify-between bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 mb-4">
                <label className="text-sm font-semibold text-white block">Destacar na Página de Produtos</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={isProductsFeatured} onChange={(e) => setIsProductsFeatured(e.target.checked)} />
                  <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
                  <label className="text-sm font-semibold text-white block">Destacar na Home</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
                              <div className="space-y-2 flex items-center justify-between bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 mt-4">
                  <label className="text-sm font-semibold text-white block">Produto Ativo (Publicado)</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={published} onChange={(e) => setPublished(e.target.checked)} />
                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                  </label>
                </div>
              {/* Category */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Categoria</label>
                <div className="flex gap-2">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Item Type & Call to Action configuration */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Tag/Subtítulo (Ex: Brick)</label>
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="Ex: Brick"
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Tamanho (Ex: 7 x 23 cm)</label>
                  <input
                    type="text"
                    value={tamanho}
                    onChange={(e) => setTamanho(e.target.value)}
                    placeholder="Ex: 7 x 23 cm"
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Unidade</label>
                  <input
                    type="text"
                    value={unidade}
                    onChange={(e) => setUnidade(e.target.value)}
                    placeholder="Ex: m²"
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Aplicação</label>
                  <input
                    type="text"
                    value={aplicacao}
                    onChange={(e) => setAplicacao(e.target.value)}
                    placeholder="Ex: Paredes internas"
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Estilo</label>
                  <input
                    type="text"
                    value={estilo}
                    onChange={(e) => setEstilo(e.target.value)}
                    placeholder="Ex: Rústico contemporâneo"
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Acabamento</label>
                  <input
                    type="text"
                    value={acabamento}
                    onChange={(e) => setAcabamento(e.target.value)}
                    placeholder="Ex: Rústico"
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Coleção</label>
                  <input
                    type="text"
                    value={colecao}
                    onChange={(e) => setColecao(e.target.value)}
                    placeholder="Ex: Brick"
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Tonalidade</label>
                  <input
                    type="text"
                    value={tonalidade}
                    onChange={(e) => setTonalidade(e.target.value)}
                    placeholder="Ex: Fumê"
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Item Type & Call to Action configuration */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Tipo de Botão (CTA)</label>
                  <select
                    value={ctaType}
                    onChange={(e) => setCtaType(e.target.value as 'whatsapp' | 'form' | 'custom_link')}
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                  >
                    <option value="whatsapp">Link Whatsapp</option>
                    <option value="custom_link">Link Customizado</option>
                  </select>
                </div>
                {ctaType === 'custom_link' && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">URL do Link Customizado</label>
                    <input
                      type="url"
                      value={ctaValue}
                      onChange={(e) => setCtaValue(e.target.value)}
                      placeholder="https://pay.stripe.com/..."
                      className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Descrição Completa (Aceita Formatação Markdown)</label>
                <textarea
                  rows={8}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="## O que está incluso?&#10;- Mentoria 1 a 1&#10;- Suporte via WhatsApp&#10;- Acesso Vitalício&#10;&#10;Descreva todos os detalhes e diferenciais usando formatação Markdown..."
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                />
              </div>

              {/* Image Input and Upload */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Imagem ou Logotipo do Produto</label>
                
                {/* Drag and Drop Container */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-4 text-center transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                    dragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 hover:border-white/20 bg-[#121212]'
                  }`}
                >
                  <label className="cursor-pointer flex flex-col items-center gap-2 w-full h-full">
                    <Upload className={`w-8 h-8 text-indigo-400 ${isUploading ? 'animate-bounce' : ''}`} />
                    <span className="text-xs font-medium text-gray-300">
                      {isUploading ? 'Enviando arquivo para o Cloudflare R2...' : 'Arrastar arquivo de mídia ou clique para selecionar'}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {isUploading ? 'Processando upload criptografado...' : 'Suporta imagens e vídeos de alta definição'}
                    </span>
                    <input 
                      type="file" 
                      accept="image/*,video/*"
                      multiple
                      disabled={isUploading}
                      onChange={handleFileInputChange} 
                      className="hidden" 
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMediaPickerOpen(true)}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4" /> Selecionar do R2 (mídias já enviadas)
                </button>

                <div className="text-center text-xs text-gray-500">ou insira uma URL direta para adicionar à galeria</div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    id="new-image-url"
                    placeholder="Copiar URL da imagem do produto"
                    className="flex-1 bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = (e.target as HTMLInputElement).value;
                        if (val) {
                          addImageUrl(val);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('new-image-url') as HTMLInputElement;
                      if (input && input.value) {
                        addImageUrl(input.value);
                        input.value = '';
                      }
                    }}
                    className="bg-white/10 hover:bg-white/20 text-white rounded-xl px-4 py-2.5 text-xs font-medium transition-colors"
                  >
                    Adicionar
                  </button>
                </div>

                {/* Gallery Display */}
                {(imageUrl || galleryUrls.length > 0) && (
                  <div className="mt-4">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Galeria de Imagens</label>
                    <div className="grid grid-cols-3 gap-3">
                      {imageUrl && (
                        <div className="relative rounded-xl overflow-hidden border-2 border-indigo-500 aspect-square bg-black group">
                          <img 
                            src={imageUrl} 
                            alt="Capa do produto" 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                            <span className="text-[10px] font-bold bg-indigo-500 text-white px-2 py-1 rounded-full self-start">Principal</span>
                            <button
                              type="button"
                              onClick={() => {
                                if (galleryUrls.length > 0) {
                                  setImageUrl(galleryUrls[0]);
                                  setGalleryUrls(prev => prev.slice(1));
                                } else {
                                  setImageUrl('');
                                }
                              }}
                              className="self-end p-1.5 bg-red-500/80 hover:bg-red-500 rounded-full text-white cursor-pointer"
                              title="Remover"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <span className="absolute top-2 left-2 text-[10px] font-bold bg-indigo-500 text-white px-2 py-1 rounded-full md:hidden">Principal</span>
                        </div>
                      )}
                      
                      {galleryUrls.map((url, idx) => (
                        <div key={idx} className="relative rounded-xl overflow-hidden border border-white/10 aspect-square bg-black group">
                          <img 
                            src={url} 
                            alt={`Galeria ${idx + 1}`} 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                            <button
                              type="button"
                              onClick={() => {
                                setGalleryUrls(prev => prev.filter((_, i) => i !== idx));
                                setGalleryUrls(prev => [...prev, imageUrl]);
                                setImageUrl(url);
                              }}
                              className="self-start text-[10px] font-bold bg-white/20 hover:bg-white/40 text-white px-2 py-1 rounded-full cursor-pointer"
                              title="Tornar Principal"
                            >
                              Tornar Principal
                            </button>
                            <button
                              type="button"
                              onClick={() => setGalleryUrls(prev => prev.filter((_, i) => i !== idx))}
                              className="self-end p-1.5 bg-red-500/80 hover:bg-red-500 rounded-full text-white cursor-pointer"
                              title="Remover"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* SEO Section Toggle */}
              <div className="pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsSeoExpanded(!isSeoExpanded)}
                  className="w-full flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                    <div>
                      <span className="text-sm font-bold text-white block uppercase tracking-wider group-hover:text-purple-300 transition-colors">Otimização de SEO (Buscas)</span>
                      <span className="text-xs text-gray-500 mt-0.5">Defina Título SEO, Meta Description e Keyword.</span>
                    </div>
                  </div>
                  <span className={`text-xs text-purple-400 font-bold px-2 py-1 rounded bg-purple-500/10 border border-purple-500/20 ${isSeoExpanded ? 'hidden' : ''}`}>
                    Expandir
                  </span>
                </button>

                {isSeoExpanded && (
                  <div className="space-y-4 mt-6 p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Meta Título (SEO Title)</label>
                      <input
                        type="text"
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        placeholder="Ex: Consultoria de Trafego Pago Especializada (Opcional)"
                        className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                        maxLength={60}
                      />
                      <div className="text-[10px] text-gray-500 text-right">{seoTitle.length}/60</div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Meta Description</label>
                      <textarea
                        rows={2}
                        value={seoDescription}
                        onChange={(e) => setSeoDescription(e.target.value)}
                        placeholder="Ex: Contrate a consultoria de tráfego pago ideal..."
                        className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                        maxLength={160}
                      />
                      <div className="text-[10px] text-gray-500 text-right">{seoDescription.length}/160</div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Palavra-Chave em Foco</label>
                      <input
                        type="text"
                        value={focusKeyword}
                        onChange={(e) => setFocusKeyword(e.target.value)}
                        placeholder="Ex: consultoria trafego bh"
                        className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </form>

            {/* Sticky Modal Footer */}
            <div className="flex flex-col gap-2 p-6 border-t border-white/5 bg-[#0c0c0c] z-10">
              {saveFeedback && (
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1 self-end">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {saveFeedback}
                </span>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 font-medium py-3 px-4 rounded-xl border border-white/5 text-sm transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={(e) => handleSubmit(e, { keepOpen: true })}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 font-medium py-3 px-4 rounded-xl border border-white/10 text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Salvando...' : 'Salvar e continuar editando'}
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={(e) => handleSubmit(e)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 px-4 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.2)] text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Salvando...' : selectedProduct ? 'Salvar e sair' : 'Criar e sair'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gerenciador de Categorias Modal */}
      {isCategoryManagerOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#0f0f0f] border border-white/10 w-full max-w-4xl rounded-2xl flex flex-col my-8">
            <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0f0f0f] z-10 rounded-t-2xl">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Gerenciar Categorias</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Adicione, edite ou exclua categorias de produtos do seu catálogo.
                </p>
              </div>
              <button 
                onClick={() => {
                  setIsCategoryManagerOpen(false);
                  setIsDeletingProductCategory({ isOpen: false, category: null, replacementCategoryId: '' });
                  setProductCategoryName('');
                  setSelectedProductCategory(null);
                }}
                className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {!isDeletingProductCategory.isOpen ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Formulário de Categoria */}
                  <div className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/10 h-fit">
                    <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-2">
                      {selectedProductCategory ? 'Editar Categoria' : 'Nova Categoria'}
                    </h4>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Nome Interno</label>
                      <input
                        type="text"
                        value={productCategoryName}
                        onChange={(e) => setProductCategoryName(e.target.value)}
                        placeholder="Ex: Pisos"
                        className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Título de Exibição (Opcional)</label>
                      <input
                        type="text"
                        value={productCategoryDisplayTitle}
                        onChange={(e) => setProductCategoryDisplayTitle(e.target.value)}
                        placeholder="Ex: Melhores Pisos Rústicos"
                        className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Descrição (Opcional)</label>
                      <textarea
                        value={productCategoryDescription}
                        onChange={(e) => setProductCategoryDescription(e.target.value)}
                        placeholder="Descreva esta categoria..."
                        className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium h-20 resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Imagem da Categoria</label>
                      <div className="flex gap-3 items-center">
                        <div className="w-16 h-16 rounded-xl bg-[#121212] border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {productCategoryImageUrl ? (
                            <img src={productCategoryImageUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-gray-700" />
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={productCategoryImageUrl}
                            onChange={(e) => setProductCategoryImageUrl(e.target.value)}
                            placeholder="URL da imagem..."
                            className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                          />
                          <label className="flex items-center justify-center gap-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-lg py-1.5 text-[10px] font-bold uppercase cursor-pointer transition-all">
                            {isUploadingProductCategoryIcon ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                            {isUploadingProductCategoryIcon ? 'Enviando...' : 'Fazer Upload'}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => e.target.files?.[0] && handleProductCategoryImageUpload(e.target.files[0])}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-white/[0.02] p-3 rounded-xl border border-white/5">
                      <div>
                        <p className="text-xs font-bold text-white uppercase tracking-wider">Mostrar na Home?</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Exibe uma vitrine desta categoria em "Explore nossa loja"</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setProductCategoryShowOnHome(!productCategoryShowOnHome)}
                        className={`w-11 h-6 flex-shrink-0 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${productCategoryShowOnHome ? 'bg-indigo-600' : 'bg-gray-700'}`}
                      >
                        <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${productCategoryShowOnHome ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {productCategoryShowOnHome && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Ordenar Produtos Por</label>
                        <select
                          value={productCategoryHomeSortBy}
                          onChange={(e) => setProductCategoryHomeSortBy(e.target.value as 'name' | 'price' | 'tamanho')}
                          className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                        >
                          <option value="name">Nome (A-Z)</option>
                          <option value="price">Preço (menor primeiro)</option>
                          <option value="tamanho">Medida</option>
                        </select>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={handleSaveProductCategory}
                        disabled={!productCategoryName.trim() || isUploadingProductCategoryIcon}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2.5 text-sm font-bold uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20"
                      >
                        {selectedProductCategory ? 'Salvar Alterações' : 'Adicionar Categoria'}
                      </button>
                      {selectedProductCategory && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProductCategory(null);
                            setProductCategoryName('');
                            setProductCategoryDisplayTitle('');
                            setProductCategoryDescription('');
                            setProductCategoryImageUrl('');
                            setProductCategoryShowOnHome(false);
                            setProductCategoryHomeSortBy('name');
                          }}
                          className="bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Listagem de Categorias */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Categorias Existentes</h4>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                      {categories.map((cat) => {
                        const productCount = products.filter(p => p.category === cat.name).length;
                        return (
                          <div key={cat.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/5 overflow-hidden flex-shrink-0">
                                {cat.imageUrl ? (
                                  <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ShoppingBag className="w-4 h-4 text-gray-600" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <span className="text-sm font-bold text-white flex items-center gap-2">
                                  {cat.name}
                                  {cat.showOnHome && (
                                    <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">Na Home</span>
                                  )}
                                </span>
                                <span className="text-[10px] text-gray-500 font-mono">{productCount} produtos vinculados</span>
                              </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  setSelectedProductCategory(cat);
                                  setProductCategoryName(cat.name);
                                  setProductCategoryDisplayTitle(cat.displayTitle || '');
                                  setProductCategoryDescription(cat.description || '');
                                  setProductCategoryImageUrl(cat.imageUrl || '');
                                  setProductCategoryShowOnHome(cat.showOnHome || false);
                                  setProductCategoryHomeSortBy(cat.homeSortBy || 'name');
                                }}
                                className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors cursor-pointer"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setIsDeletingProductCategory({ isOpen: true, category: cat, replacementCategoryId: '' })}
                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                title="Excluir"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {categories.length === 0 && (
                        <div className="text-center py-12 bg-white/2 rounded-2xl border border-dashed border-white/10">
                          <p className="text-gray-500 text-sm">Nenhuma categoria cadastrada.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <p className="text-amber-200 text-sm mb-2">
                      Você está prestes a excluir a categoria <strong>{isDeletingProductCategory.category?.name}</strong>.
                    </p>
                    <p className="text-amber-200/80 text-xs">
                      {products.filter(p => p.category === isDeletingProductCategory.category?.name).length} itens estão vinculados a ela atualmente. Se quiser exclui-la, escolha uma nova categoria para esses itens.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Transferir itens para:</label>
                    <select
                      value={isDeletingProductCategory.replacementCategoryId}
                      onChange={(e) => setIsDeletingProductCategory(prev => ({ ...prev, replacementCategoryId: e.target.value }))}
                      className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    >
                      <option value="" disabled>Selecione uma categoria...</option>
                      {categories.filter(c => c.id !== isDeletingProductCategory.category?.id).map((cat) => (
                         <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-white/5 disabled:opacity-50">
                    <button
                      onClick={() => setIsDeletingProductCategory({ isOpen: false, category: null, replacementCategoryId: '' })}
                      className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      disabled={!isDeletingProductCategory.replacementCategoryId}
                      onClick={executeDeleteProductCategory}
                      className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest bg-red-600 hover:bg-red-500 text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex flex-row items-center gap-2"
                    >
                      <Check className="w-3.5 h-3.5" /> Considerar & Excluir
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={addImageUrl}
        defaultFolder="products/"
      />
    </div>
  );
}
