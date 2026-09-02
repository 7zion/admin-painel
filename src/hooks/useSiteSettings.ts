import { useSettingsContext } from '../lib/settings-context';

export interface HomeProductsConfig {
  mode: 'category' | 'price' | 'recent' | 'manual';
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  manualIds?: string[];
}

export interface SiteSettings {
  siteName: string;
  siteLogo: string;
  siteLogoFooter: string;
  siteFavicon: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  homeProductsConfig?: HomeProductsConfig;
}

export function useSiteSettings() {
  const { settings, isLoading } = useSettingsContext();
  return { settings, isLoading };
}
