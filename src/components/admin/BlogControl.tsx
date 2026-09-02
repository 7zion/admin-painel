import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { blogPostRowToApp, blogCategoryRowToApp, blogPostToRow } from '../../lib/supabase-mappers';
import { uploadFileToR2 } from '../../lib/r2-upload';
import { MediaPickerModal } from './MediaPickerModal';
import { BlogContentEditor } from './blog-editor/BlogRichTextEditor';
import { markdownToHtml, looksLikeHtml } from '../../lib/markdown-to-html';
import { BlogPost, BlogCategory } from '../../types/admin';
import { 
  Plus, Edit, Trash2, X, Check, Eye, EyeOff, Upload, Image as ImageIcon, Sparkles, ChevronRight, 
  ArrowLeft, Wand2, Loader2, Copy, FileText, CheckCircle2, RotateCw, ChevronLeft
} from 'lucide-react';

export function BlogControl() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Google Ads');
  const [imageUrl, setImageUrl] = useState('');
  const [author, setAuthor] = useState('Equipe 7Zion');
  const [isPublished, setIsPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [slug, setSlug] = useState('');

  // SEO form states
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [focusKeyword, setFocusKeyword] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [metaRobots, setMetaRobots] = useState('index, follow');
  const [ogImageUrl, setOgImageUrl] = useState('');
  const [local, setLocal] = useState("");
  const [tipologia, setTipologia] = useState("");
  const [aplicacoes, setAplicacoes] = useState("");
  const [produtosUtilizados, setProdutosUtilizados] = useState("");
  const [estilo, setEstilo] = useState("");
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [isSeoExpanded, setIsSeoExpanded] = useState(true); // SEO expanded by default in full-page editor
  
  // Drag & drop or upload state
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter states (busca por título + categoria)
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Gemini AI state variables
  const [aiLoadingAction, setAiLoadingAction] = useState<string | null>(null);
  const [aiResultText, setAiResultText] = useState<string | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiModalMode, setAiModalMode] = useState<'topics' | 'refine' | null>(null);
  const [refineSnippet, setRefineSnippet] = useState('');

  // Category states
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDisplayTitle, setCategoryDisplayTitle] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryImageUrl, setCategoryImageUrl] = useState('');
  const [isUploadingCategoryIcon, setIsUploadingCategoryIcon] = useState(false);
  const [isDeletingCategory, setIsDeletingCategory] = useState<{ isOpen: boolean; category: BlogCategory | null; replacementCategoryId: string }>({ isOpen: false, category: null, replacementCategoryId: '' });

  useEffect(() => {
    const loadPosts = async () => {
      const { data, error } = await supabase.from('blog_posts').select('*');
      if (error) {
        console.error('Error listening to blog posts:', error);
        setLoading(false);
        return;
      }
      const fetchedPosts = (data || []).map(blogPostRowToApp) as BlogPost[];
      fetchedPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPosts(fetchedPosts);
      setLoading(false);
    };

    const loadCategories = async () => {
      const { data, error } = await supabase.from('blog_categories').select('*');
      if (error) {
        console.error('Error listening to categories:', error);
        return;
      }
      const fetchedCategories = (data || []).map(blogCategoryRowToApp) as BlogCategory[];
      fetchedCategories.sort((a, b) => a.name.localeCompare(b.name));

      if (fetchedCategories.length === 0) {
        const defaultCategories = ['Google Ads', 'Meta Ads', 'Criação de Sites', 'Branding', 'Marketing Digital', 'Redes Sociais', 'Outros'];
        for (const name of defaultCategories) {
          const id = name.toLowerCase().replace(/ /g, '-');
          await supabase.from('blog_categories').upsert({ id, name, created_at: new Date().toISOString() });
        }
      } else {
        setCategories(fetchedCategories);
        if (!category && fetchedCategories.length > 0) {
          setCategory(fetchedCategories[0].name);
        }
      }
    };

    loadPosts();
    loadCategories();

    const channel = supabase
      .channel('blog-control-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blog_posts' }, loadPosts)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blog_categories' }, loadCategories)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const openCreateForm = () => {
    setSelectedPost(null);
    setTitle('');
    setSummary('');
    setContent('');
    setCategory(categories.length > 0 ? categories[0].name : 'Google Ads');
    setImageUrl('');
    setAuthor('Equipe 7Zion');
    setIsPublished(true);
    setIsFeatured(false);
    setSlug('');
    setSeoTitle('');
    setSeoDescription('');
    setSeoKeywords('');
    setFocusKeyword('');
    setCanonicalUrl('');
    setMetaRobots('index, follow');
    setOgImageUrl('');
    setLocal('');
    setTipologia('');
    setAplicacoes('');
    setProdutosUtilizados('');
    setEstilo('');
    setGalleryUrls([]);
    setIsSeoExpanded(true);
    setIsFormOpen(true);
    setAiResultText(null);
  };

  const openEditForm = (post: BlogPost) => {
    setSelectedPost(post);
    setTitle(post.title);
    setSummary(post.summary);
    setContent(looksLikeHtml(post.content) ? post.content : markdownToHtml(post.content));
    setCategory(post.category);
    setImageUrl(post.imageUrl);
    setAuthor(post.author);
    setIsPublished(post.isPublished);
    setIsFeatured(post.isFeatured || false);
    setSlug(post.slug || '');
    setSeoTitle(post.seoTitle || '');
    setSeoDescription(post.seoDescription || '');
    setSeoKeywords(post.seoKeywords || '');
    setFocusKeyword(post.focusKeyword || '');
    setCanonicalUrl(post.canonicalUrl || '');
    setMetaRobots(post.metaRobots || 'index, follow');
    setOgImageUrl(post.ogImageUrl || '');
    setLocal(post.local || '');
    setTipologia(post.tipologia || '');
    setAplicacoes(post.aplicacoes || '');
    setProdutosUtilizados(post.produtosUtilizados || '');
    setEstilo(post.estilo || '');
    setGalleryUrls(post.galleryUrls || []);
    setIsSeoExpanded(true);
    setIsFormOpen(true);
    setAiResultText(null);
  };

  // Filtro por categoria + busca por título (case-insensitive, prefixo)
  const filteredPosts = posts.filter((post) => {
    const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
    const matchesSearch = post.title.toLowerCase().startsWith(searchQuery.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const url = await uploadFileToR2(file, "blog");
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

  const handleSubmit = async (e: React.FormEvent, options?: { keepOpen?: boolean }) => {
    e.preventDefault();
    if (!title || !content || !summary) {
      alert('Por favor, preencha o título, resumo e conteúdo do artigo antes de salvar.');
      return;
    }

    const pathCollection = 'blog_posts';
    const id = selectedPost ? selectedPost.id : 'blog_' + Date.now();
    const now = new Date().toISOString();

    const postPayload: BlogPost = {
      id,
      title,
      slug: slug || title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      summary,
      content,
      category: category || 'Sem Categoria',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=85',
      author,
      isPublished,
      isFeatured,
      createdAt: selectedPost ? selectedPost.createdAt : now,
      updatedAt: now,
      seoTitle,
      seoDescription,
      seoKeywords,
      focusKeyword,
      canonicalUrl,
      metaRobots,
      ogImageUrl,
      local,
      tipologia,
      aplicacoes,
      produtosUtilizados,
      estilo,
      galleryUrls,
    };

    setIsSaving(true);
    try {
      const { error } = await supabase.from(pathCollection).upsert(blogPostToRow(postPayload));
      if (error) throw error;
      if (options?.keepOpen) {
        setSelectedPost(postPayload);
        setSaveFeedback('Alterações salvas.');
        setTimeout(() => setSaveFeedback(null), 2500);
      } else {
        setIsFormOpen(false);
        setSelectedPost(null);
      }
    } catch (err) {
      console.error(`Error writing ${pathCollection}/${id}:`, err);
      alert('Erro ao salvar artigo: ' + (err as any)?.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (window.confirm('Tem certeza de que deseja excluir este artigo do blog?')) {
      const pathCollection = 'blog_posts';
      try {
        const { error } = await supabase.from(pathCollection).delete().eq('id', postId);
        if (error) throw error;
      } catch (err) {
        console.error(`Error deleting ${pathCollection}/${postId}:`, err);
        alert('Erro ao excluir artigo: ' + (err as any)?.message);
      }
    }
  };

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) return;
    const id = selectedCategory ? selectedCategory.id : categoryName.toLowerCase().replace(/ /g, '-');
    try {
      const { error } = await supabase.from('blog_categories').upsert({
        id,
        name: categoryName,
        display_title: categoryDisplayTitle,
        description: categoryDescription,
        image_url: categoryImageUrl,
        created_at: selectedCategory ? selectedCategory.createdAt : new Date().toISOString()
      });
      if (error) throw error;
      setCategoryName('');
      setCategoryDisplayTitle('');
      setCategoryDescription('');
      setCategoryImageUrl('');
      setSelectedCategory(null);
    } catch (err) {
      console.error('Error saving category:', err);
    }
  };

  const handleCategoryImageUpload = async (file: File) => {
    setIsUploadingCategoryIcon(true);
    try {
      const url = await uploadFileToR2(file, "categories");
      setCategoryImageUrl(url);
    } catch (err: any) {
      console.error('CATEGORY IMAGE UPLOAD ERROR:', err);
      alert(err?.message || 'Erro ao enviar imagem da categoria.');
    } finally {
      setIsUploadingCategoryIcon(false);
    }
  };

  const executeDeleteCategory = async () => {
    if (!isDeletingCategory.category || !isDeletingCategory.replacementCategoryId) return;
    
    try {
      // 1. Get the name of the replacement category
      const replacementCategory = categories.find(c => c.id === isDeletingCategory.replacementCategoryId);
      if (!replacementCategory) return;

      // 2. Update all posts that use this category
      const affectedPosts = posts.filter(p => p.category === isDeletingCategory.category?.name);
      for (const post of affectedPosts) {
        const { error } = await supabase.from('blog_posts').update({ category: replacementCategory.name }).eq('id', post.id);
        if (error) throw error;
      }

      // 3. Delete the category
      const { error: delError } = await supabase.from('blog_categories').delete().eq('id', isDeletingCategory.category.id);
      if (delError) throw delError;

      setIsDeletingCategory({ isOpen: false, category: null, replacementCategoryId: '' });
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  // Live SEO checker and score calculator
  const calculateSeoScore = () => {
    const checks = [
      { id: 'focus_keyword_defined', label: 'Definiu Palavra-chave em foco', passed: false, points: 10 },
      { id: 'focus_keyword_in_title', label: 'Palavra-chave presente no Título', passed: false, points: 15 },
      { id: 'focus_keyword_in_seo_title', label: 'Palavra-chave presente no Meta Título SEO', passed: false, points: 15 },
      { id: 'focus_keyword_in_seo_description', label: 'Palavra-chave presente na Meta Descrição', passed: false, points: 15 },
      { id: 'focus_keyword_in_content', label: 'Palavra-chave presente no corpo do Conteúdo', passed: false, points: 15 },
      { id: 'seo_title_length', label: 'Meta Título possui tamanho ideal (25-60 carac.)', passed: false, points: 10 },
      { id: 'seo_description_length', label: 'Meta Descrição possui tamanho ideal (110-165 carac.)', passed: false, points: 10 },
      { id: 'has_og_image', label: 'Imagem Social Open Graph configurada', passed: false, points: 10 },
      { id: 'has_subheadings', label: 'Possui subtítulos (H2 ou H3) no texto', passed: false, points: 10 }
    ];

    if (focusKeyword.trim().length > 1) {
      checks[0].passed = true;
      const kw = focusKeyword.toLowerCase().trim();
      
      if (title.toLowerCase().includes(kw)) checks[1].passed = true;
      
      const activeSeoTitle = seoTitle || title;
      if (activeSeoTitle.toLowerCase().includes(kw)) checks[2].passed = true;
      
      const activeSeoDesc = seoDescription || summary;
      if (activeSeoDesc.toLowerCase().includes(kw)) checks[3].passed = true;
      
      if (content.toLowerCase().includes(kw)) checks[4].passed = true;
      
      // New check: Focus keyword in Slug
      const kwInSlug = slug.toLowerCase().includes(kw.replace(/ /g, '-'));
      checks.push({ id: 'focus_keyword_in_slug', label: 'Palavra-chave presente no Slug (URL)', passed: kwInSlug, points: 10 });
    }

    const currentSeoTitle = seoTitle || title;
    if (currentSeoTitle.trim().length >= 25 && currentSeoTitle.trim().length <= 60) {
      checks[5].passed = true;
    }

    const currentSeoDesc = seoDescription || summary;
    if (currentSeoDesc.trim().length >= 110 && currentSeoDesc.trim().length <= 165) {
      checks[6].passed = true;
    }

    if (ogImageUrl.trim().length > 0 || imageUrl.trim().length > 0) {
      checks[7].passed = true;
    }

    if (/<h[23][ >]/i.test(content) || content.includes('## ') || content.includes('### ')) {
      checks[8].passed = true;
    }

    const score = checks.reduce((acc, curr) => acc + (curr.passed ? curr.points : 0), 0);
    return { score, checks };
  };

  const { score: seoScore, checks: seoChecks } = calculateSeoScore();

  // Gemini AI Integration Functions
  const runAiAssistant = async (action: 'generate_content' | 'generate_seo' | 'generate_topics' | 'refine_content' | 'generate_full_post' | 'fix_seo_score') => {
    if (!title && action !== 'refine_content') {
      alert('Por favor, defina um Título para o artigo primeiro. A inteligência artificial precisa dele para guiar sua criação.');
      return;
    }

    if (action === 'refine_content' && !refineSnippet && !content) {
      alert('Por favor, informe no campo do Snippet ou escreva um parágrafo para que a IA possa otimizar.');
      return;
    }

    setAiLoadingAction(action);
    try {
      // Get AI config from Supabase
      const { data: geminiRow } = await supabase.from('system_config').select('data').eq('id', 'gemini').maybeSingle();
      const apiKey = (geminiRow?.data?.apiKey || '').trim();

      if (!apiKey) {
        throw new Error('Chave de API do Gemini não configurada. Por favor, vá em Painel Admin > Configurações > Inteligência Artificial e salve sua chave primeiro.');
      }

      const payload = {
        action,
        title,
        category,
        focusKeyword,
        currentContent: action === 'refine_content' ? (refineSnippet || content) : content,
        seoTitle,
        seoDescription,
        apiKey
      };

      const response = await fetch('/api/gemini/blog-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({ error: 'Resposta inválida do servidor' })) as any;

      if (!response.ok) {
        const errorMsg = data.details || data.error || 'Falha de comunicação com o servidor de Inteligência Artificial.';
        
        if (errorMsg.includes('API key not valid')) {
          throw new Error('A Chave de API do Gemini configurada é inválida ou expirou. Por favor, verifique a chave em "Configurações de IA".');
        }
        
        throw new Error(errorMsg);
      }
      
      if (action === 'generate_content') {
        setContent(markdownToHtml(data.result));
      } else if (action === 'generate_seo' || action === 'generate_full_post' || action === 'fix_seo_score') {
        try {
          let cleanedJson = data.result.trim();
          if (cleanedJson.startsWith('```')) {
            cleanedJson = cleanedJson.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
          }
          const parsed = JSON.parse(cleanedJson);

          if (action === 'generate_full_post') {
             if (parsed.content) setContent(markdownToHtml(parsed.content));
             if (parsed.summary) setSummary(parsed.summary);
             if (parsed.focusKeyword) setFocusKeyword(parsed.focusKeyword);
          } else if (action === 'fix_seo_score') {
             if (parsed.content) setContent(markdownToHtml(parsed.content));
             if (parsed.title) setTitle(parsed.title);
             if (parsed.focusKeyword) setFocusKeyword(parsed.focusKeyword);
          }
          
          if (parsed.seoTitle) setSeoTitle(parsed.seoTitle);
          if (parsed.seoDescription) setSeoDescription(parsed.seoDescription);
          if (parsed.seoKeywords) setSeoKeywords(parsed.seoKeywords);
        } catch (jsonErr) {
          console.warn("[IA parsing] Resposta não era JSON válido. Usando padrão bruto.", jsonErr);
          if (action === 'generate_seo') {
             setSeoDescription(data.result.slice(0, 160));
             setSeoTitle(title.slice(0, 50));
          } else {
             alert('A IA falhou ao gerar o formato correto. Tente novamente.');
          }
        }
      } else if (action === 'generate_topics') {
        setAiResultText(data.result);
        setAiModalMode('topics');
        setShowAiModal(true);
      } else if (action === 'refine_content') {
        setAiResultText(data.result);
        setAiModalMode('refine');
        setShowAiModal(true);
      }

    } catch (err: any) {
      console.error(err);
      alert('Não foi possível gerar conteúdo neste momento. Verifique sua chave de API ou tente novamente.');
    } finally {
      setAiLoadingAction(null);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Texto copiado com sucesso para a área de transferência!');
  };

  // If isFormOpen is true, render the beautiful, wide full-screen workspace layout in the Admin page zone
  if (isFormOpen) {
    return (
      <div className="space-y-6" id="blog-editor-workspace">
        {/* Top bar header - Sticky for UX */}
        <div className="sticky top-0 z-30 bg-[#0c0c0c]/80 backdrop-blur-md -mx-4 px-4 sm:-mx-8 sm:px-8 py-4 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all">
          <div>
            <button 
              onClick={() => setIsFormOpen(false)}
              className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-bold text-[10px] uppercase tracking-wider transition-all mb-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar
            </button>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500 animate-pulse" />
              {selectedPost ? 'Editar Artigo' : 'Nova Redação'}
            </h1>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            {saveFeedback && (
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1 mr-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {saveFeedback}
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="flex-1 sm:flex-none bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5 font-bold px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={(e) => handleSubmit(e, { keepOpen: true })}
              className="flex-1 sm:flex-none bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 font-bold px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Salvando...' : 'Salvar e continuar editando'}
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={(e) => handleSubmit(e)}
              className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2 rounded-xl border border-indigo-400/25 shadow-[0_0_20px_rgba(99,102,241,0.3)] text-[10px] uppercase tracking-wider transition-all cursor-pointer hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Salvando...' : selectedPost ? 'Salvar e sair' : 'Publicar e sair'}
            </button>
          </div>
        </div>

        {/* Workspace Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area (2 Cols wide) */}
          <div className="lg:col-span-2 space-y-6 min-w-0">
            <div className="bg-[#0b0b0b] border border-white/5 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
              
              {/* SEO Score Card Head */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-2">
                 <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Desempenho de SEO</h3>
                    <p className="text-[10px] text-gray-500">Pontuação em tempo real baseada nas métricas do Google</p>
                 </div>
                 <div className={`px-4 py-2 rounded-xl font-bold border ${
                    seoScore >= 80 
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' 
                      : seoScore >= 50 
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/25' 
                        : 'bg-red-500/15 text-red-400 border-red-500/25'
                  }`}>
                    SCORE: {seoScore}/100
                  </div>
              </div>

              {/* Título & Slug & AI Features */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Título do Artigo</label>
                      <span className={`text-[10px] font-bold font-mono ${title.length > 70 ? 'text-red-400' : title.length > 50 ? 'text-emerald-400' : 'text-gray-500'}`}>
                        {title.length} carac.
                      </span>
                    </div>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (!selectedPost) {
                          setSlug(e.target.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                        }
                      }}
                      placeholder="Ex: Como otimizar suas conversões usando IA"
                      className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-gray-700 font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">URL Amigável (Slug)</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-white/10 bg-white/5 text-gray-500 text-[10px] font-mono">
                        /blog/
                      </span>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
                        placeholder="url-do-seu-post"
                        className="flex-1 bg-[#121212] border border-white/10 rounded-r-xl px-4 py-3 text-sm text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* AI Actions row */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    disabled={aiLoadingAction !== null}
                    onClick={() => runAiAssistant('generate_full_post')}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-gray-800 disabled:to-gray-800 disabled:cursor-not-allowed text-white font-bold px-4 py-3.5 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.25)] text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer border border-indigo-400/20"
                  >
                    {aiLoadingAction === 'generate_full_post' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Wand2 className="w-5 h-5" />
                    )}
                    Criar artigo completo com a IA
                  </button>
                  <button
                    type="button"
                    disabled={aiLoadingAction !== null}
                    onClick={() => runAiAssistant('generate_topics')}
                    className="sm:w-1/3 bg-[#121212] hover:bg-white/5 border border-white/10 disabled:bg-gray-900 disabled:cursor-not-allowed text-gray-300 font-bold px-4 py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {aiLoadingAction === 'generate_topics' ? (
                      <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                    ) : (
                      <FileText className="w-4 h-4 text-amber-400" />
                    )}
                    Gerar temas
                  </button>
                </div>
              </div>

              {/* Informações adicionais */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Autor / Editor</label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Nome do escritor do blog"
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Categoria do Blog</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Resumo do Artigo */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Resumo Curto (SEO Snippet Inicial)</label>
                <textarea
                  rows={2}
                  required
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Escreva um resumo cativante de um ou dois parágrafos para os cards da listagem de blog..."
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-gray-700 resize-none leading-relaxed"
                />
              </div>

              {/* Conteúdo Editor */}
              <div className="space-y-2">
                <div className="flex justify-between items-center pb-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Corpo do Artigo</label>
                </div>
                <BlogContentEditor
                  value={content}
                  onChange={setContent}
                  onUploadImage={(file) => uploadFileToR2(file, 'blog')}
                />
              </div>

            </div>

            {/* SEO Collapsible Section Expandable in workspace */}
            <div className="bg-[#0b0b0b] border border-white/5 rounded-2xl overflow-hidden shadow-xl" id="seo-advanced-workspace-panel">
              <button
                type="button"
                onClick={() => setIsSeoExpanded(!isSeoExpanded)}
                className="w-full flex items-center justify-between p-6 bg-white/[0.01] hover:bg-white/[0.03] transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                  <div>
                    <span className="text-sm font-bold text-white block uppercase tracking-wider">Otimização de SEO & Metatags Avançada</span>
                    <span className="text-xs text-gray-500 mt-0.5">Defina palavras-chave e otimize as tags de busca do Google e redes sociais.</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
                    seoScore >= 80 
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' 
                      : seoScore >= 50 
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/25' 
                        : 'bg-red-500/15 text-red-400 border-red-500/25'
                  }`}>
                    SEO SCORE: {seoScore}/100
                  </span>
                  <ChevronRight className={`w-5 h-5 text-gray-500 transform transition-transform ${isSeoExpanded ? 'rotate-90' : ''}`} />
                </div>
              </button>

              {isSeoExpanded && (
                <div className="p-6 border-t border-white/5 bg-black/30 space-y-6">
                  {/* Realtime SEO diagnostics */}
                  <div className="bg-white/[0.01] border border-white/5 rounded-xl p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-indigo-500" /> Diagnóstico de SEO (Tempo Real)
                      </p>
                      {seoScore < 100 && (
                        <button
                          type="button"
                          disabled={aiLoadingAction !== null}
                          onClick={() => runAiAssistant('fix_seo_score')}
                          className="flex-shrink-0 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-bold px-3 py-1.5 rounded-lg border border-indigo-500/20 text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all w-full sm:w-auto mt-2 sm:mt-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {aiLoadingAction === 'fix_seo_score' ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Wand2 className="w-3.5 h-3.5" />
                          )}
                          IA: Corrigir p/ 100%
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      {seoChecks.map((check) => (
                        <div key={check.id} className="flex items-center justify-between text-xs py-1 border-b border-white/[0.02]">
                          <span className="text-gray-400 flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${check.passed ? 'bg-emerald-400' : 'bg-gray-700'}`} />
                            {check.label}
                          </span>
                          <span className={`font-semibold text-[11px] ${check.passed ? 'text-emerald-400' : 'text-gray-600'}`}>
                            {check.passed ? `✓ (${check.points}p)` : `Ajustar (${check.points}p)`}
                          </span>
                        </div>
                      ))}
                    </div>
                    {/* SEO progress bar */}
                    <div className="w-full bg-white/5 rounded-full h-2 mt-4 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          seoScore >= 80 ? 'bg-emerald-500' : seoScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
                        }`} 
                        style={{ width: `${seoScore}%` }} 
                      />
                    </div>
                  </div>

                  {/* Core SEO inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Palavra-chave e URL Canônica */}
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Palavra-Chave Foco (Focus Keyword)</label>
                        <input
                          type="text"
                          value={focusKeyword}
                          onChange={(e) => setFocusKeyword(e.target.value)}
                          placeholder="Ex: tráfego pago, google ads"
                          className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">URL Canônica (Canonical)</label>
                        <input
                          type="url"
                          value={canonicalUrl}
                          onChange={(e) => setCanonicalUrl(e.target.value)}
                          placeholder="https://7zion.com/blog/seu-artigo"
                          className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* SEO Meta Title and Meta Description */}
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <label className="font-bold text-gray-400 uppercase tracking-wider">Metatítulo SEO (Meta Title)</label>
                          <span className={`font-bold font-mono ${
                            seoTitle.length >= 25 && seoTitle.length <= 60 
                              ? 'text-emerald-400' 
                              : seoTitle.length > 0 && (seoTitle.length < 25 || seoTitle.length > 60)
                                ? 'text-amber-400'
                                : 'text-gray-500'
                          }`}>
                            {seoTitle.length}/60 carac.
                          </span>
                        </div>
                        <input
                          type="text"
                          value={seoTitle}
                          onChange={(e) => setSeoTitle(e.target.value)}
                          placeholder="Deixe em branco para usar o Título principal"
                          className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <label className="font-bold text-gray-400 uppercase tracking-wider">Meta Descrição (Meta Description)</label>
                          <span className={`font-bold font-mono ${
                            seoDescription.length >= 110 && seoDescription.length <= 160 
                              ? 'text-emerald-400' 
                              : seoDescription.length > 0 && (seoDescription.length < 110 || seoDescription.length > 165)
                                ? 'text-amber-400'
                                : 'text-gray-500'
                          }`}>
                            {seoDescription.length}/160 carac.
                          </span>
                        </div>
                        <textarea
                          rows={2}
                          value={seoDescription}
                          onChange={(e) => setSeoDescription(e.target.value)}
                          placeholder="Deixe em branco para utilizar os primeiros parágrafos do resumo"
                          className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Indexação (Robots Diretiva)</label>
                      <select
                        value={metaRobots}
                        onChange={(e) => setMetaRobots(e.target.value)}
                        className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                      >
                        <option value="index, follow">index, follow (Habilitar total buscas)</option>
                        <option value="noindex, follow">noindex, follow (Remover da listagem do sitemap)</option>
                        <option value="index, nofollow">index, nofollow (Não seguir links internos)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block font-mono">Palavras-Chave Separadas por Vírgula</label>
                      <input
                        type="text"
                        value={seoKeywords}
                        onChange={(e) => setSeoKeywords(e.target.value)}
                        placeholder="Ex: marketing digital, leads, vendas"
                        className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar area: AI Panel & Cover Selector */}
          <div className="space-y-6 lg:col-span-1 min-w-0">

            {/* Configuração de Publicação Rapida */}
            <div className="bg-[#0b0b0b] border border-white/5 rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-1.5 border-b border-white/5">Status de Publicação</h3>
              <div className="flex items-center justify-between bg-white/[0.01] p-3 rounded-xl border border-white/5">
                <div>
                  <p className="text-xs font-bold text-white uppercase tracking-wider">Tornar Público?</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Disponível na home e no blog</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPublished(!isPublished)}
                  className={`w-11 h-6 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${isPublished ? 'bg-indigo-600' : 'bg-gray-700'}`}
                >
                  <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${isPublished ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between bg-white/[0.01] p-3 rounded-xl border border-white/5 mt-3">
                <div>
                  <p className="text-xs font-bold text-white uppercase tracking-wider">Post em Destaque?</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Exibir este post na seção principal do blog</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFeatured(!isFeatured)}
                  className={`w-11 h-6 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${isFeatured ? 'bg-amber-500' : 'bg-gray-700'}`}
                >
                  <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${isFeatured ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            {/* INTELIGENCIA ARTIFICIAL GEMINI PANEL */}
            <div className="bg-[#0b0b0b] border border-indigo-500/10 rounded-2xl p-6 space-y-5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />
              <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
                <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Ajuste Fino de Escrita</h3>
                  <p className="text-[10px] text-indigo-300 mt-0.5">Correção de textos específicos</p>
                </div>
              </div>

              {/* Snippet optimizer box */}
              <div className="border border-white/5 rounded-xl bg-white/[0.01] p-3 space-y-2 mt-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Otimizador de Parágrafos</span>
                <textarea
                  value={refineSnippet}
                  onChange={(e) => setRefineSnippet(e.target.value)}
                  placeholder="Cole ou redija uma frase/parágrafo para a IA melhorar..."
                  rows={4}
                  className="w-full bg-[#121212] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none font-sans"
                />
                <button
                  type="button"
                  disabled={aiLoadingAction !== null}
                  onClick={() => runAiAssistant('refine_content')}
                  className="w-full bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-lg py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  {aiLoadingAction === 'refine_content' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RotateCw className="w-3.5 h-3.5" />
                  )}
                  Polir Parágrafo Solto
                </button>
              </div>
            </div>

            {/* Capa do Artigos uploader */}
            <div className="bg-[#0b0b0b] border border-white/5 rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-1.5 border-b border-white/5">Capa do Artigo</h3>
              
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-5 text-center transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                  dragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/5 hover:border-white/15 bg-[#121212]'
                }`}
              >
                <label className="cursor-pointer flex flex-col items-center gap-2.5 w-full h-full">
                  <Upload className={`w-7 h-7 text-indigo-400 ${isUploading ? 'animate-bounce' : ''}`} />
                  <span className="text-xs font-bold text-gray-300 select-none">
                    {isUploading ? 'Enviando imagem...' : 'Solte o arquivo ou toque para selecionar'}
                  </span>
                  <span className="text-[10px] text-gray-500 select-none">Imagens JPG, PNG até 10MB</span>
                  <input 
                    type="file" 
                    accept="image/*" 
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

              <div className="text-center text-xs text-gray-500">- ou link direto -</div>

              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
              />

              {imageUrl && (
                <div className="relative rounded-xl overflow-hidden border border-white/10 aspect-video bg-black/60 mt-1">
                  <img 
                    src={imageUrl} 
                    alt="Capa do artigo preview" 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-2 right-2 p-1.5 bg-black/80 hover:bg-black rounded-full text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
            {/* Detalhes de Projeto (Opcional) */}
            <div className="bg-[#0b0b0b] border border-white/5 rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-1.5 border-b border-white/5">Detalhes do Projeto (Opcional)</h3>
              <p className="text-xs text-gray-400">Preencha caso este artigo seja sobre um projeto executado.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Local / Cidade</label>
                  <input
                    type="text"
                    value={local}
                    onChange={(e) => setLocal(e.target.value)}
                    placeholder="Ex: São Paulo, SP"
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Tipologia</label>
                  <input
                    type="text"
                    value={tipologia}
                    onChange={(e) => setTipologia(e.target.value)}
                    placeholder="Ex: Projeto Residencial"
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Aplicações</label>
                  <input
                    type="text"
                    value={aplicacoes}
                    onChange={(e) => setAplicacoes(e.target.value)}
                    placeholder="Ex: Fachada, Área Gourmet"
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Produtos Utilizados</label>
                  <input
                    type="text"
                    value={produtosUtilizados}
                    onChange={(e) => setProdutosUtilizados(e.target.value)}
                    placeholder="Ex: Brick Brisa, Piso Lastra"
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Estilo</label>
                  <input
                    type="text"
                    value={estilo}
                    onChange={(e) => setEstilo(e.target.value)}
                    placeholder="Ex: Contemporâneo, Orgânico"
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* FLOATING AI ASSISTANT DIALOG MODAL */}
        {showAiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setShowAiModal(false)} />
            <div className="relative w-full max-w-2xl bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
              
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  {aiModalMode === 'topics' ? 'Ideias de Tópicos Sugeridos' : 'Parágrafo Polido por IA'}
                </h3>
                <button 
                  onClick={() => setShowAiModal(false)} 
                  className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 border border-white/5 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-y-auto py-5 flex-1 text-sm text-gray-300 leading-relaxed font-sans scrollbar-thin">
                <div className="bg-[#121212] border border-white/5 rounded-xl p-5 whitespace-pre-wrap font-mono text-xs text-gray-200">
                  {aiResultText}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/5">
                <button
                  onClick={() => setShowAiModal(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all border border-white/5 cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  onClick={() => {
                    if (aiResultText) {
                      handleCopyText(aiResultText);
                    }
                  }}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" /> Copiar para Área de Transferência
                </button>
                {aiModalMode === 'refine' && (
                  <button
                    onClick={() => {
                      if (aiResultText) {
                        setContent(prev => prev + markdownToHtml(aiResultText));
                        setShowAiModal(false);
                      }
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" /> Inserir no Fim do Post
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

        <MediaPickerModal
          isOpen={isMediaPickerOpen}
          onClose={() => setIsMediaPickerOpen(false)}
          onSelect={setImageUrl}
          defaultFolder="blog/"
        />
      </div>
    );
  }

  // List / Table View of Blog Posts
  return (
    <div className="space-y-6" id="blog-control-root">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-5" id="blog-header-section">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Gerenciador de Blog</h1>
          <p className="text-gray-400 text-sm mt-1">Crie, edite e organize os artigos e novidade da 7Zion Agência em tempo real.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCategoryManagerOpen(true)}
            className="bg-white/5 hover:bg-white/10 text-white font-bold px-5 py-3 rounded-xl border border-white/10 flex items-center gap-2.5 transition-all hover:scale-[1.02] text-xs uppercase tracking-wider cursor-pointer font-sans"
          >
            Gerenciar Categorias
          </button>
          <button
            onClick={openCreateForm}
            className="bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold px-5 py-3 rounded-xl border border-indigo-400/20 shadow-[0_0_20px_rgba(99,102,241,0.25)] flex items-center gap-2.5 transition-all hover:scale-[1.02] text-xs uppercase tracking-wider cursor-pointer font-sans"
            id="btn-create-blog-post"
          >
            <Plus className="w-4 h-4" /> Novo Artigo de Blog
          </button>
        </div>
      </div>

      {/* Busca por título + Filtro por categoria */}
      <div className="flex flex-col sm:flex-row gap-3" id="blog-filters">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar por título..."
            className="w-full bg-[#0b0b0b] border border-white/10 rounded-xl pl-4 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-600"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-[#0b0b0b] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:w-56"
        >
          <option value="all">Todas as categorias</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500 flex flex-col items-center gap-3" id="blog-loading">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <span className="text-sm">Carregando artigos...</span>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-[#0b0b0b] border border-white/5 rounded-2xl p-12 text-center space-y-4 shadow-xl" id="blog-empty-state">
          <ImageIcon className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-lg font-bold text-white uppercase tracking-wider">Nenhum post publicado</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Comece criando o primeiro post no seu blog para atrair leitores e demonstrar o conhecimento de marketing digital da agência.
          </p>
          <button
            onClick={openCreateForm}
            className="text-xs bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 font-bold px-5 py-2.5 border border-indigo-500/30 rounded-xl transition-all cursor-pointer uppercase tracking-wider"
          >
            Criar Primeiro Artigo
          </button>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-[#0b0b0b] border border-white/5 rounded-2xl p-12 text-center space-y-2 shadow-xl" id="blog-empty-filter-state">
          <ImageIcon className="w-10 h-10 text-gray-600 mx-auto" />
          <h3 className="text-base font-bold text-white uppercase tracking-wider">Nenhum artigo encontrado</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">Ajuste a busca ou a categoria selecionada.</p>
        </div>
      ) : (
        <div className="bg-[#0b0b0b] border border-white/5 rounded-2xl overflow-hidden shadow-2xl" id="blog-posts-table-wrapper">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" id="blog-posts-table">
              <thead>
                <tr className="border-b border-white/5 bg-[#121212]/50 text-gray-400 text-xs font-bold uppercase tracking-widest leading-none">
                  <th className="py-5 px-6">Imagem & Título</th>
                  <th className="py-5 px-6">Categoria</th>
                  <th className="py-5 px-6">Autor</th>
                  <th className="py-5 px-6">Status</th>
                  <th className="py-5 px-6">Data</th>
                  <th className="py-5 px-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                {paginatedPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-white/[0.01] transition-colors" id={`post-row-${post.id}`}>
                    <td className="py-4 px-6 flex items-center gap-4">
                      <img 
                        src={post.imageUrl} 
                        alt={post.title} 
                        className="w-16 h-10 object-cover rounded-xl border border-white/10 bg-black/50" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="max-w-[280px]">
                        <p className="font-bold text-white line-clamp-1">{post.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{post.summary}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 text-xs px-3 py-1 rounded-full font-bold">
                        {post.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-400 font-medium">{post.author}</td>
                    <td className="py-4 px-6 font-medium">
                      {post.isPublished ? (
                        <span className="text-emerald-400 flex items-center gap-1.5 text-xs">
                          <Eye className="w-4 h-4 text-emerald-400" /> Publicado
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1.5 text-xs">
                          <EyeOff className="w-4 h-4 text-amber-400" /> Rascunho
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-400 font-mono font-bold">
                      {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2 shrink-0">
                      <button
                        onClick={() => openEditForm(post)}
                        className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white border border-white/10 transition-all inline-flex items-center cursor-pointer hover:scale-105"
                        title="Editar post em tela cheia"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-400 border border-red-500/15 transition-all inline-flex items-center cursor-pointer hover:scale-105"
                        title="Excluir post"
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
                Mostrando <span className="text-white">{Math.min(posts.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(posts.length, currentPage * itemsPerPage)}</span> de <span className="text-white">{posts.length}</span> artigos
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

      {/* Gerenciador de Categorias Modal */}
      {isCategoryManagerOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" id="category-manager-modal">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsCategoryManagerOpen(false)} />
          
          <div className="relative w-full max-w-4xl bg-[#0c0c0c] border border-white/10 rounded-2xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#0c0c0c] z-10">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Gerenciar Categorias do Blog</h3>
                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-bold">
                  Organize seus artigos por temas para facilitar a navegação
                </p>
              </div>
              <button 
                onClick={() => {
                  setIsCategoryManagerOpen(false);
                  setIsDeletingCategory({ isOpen: false, category: null, replacementCategoryId: '' });
                  setCategoryName('');
                  setSelectedCategory(null);
                }}
                className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all cursor-pointer border border-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {!isDeletingCategory.isOpen ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Lado Esquerdo: Formulário */}
                  <div className="space-y-6">
                    <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5 space-y-4">
                      <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-widest">{selectedCategory ? 'Editar Categoria' : 'Nova Categoria'}</h4>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Nome da Categoria</label>
                        <input
                          type="text"
                          value={categoryName}
                          onChange={(e) => setCategoryName(e.target.value)}
                          placeholder="Ex: Tendências de Revestimento"
                          className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Título Amigável (SEO)</label>
                        <input
                          type="text"
                          value={categoryDisplayTitle}
                          onChange={(e) => setCategoryDisplayTitle(e.target.value)}
                          placeholder="Ex: As melhores tendências para sua obra"
                          className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Breve Descrição</label>
                        <textarea
                          value={categoryDescription}
                          onChange={(e) => setCategoryDescription(e.target.value)}
                          placeholder="Fale um pouco sobre o que os leitores encontrarão aqui..."
                          className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium h-24 resize-none"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Banner / Imagem da Categoria</label>
                        <div className="flex gap-4 items-center">
                          <div className="w-20 h-20 rounded-xl bg-[#121212] border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center group relative">
                            {categoryImageUrl ? (
                              <img src={categoryImageUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-8 h-8 text-gray-700" />
                            )}
                          </div>
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={categoryImageUrl}
                              onChange={(e) => setCategoryImageUrl(e.target.value)}
                              placeholder="URL da imagem (Unsplash ou R2)..."
                              className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                            />
                            <label className="flex items-center justify-center gap-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-lg py-2 text-[10px] font-bold uppercase cursor-pointer transition-all">
                              {isUploadingCategoryIcon ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                              {isUploadingCategoryIcon ? 'Fazendo Upload...' : 'Upload via R2'}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => e.target.files?.[0] && handleCategoryImageUpload(e.target.files[0])}
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4 border-t border-white/5">
                        <button
                          type="button"
                          onClick={handleSaveCategory}
                          disabled={!categoryName.trim() || isUploadingCategoryIcon}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-3 text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {selectedCategory ? 'Salvar Alterações' : 'Criar Categoria'}
                        </button>
                        {selectedCategory && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCategory(null);
                              setCategoryName('');
                              setCategoryDisplayTitle('');
                              setCategoryDescription('');
                              setCategoryImageUrl('');
                            }}
                            className="bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl px-4 py-3 text-sm font-bold border border-white/5 transition-all cursor-pointer"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Lado Direito: Listagem */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center justify-between">
                      Categorias Ativas
                      <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full border border-white/5">{categories.length} cadastradas</span>
                    </h4>
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                      {categories.map((cat) => {
                        const postCount = posts.filter(p => p.category === cat.name).length;
                        return (
                          <div key={cat.id} className="group flex items-center justify-between p-4 rounded-2xl bg-[#121212] border border-white/5 hover:border-indigo-500/30 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-black/40 overflow-hidden border border-white/5 flex-shrink-0">
                                {cat.imageUrl ? (
                                  <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-800"><ImageIcon className="w-4 h-4" /></div>
                                )}
                              </div>
                              <div>
                                <span className="text-sm font-bold text-white block">{cat.name}</span>
                                <span className="text-[10px] text-indigo-400/70 font-bold uppercase tracking-wider">{postCount} {postCount === 1 ? 'artigo' : 'artigos'}</span>
                              </div>
                            </div>
                            <div className="flex gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  setSelectedCategory(cat);
                                  setCategoryName(cat.name);
                                  setCategoryDisplayTitle(cat.displayTitle || '');
                                  setCategoryDescription(cat.description || '');
                                  setCategoryImageUrl(cat.imageUrl || '');
                                }}
                                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setIsDeletingCategory({ isOpen: true, category: cat, replacementCategoryId: '' })}
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
                      Você está prestes a excluir a categoria <strong>{isDeletingCategory.category?.name}</strong>.
                    </p>
                    <p className="text-amber-200/80 text-xs">
                      {posts.filter(p => p.category === isDeletingCategory.category?.name).length} artigos estão vinculados a ela atualmente. Se quiser exclui-la, escolha uma nova categoria para esses artigos.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Transferir artigos para:</label>
                    <select
                      value={isDeletingCategory.replacementCategoryId}
                      onChange={(e) => setIsDeletingCategory(prev => ({ ...prev, replacementCategoryId: e.target.value }))}
                      className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    >
                      <option value="" disabled>Selecione uma categoria...</option>
                      {categories.filter(c => c.id !== isDeletingCategory.category?.id).map((cat) => (
                         <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-white/5 disabled:opacity-50">
                    <button
                      onClick={() => setIsDeletingCategory({ isOpen: false, category: null, replacementCategoryId: '' })}
                      className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      disabled={!isDeletingCategory.replacementCategoryId}
                      onClick={executeDeleteCategory}
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
