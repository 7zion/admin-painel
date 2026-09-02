import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';
import { useAuth } from './auth-context';
import type { SiteContentRecord } from './cms-server';

interface CMSContextType {
  isEditMode: boolean;
  setIsEditMode: (mode: boolean) => void;
  canEdit: boolean;
  styleClipboard: any | null;
  setStyleClipboard: (styles: any) => void;
  content: Record<string, SiteContentRecord>;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

function rowToRecord(row: any): SiteContentRecord {
  return {
    contentValue: row.content_value,
    contentType: row.content_type,
    styles: row.styles,
  };
}

export function CMSProvider({
  children,
  initialContent = {},
}: {
  children: React.ReactNode;
  initialContent?: Record<string, SiteContentRecord>;
}) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [styleClipboard, setStyleClipboard] = useState<any | null>(null);
  const [content, setContent] = useState<Record<string, SiteContentRecord>>(initialContent);
  const { userRole } = useAuth();

  const canEdit = userRole === 'admin';

  // Um único listener em tempo real para toda a coleção de conteúdo editável,
  // em vez de um listener por EditableField (era isso que estourava a cota no Firestore).
  useEffect(() => {
    let cancelled = false;

    supabase
      .from('site_content')
      .select('*')
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error('Error loading site_content:', error);
          return;
        }
        const next: Record<string, SiteContentRecord> = {};
        for (const row of data || []) {
          next[row.id] = rowToRecord(row);
        }
        setContent(next);
      });

    const channel = supabase
      .channel('site_content-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_content' }, (payload) => {
        setContent((prev) => {
          const next = { ...prev };
          if (payload.eventType === 'DELETE') {
            delete next[(payload.old as any).id];
          } else {
            const row = payload.new as any;
            next[row.id] = rowToRecord(row);
          }
          return next;
        });
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <CMSContext.Provider value={{
      isEditMode: isEditMode && canEdit,
      setIsEditMode,
      canEdit,
      styleClipboard,
      setStyleClipboard,
      content,
    }}>
      {children}
    </CMSContext.Provider>
  );
}

export function useCMSContext() {
  const context = useContext(CMSContext);
  if (context === undefined) {
    throw new Error('useCMSContext must be used within a CMSProvider');
  }
  return context;
}
