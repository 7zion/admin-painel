import { Outlet, createRootRoute, HeadContent, Scripts } from '@tanstack/react-router'
import * as React from 'react'
import '../index.css'
import { AuthProvider } from '../lib/auth-context'
import { CMSProvider } from '../lib/cms-context'
import { SettingsProvider } from '../lib/settings-context'
import { AdminControls } from '../components/admin/AdminControls'
import { TrackingHeadInjector, TrackingBodyInjector, TrackingScriptActivator } from '../core/tracking/TrackingScriptInjector'
import { SEOMetadata } from '../components/SEOMetadata'
import { fetchAllSiteContent, fetchSiteSettings, fetchTrackingSettings, fetchWidgetSettings } from '../lib/cms-server'

export const Route = createRootRoute({
  loader: async () => {
    const [cmsContent, siteSettings, trackingSettings, widgetSettings] = await Promise.all([
      fetchAllSiteContent(),
      fetchSiteSettings(),
      fetchTrackingSettings(),
      fetchWidgetSettings()
    ]);
    return { cmsContent, siteSettings, trackingSettings, widgetSettings }
  },
  head: ({ loaderData }) => ({
    links: loaderData?.siteSettings?.siteFavicon
      ? [{ rel: 'icon', href: loaderData.siteSettings.siteFavicon }]
      : [],
  }),
  component: RootComponent,
  notFoundComponent: () => {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold mb-4">404 - Página Não Encontrada</h1>
        <p className="text-gray-400 mb-8 text-center max-w-md">
          A página que você está procurando não existe ou foi movida.
        </p>
        <a 
          href="/" 
          className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          Voltar para Home
        </a>
      </div>
    )
  }
})

function RootComponent() {
  const { cmsContent, siteSettings, trackingSettings, widgetSettings } = Route.useLoaderData()

  const app = (
    <>
      <AuthProvider>
        <SettingsProvider initialSettings={siteSettings} initialTrackingSettings={trackingSettings} initialWidgetSettings={widgetSettings}>
          <SEOMetadata />
          <TrackingBodyInjector />
          <TrackingScriptActivator />
          <CMSProvider initialContent={cmsContent}>
            <Outlet />
            <AdminControls />
          </CMSProvider>
        </SettingsProvider>
      </AuthProvider>
    </>
  )

  if (typeof document !== 'undefined' && document.getElementById('root')) {
    return app
  }

  return (
    <html lang="pt-BR" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <HeadContent />
        <TrackingHeadInjector settings={trackingSettings} />
      </head>
      <body className="bg-[#050505] min-h-screen selection:bg-indigo-500/30 overflow-x-hidden">
        {app}
        <Scripts />
      </body>
    </html>
  )
}
