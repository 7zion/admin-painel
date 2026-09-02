import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';
import { SiteSettings } from '../hooks/useSiteSettings';
import { WidgetConfig } from '../types/chat';

interface SettingsContextData {
  settings: SiteSettings;
  trackingSettings: any;
  widgetSettings: WidgetConfig | null;
  contactSettings: { whatsappNumber: string; whatsappDefaultMessage: string; companyAddress?: string } | null;
  isLoading: boolean;
}

const defaultSettings: SiteSettings = {
  siteName: 'Moraes Tijolos Revestimento',
  siteLogo: '',
  siteLogoFooter: '',
  siteFavicon: '',
  seoTitle: 'Moraes Tijolos Revestimento',
  seoDescription: '',
  seoKeywords: ''
};

const SettingsContext = createContext<SettingsContextData>({
  settings: defaultSettings,
  trackingSettings: null,
  widgetSettings: null,
  contactSettings: null,
  isLoading: true
});

function toSiteSettings(data: any): SiteSettings {
  return {
    siteName: data?.siteName || defaultSettings.siteName,
    siteLogo: data?.siteLogo || '',
    siteLogoFooter: data?.siteLogoFooter || '',
    siteFavicon: data?.siteFavicon || '',
    seoTitle: data?.seoTitle || defaultSettings.seoTitle,
    seoDescription: data?.seoDescription || '',
    seoKeywords: data?.seoKeywords || '',
    homeProductsConfig: data?.homeProductsConfig,
  };
}

export function SettingsProvider({ children, initialSettings, initialTrackingSettings, initialWidgetSettings, initialContactSettings }: { children: React.ReactNode, initialSettings: Partial<SiteSettings> | null, initialTrackingSettings?: any, initialWidgetSettings?: any, initialContactSettings?: any }) {
  const [settings, setSettings] = useState<SiteSettings>(
    initialSettings ? toSiteSettings(initialSettings) : defaultSettings
  );
  const [trackingSettings, setTrackingSettings] = useState<any>(initialTrackingSettings || null);
  const [widgetSettings, setWidgetSettings] = useState<WidgetConfig | null>(initialWidgetSettings || null);
  const [contactSettings, setContactSettings] = useState<any>(initialContactSettings || null);
  const [isLoading, setIsLoading] = useState(!initialSettings);

  useEffect(() => {
    const applyRow = (row: { id: string; data: any }) => {
      switch (row.id) {
        case 'site':
          setSettings(toSiteSettings(row.data));
          break;
        case 'tracking':
          setTrackingSettings(row.data);
          break;
        case 'widgets':
          setWidgetSettings(row.data as WidgetConfig);
          break;
        case 'contact':
          setContactSettings(row.data);
          break;
      }
    };

    let cancelled = false;

    supabase
      .from('settings')
      .select('id, data')
      .in('id', ['site', 'tracking', 'widgets', 'contact'])
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error('Error fetching site settings:', error);
        } else {
          for (const row of data || []) applyRow(row as any);
        }
        setIsLoading(false);
      });

    const channel = supabase
      .channel('settings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, (payload) => {
        const row = (payload.new ?? payload.old) as any;
        if (row) applyRow(row);
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, trackingSettings, widgetSettings, contactSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext() {
  return useContext(SettingsContext);
}
