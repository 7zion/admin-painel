import { createFileRoute, Outlet, ScrollRestoration } from '@tanstack/react-router'
import { Header } from '../components/moraes/Header';
import { Footer } from '../components/moraes/Footer';
import { FloatingWhatsApp } from '../components/FloatingWhatsApp';
import { AnalyticsTracker } from '../components/AnalyticsTracker';
import { ChatWidget } from '../components/chat/ChatWidget';
import { fetchAllProductCategoriesServer } from '../lib/cms-server';

export const Route = createFileRoute('/_public')({
  loader: async () => {
    const categories = await fetchAllProductCategoriesServer();
    return { categories };
  },
  component: PublicLayout,
})

function PublicLayout() {
  const { categories } = Route.useLoaderData();
  return (
    <>
      <ScrollRestoration />
      <AnalyticsTracker />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer initialCategories={categories} />
      <FloatingWhatsApp />
      <ChatWidget />
    </>
  )
}
