export interface AdminUser {
  userId: string;
  email: string;
  role: 'admin' | 'editor';
  createdAt: string;
  isSuperAdmin: boolean;
}

export interface BlogCategory {
  id: string;
  name: string;
  createdAt: string;
  imageUrl?: string;
  displayTitle?: string;
  description?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  createdAt: string;
  imageUrl?: string;
  displayTitle?: string;
  description?: string;
  showOnHome?: boolean;
  homeSortBy?: 'name' | 'price' | 'tamanho';
}

export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  imageUrl: string;
  author: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  published?: boolean;
  isFeatured?: boolean;
  isProductsFeatured?: boolean;
  slug?: string;
  
  // SEO fields
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  metaRobots?: string;
  ogImageUrl?: string;

  // Project-like details for blog
  galleryUrls?: string[];
  local?: string;
  tipologia?: string;
  aplicacoes?: string;
  produtosUtilizados?: string;
  estilo?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  galleryUrls?: string[];
  category: string;
  stock: number;
  
  // Customization
  itemType?: 'product' | 'service';
  ctaType?: 'whatsapp' | 'form' | 'custom_link';
  ctaValue?: string;
  
  // Detalhes do Produto
  tag?: string;
  tamanho?: string;
  unidade?: string;
  aplicacao?: string;
  estilo?: string;
  colecao?: string;
  acabamento?: string;
  tonalidade?: string;
  
  createdAt: string;
  updatedAt: string;
  published?: boolean;
  isFeatured?: boolean;
  isProductsFeatured?: boolean;

  // SEO fields
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  metaRobots?: string;
  ogImageUrl?: string;
}
