import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth-context';
import { useCMSContext } from '../lib/cms-context';

export interface SiteContent {
  id: string;
  contentValue: string;
  contentType: 'text' | 'image' | 'html';
  styles?: {
    color?: string;
    fontSize?: string;
    spacing?: string;
    fontFamily?: string;
    fontWeight?: string;
  };
}

// Lê do listener único (coleção inteira) mantido pelo CMSProvider, em vez de abrir
// um listener por campo (o site tem 500+ instâncias de EditableField).
export function useCMS(id: string, initialValue: string, type: 'text' | 'image' | 'html' = 'text') {
  const { content } = useCMSContext();
  const record = content?.[id];
  const { userRole } = useAuth();
  const isAdmin = userRole === 'admin';

  const updateContent = async (newValue: string, newStyles?: SiteContent['styles']) => {
    if (!isAdmin) return;

    try {
      const { error } = await supabase.from('site_content').upsert({
        id,
        content_value: newValue,
        content_type: type,
        styles: newStyles || record?.styles || {},
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error updating CMS content:', error);
      throw error;
    }
  };

  return {
    value: record?.contentValue ?? initialValue,
    styles: record?.styles,
    updateContent,
    loading: false,
    isAdmin
  };
}
