import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { productRowToApp, productCategoryRowToApp, productToRow, mergeSettings } from '../../lib/supabase-mappers';
import { uploadFileToR2 } from '../../lib/r2-upload';
import { Product, ProductCategory } from '../../types/admin';
import { 
  Plus, Edit, Trash2, X, Upload, Sparkles, DollarSign, Briefcase, Check
} from 'lucide-react';

export function ServiceControl() {
  const [services, setServices] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [selectedProductCategory, setSelectedProductCategory] = useState<ProductCategory | null>(null);
  const [productCategoryName, setProductCategoryName] = useState('');
  const [isDeletingProductCategory, setIsDeletingProductCategory] = useState<{ isOpen: boolean; category: ProductCategory | null; replacementCategoryId: string }>({ isOpen: false, category: null, replacementCategoryId: '' });

  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Product | null>(null);
  const [isServicesEnabled, setIsServicesEnabled] = useState(false);
  const [toggling, setToggling] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [stock, setStock] = useState<number | ''>(1);
  
  // Customization fields for LP structure
  const [ctaType, setCtaType] = useState<'whatsapp' | 'form' | 'custom_link'>('whatsapp');
  const [ctaValue, setCtaValue] = useState('');
  
  // Drag & drop or upload state
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // SEO States
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [focusKeyword, setFocusKeyword] = useState('');
  const [isSeoExpanded, setIsSeoExpanded] = useState(false);

  useEffect(() => {
    const loadServices = async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (error) {
        console.error('Error listening to services:', error);
        setLoading(false);
        return;
      }
      const fetchedServices: Product[] = (data || [])
        .map(productRowToApp)
        .filter((item: any) => {
          const isLegacyService = ['Consultoria', 'Mentoria', 'Serviço Mensal'].includes(item.category);
          return item.itemType === 'service' || (!item.itemType && isLegacyService);
        }) as Product[];
      fetchedServices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setServices(fetchedServices);
      setCurrentPage(1);
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
        const defaultCategories = ['Consultoria', 'Mentoria', 'Serviço Mensal'];
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
      const { data } = await supabase.from('settings').select('data').eq('id', 'servicesModule').maybeSingle();
      setIsServicesEnabled(data?.data?.isEnabled === true);
    };

    loadServices();
    loadCategories();
    loadModuleSettings();

    const channel = supabase
      .channel('service-control-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, loadServices)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_categories' }, loadCategories)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, loadModuleSettings)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSaveProductCategory = async () => {
    if (!productCategoryName.trim()) return;
    const id = selectedProductCategory ? selectedProductCategory.id : productCategoryName.toLowerCase().replace(/ /g, '-');
    try {
      const { error } = await supabase.from('product_categories').upsert({
        id,
        name: productCategoryName,
        created_at: selectedProductCategory ? selectedProductCategory.createdAt : new Date().toISOString()
      });
      if (error) throw error;
      setProductCategoryName('');
      setSelectedProductCategory(null);
    } catch (err) {
      console.error('Error saving product category:', err);
    }
  };

  const executeDeleteProductCategory = async () => {
    if (!isDeletingProductCategory.category || !isDeletingProductCategory.replacementCategoryId) return;

    try {
      const replacementCategory = categories.find(c => c.id === isDeletingProductCategory.replacementCategoryId);
      if (!replacementCategory) return;

      const affectedProducts = services.filter(p => p.category === isDeletingProductCategory.category?.name);
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

  const toggleServicesVisibility = async () => {
    setToggling(true);
    try {
      await mergeSettings('servicesModule', { isEnabled: !isServicesEnabled });
    } catch (err) {
      console.error('Failed to toggle services module', err);
    } finally {
      setToggling(false);
    }
  };

  const openCreateForm = () => {
    setSelectedService(null);
    setName('');
    setDescription('');
    setPrice('');
    setCategory('Consultoria');
    setImageUrl('');
    setStock(1);
    setCtaType('whatsapp');
    setCtaValue('');
    setSeoTitle('');
    setSeoDescription('');
    setFocusKeyword('');
    setIsSeoExpanded(false);
    setIsFormOpen(true);
  };

  const openEditForm = (service: Product) => {
    setSelectedService(service);
    setName(service.name);
    setDescription(service.description);
    setPrice(service.price);
    setCategory(service.category);
    setImageUrl(service.imageUrl);
    setStock(service.stock);
    setCtaType(service.ctaType || 'whatsapp');
    setCtaValue(service.ctaValue || '');
    setSeoTitle(service.seoTitle || '');
    setSeoDescription(service.seoDescription || '');
    setFocusKeyword(service.focusKeyword || '');
    setIsSeoExpanded(false);
    setIsFormOpen(true);
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const url = await uploadFileToR2(file, "services");
      setImageUrl(url);
    } catch (err: any) {
      console.error('SERVER UPLOAD ERROR:', err);
      alert(err?.message || 'Erro ao conectar ao Cloudflare R2. Falha no envio.');
    } finally {
      setIsUploading(false);
    }
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert('Por favor, preencha o nome.');
      return;
    }

    const finalCategory = category || 'Sem Categoria';
    const pathCollection = 'products';
    const id = selectedService ? selectedService.id : 'prod_' + Date.now();
    const now = new Date().toISOString();
    
    const servicePayload: Product = {
      id,
      name,
      description,
      price: price === '' ? 0 : Number(price),
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=800&q=80',
      category: finalCategory,
      stock: Number(stock),
      itemType: 'service',
      ctaType,
      ctaValue,
      seoTitle,
      seoDescription,
      focusKeyword,
      createdAt: selectedService ? selectedService.createdAt : now,
      updatedAt: now,
    };

    try {
      const { error } = await supabase.from(pathCollection).upsert(productToRow(servicePayload));
      if (error) throw error;
      setIsFormOpen(false);
      setSelectedService(null);
    } catch (err) {
      console.error(`Error writing ${pathCollection}/${id}:`, err);
      alert('Erro ao salvar serviço: ' + (err as any)?.message);
    }
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('Tem certeza de que deseja excluir este serviço?')) {
      const pathCollection = 'products';
      try {
        const { error } = await supabase.from(pathCollection).delete().eq('id', productId);
        if (error) throw error;
      } catch (err) {
        console.error(`Error deleting ${pathCollection}/${productId}:`, err);
        alert('Erro ao excluir serviço: ' + (err as any)?.message);
      }
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(services.length / itemsPerPage);
  const paginatedServices = services.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6" id="service-control-root">
      <div className="flex justify-between items-center bg-[#0b0b0b] p-6 rounded-2xl border border-white/5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Gerenciador de Serviços</h1>
          <p className="text-gray-400 text-sm mt-1">Cadastre e gerencie serviços e soluções corporativas.</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className={`text-sm font-semibold transition-colors ${isServicesEnabled ? 'text-emerald-400' : 'text-gray-500'}`}>
              {isServicesEnabled ? 'Visível no Site' : 'Oculto no Site'}
            </span>
            <button
              onClick={toggleServicesVisibility}
              disabled={toggling}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer disabled:opacity-50 ${isServicesEnabled ? 'bg-emerald-500' : 'bg-white/10'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isServicesEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
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
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2.5 rounded-xl border border-emerald-400/20 shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center gap-2 transition-all hover:scale-[1.02] text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Novo Serviço
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Carregando serviços...</div>
      ) : services.length === 0 ? (
        <div className="bg-[#0b0b0b] border border-white/5 rounded-2xl p-12 text-center space-y-4">
          <Briefcase className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-lg font-semibold text-white">Nenhum serviço cadastrado</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Cadastre as soluções focadas que sua agência ou você ofereça aos clientes.
          </p>
          <button
            onClick={openCreateForm}
            className="text-sm bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 font-bold px-4 py-2 border border-emerald-500/30 rounded-xl transition-all cursor-pointer"
          >
            Cadastrar Primeiro Serviço
          </button>
        </div>
      ) : (
        <div className="bg-[#0b0b0b] border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-[#121212]/50 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-4 px-6">Imagem & Nome</th>
                  <th className="py-4 px-6">Categoria</th>
                  <th className="py-4 px-6">Preço / Plano</th>
                  <th className="py-4 px-6">Disponibilidade</th>
                  <th className="py-4 px-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                {paginatedServices.map((service) => (
                  <tr key={service.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 px-6 flex items-center gap-4">
                      <img 
                        src={service.imageUrl} 
                        alt={service.name} 
                        className="w-12 h-12 object-cover rounded-lg border border-white/10 bg-black/50" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="max-w-[280px]">
                        <p className="font-semibold text-white">{service.name}</p>
                        <p className="text-xs text-gray-400 line-clamp-1">{service.description}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-xs px-2.5 py-1 rounded-full font-medium">
                        {service.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-white font-mono">
                      {service.price > 0 ? `R$ ${service.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Sob Demanda'}
                    </td>
                    <td className="py-4 px-6">
                      {Number(service.stock) > 0 ? (
                        <span className="text-emerald-400 font-medium text-xs">
                          Disponível
                        </span>
                      ) : (
                        <span className="text-red-400 font-medium text-xs">
                          Indisponível (Pausado)
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => openEditForm(service)}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white border border-white/15 transition-all inline-flex items-center cursor-pointer"
                        title="Editar serviço"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 border border-red-500/20 transition-all inline-flex items-center cursor-pointer"
                        title="Excluir serviço"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-white/5 bg-[#121212]/30 flex items-center justify-between">
              <p className="text-xs text-gray-500 font-medium">
                Mostrando <span className="text-white">{(currentPage - 1) * itemsPerPage + 1}</span> até <span className="text-white">{Math.min(currentPage * itemsPerPage, services.length)}</span> de <span className="text-white">{services.length}</span> serviços
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  Anterior
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        currentPage === i + 1 
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
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
                  className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  Próximo
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Centered Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsFormOpen(false)} />
          
          <div className="relative w-full max-w-2xl bg-[#0c0c0c] border border-white/10 rounded-2xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden" id="service-modal-container">
            <div className="flex justify-between items-center border-b border-white/5 p-6 bg-[#0c0c0c] z-10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="text-emerald-400 w-5 h-5" />
                {selectedService ? 'Editar Detalhes do Serviço' : 'Nova Landing Page de Serviço'}
              </h2>
              <button 
                onClick={() => setIsFormOpen(false)} 
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 border border-white/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form id="service-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {/* Product Name */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Nome do Serviço (Título Principal)</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Assessoria de Vendas B2B"
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>

              {/* Price and Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" /> Valor (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value !== '' ? Number(e.target.value) : '')}
                    placeholder="Em branco = Sob Demanda"
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Disponibilidade (Estoque ativo = visível habilitado)</label>
                  <select
                    value={Number(stock) > 0 ? 'yes' : 'no'}
                    onChange={(e) => setStock(e.target.value === 'yes' ? 1 : 0)}
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                  >
                    <option value="yes">Sim - Aceitando Clientes</option>
                    <option value="no">Não - Esgotado / Indisponível</option>
                  </select>
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Área de Atuação (Categoria)</label>
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

              {/* Call to Action configuration */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Acionamento do Cliente (CTA)</label>
                <select
                  value={ctaType}
                  onChange={(e) => setCtaType(e.target.value as 'whatsapp' | 'form' | 'custom_link')}
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                >
                  <option value="whatsapp">Falar com Especialista via WhatsApp</option>
                  <option value="custom_link">Link Externo / Checkout / Forms Próprio</option>
                </select>
              </div>

              {ctaType === 'custom_link' && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Link de Destino</label>
                  <input
                    type="url"
                    value={ctaValue}
                    onChange={(e) => setCtaValue(e.target.value)}
                    placeholder="https://sua-agenda..."
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Estrutura da Oferta (Apresentação - Suporta Markdown)</label>
                <textarea
                  rows={8}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="# Transformação Desejada&#10;&#10;Nossa consultoria de vendas trará resultados com:&#10;&#10;* Treinamento equipe&#10;* Processos comerciais&#10;&#10;**O que será entregue:** ..."
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                />
              </div>

              {/* Image Input and Upload */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Imagem de Fundo (Hero Image LP)</label>
                
                {/* Drag and Drop Container */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-4 text-center transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                    dragActive ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 hover:border-white/20 bg-[#121212]'
                  }`}
                >
                  <label className="cursor-pointer flex flex-col items-center gap-2 w-full h-full">
                    <Upload className={`w-8 h-8 text-emerald-400 ${isUploading ? 'animate-bounce' : ''}`} />
                    <span className="text-xs font-medium text-gray-300">
                      {isUploading ? 'Enviando arquivo para o servidor...' : 'Arrastar arquivo de mídia ou clique para selecionar'}
                    </span>
                    <input 
                      type="file" 
                      accept="image/*,video/*" 
                      disabled={isUploading}
                      onChange={handleFileInputChange} 
                      className="hidden" 
                    />
                  </label>
                </div>

                <div className="text-center text-xs text-gray-500">ou insira uma URL direta</div>
                
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="URL da imagem (ex: Unsplash)"
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                />

                {imageUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-white/10 aspect-video bg-black mt-2">
                    <img 
                      src={imageUrl} 
                      alt="Capa Preview" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
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
                    <Sparkles className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                    <div>
                      <span className="text-sm font-bold text-white block uppercase tracking-wider group-hover:text-emerald-300 transition-colors">Otimização (SEO Landing Page)</span>
                    </div>
                  </div>
                  <span className={`text-xs text-emerald-400 font-bold px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 ${isSeoExpanded ? 'hidden' : ''}`}>
                    Configurar
                  </span>
                </button>

                {isSeoExpanded && (
                  <div className="space-y-4 mt-6 p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Título no Google</label>
                      <input
                        type="text"
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        placeholder="Título Otimizado"
                        className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                        maxLength={60}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Meta Descrição</label>
                      <textarea
                        rows={2}
                        value={seoDescription}
                        onChange={(e) => setSeoDescription(e.target.value)}
                        placeholder="Descrição curta que aparece no Google e Redes Sociais"
                        className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                        maxLength={160}
                      />
                    </div>
                  </div>
                )}
              </div>
            </form>

            {/* Sticky Modal Footer */}
            <div className="flex gap-3 p-6 border-t border-white/5 bg-[#0c0c0c] z-10">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 font-medium py-3 px-4 rounded-xl border border-white/5 text-sm transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                form="service-form"
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 px-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] text-sm transition-all cursor-pointer"
              >
                {selectedService ? 'Salvar Landing Page' : 'Criar Nova Solução'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gerenciador de Categorias Modal */}
      {isCategoryManagerOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" id="category-manager-modal">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsCategoryManagerOpen(false)} />
          
          <div className="relative w-full max-w-4xl bg-[#0c0c0c] border border-white/10 rounded-2xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0c0c0c] z-10">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Gerenciar Categorias</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Adicione, edite ou exclua categorias de serviços.
                </p>
              </div>
              <button 
                onClick={() => {
                  setIsCategoryManagerOpen(false);
                  setIsDeletingProductCategory({ isOpen: false, category: null, replacementCategoryId: '' });
                  setProductCategoryName('');
                  setSelectedProductCategory(null);
                }}
                className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all cursor-pointer border border-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              {!isDeletingProductCategory.isOpen ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Formulário de Categoria */}
                  <div className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/10 h-fit">
                    <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-2">
                      {selectedProductCategory ? 'Editar Categoria' : 'Nova Categoria'}
                    </h4>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Nome da Categoria</label>
                      <input
                        type="text"
                        value={productCategoryName}
                        onChange={(e) => setProductCategoryName(e.target.value)}
                        placeholder="Ex: Consultoria Estratégica"
                        className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                      />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-white/5">
                      <button
                        type="button"
                        onClick={handleSaveProductCategory}
                        disabled={!productCategoryName.trim()}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-4 py-3 text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {selectedProductCategory ? 'Salvar Alterações' : 'Criar Categoria'}
                      </button>
                      {selectedProductCategory && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProductCategory(null);
                            setProductCategoryName('');
                          }}
                          className="bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl px-4 py-3 text-sm font-bold border border-white/5 transition-all cursor-pointer"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Listagem de Categorias */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center justify-between">
                      Categorias Existentes
                      <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full border border-white/5">{categories.length} cadastradas</span>
                    </h4>
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                      {categories.map((cat) => {
                        const productCount = services.filter(p => p.category === cat.name).length;
                        return (
                          <div key={cat.id} className="group flex items-center justify-between p-4 rounded-2xl bg-[#121212] border border-white/5 hover:border-emerald-500/30 transition-all">
                            <div>
                              <span className="text-sm font-bold text-white block">{cat.name}</span>
                              <span className="text-[10px] text-emerald-400/70 font-bold uppercase tracking-wider">{productCount} {productCount === 1 ? 'serviço' : 'serviços'}</span>
                            </div>
                            <div className="flex gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  setSelectedProductCategory(cat);
                                  setProductCategoryName(cat.name);
                                }}
                                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setIsDeletingProductCategory({ isOpen: true, category: cat, replacementCategoryId: '' })}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-xl transition-all cursor-pointer"
                                title="Excluir"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
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
                      {services.filter(p => p.category === isDeletingProductCategory.category?.name).length} itens estão vinculados a ela atualmente. Se quiser exclui-la, escolha uma nova categoria para esses itens.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Transferir itens para:</label>
                    <select
                      value={isDeletingProductCategory.replacementCategoryId}
                      onChange={(e) => setIsDeletingProductCategory(prev => ({ ...prev, replacementCategoryId: e.target.value }))}
                      className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
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
    </div>
  );
}
