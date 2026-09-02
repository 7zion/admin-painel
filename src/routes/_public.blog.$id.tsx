import { createFileRoute, Link } from '@tanstack/react-router'
import { BlogPostContent } from '../components/moraes/blog/BlogPostContent';
import { BlogPostHero } from '../components/moraes/blog/BlogPostHero';
import { BlogList } from '../components/moraes/blog/BlogList';
import { ProjetosCTA } from '../components/moraes/projetos/ProjetosCTA';
import { ChevronRight, CheckCircle2 } from 'lucide-react';
import { fetchBlogPostServer, fetchAllBlogPostsServer } from '../lib/cms-server';
import { BlogPost } from '../types/admin';

export const Route = createFileRoute('/_public/blog/$id')({
  loader: async ({ params }) => {
    const post = await fetchBlogPostServer({ data: params.id });
    const allPosts = await fetchAllBlogPostsServer();
    return {
      post: post as BlogPost | null,
      relatedPosts: allPosts.filter((p: any) => p.id !== post?.id).slice(0, 3) as BlogPost[]
    };
  },
  component: Post,
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    if (post) {
      return {
        meta: [
          { title: `${post.title} | Blog Moraes` },
          { name: 'description', content: post.summary },
        ]
      }
    }
    return {
      meta: [
        { title: 'Artigo | Blog Moraes' },
        { name: 'description', content: 'Artigo do blog Moraes.' },
      ]
    }
  },
})

function Post() {
  const { post, relatedPosts } = Route.useLoaderData();
  
  if (!post) return <div className="py-20 text-center text-brand-text">Artigo não encontrado.</div>;

  return (
    <main className="w-full bg-[#F9F8F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center flex-wrap gap-2 text-xs text-brand-text/60 font-medium">
          <Link to="/blog" search={{ categoria: undefined }} className="hover:text-brand-rust transition-colors">Projetos</Link>
          <ChevronRight className="w-3 h-3" />
          {post.category && (
            <>
              <Link to="/blog" search={{ categoria: post.category.toLowerCase() }} className="hover:text-brand-rust transition-colors">
                {post.category}
              </Link>
              <ChevronRight className="w-3 h-3" />
            </>
          )}
          <span className="text-brand-text font-bold line-clamp-1">{post.title}</span>
        </div>
      </div>
      
      <BlogPostHero post={post} />
      <BlogPostContent post={post} />
      
      {/* Motivos / Diferenciais Hardcoded (inspirado na imagem) */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col lg:flex-row gap-12 items-center">
             <div className="lg:w-1/2">
                <div className="aspect-[16/10] bg-gray-100 rounded-sm overflow-hidden">
                   <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop" alt="Motivos" className="w-full h-full object-cover" />
                </div>
             </div>
             <div className="lg:w-1/2">
                <h2 className="font-serif text-3xl font-bold text-brand-text mb-6">Por que os revestimentos Moraes foram ideais para este projeto?</h2>
                <p className="text-sm text-brand-text/70 mb-6 leading-relaxed">
                  Escolhidos para unir beleza, durabilidade e sensorialidade, os revestimentos Moraes valorizam a arquitetura e elevam a experiência dos ambientes.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-brand-rust shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-brand-text">Texturas naturais que trazem aconchego e personalidade.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-brand-rust shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-brand-text">Materiais de alta performance para áreas internas e externas.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-brand-rust shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-brand-text">Facilidade de manutenção com resistência e durabilidade.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-brand-rust shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-brand-text">Harmonia entre tonalidades terrosas e elementos naturais.</span>
                  </li>
                </ul>
             </div>
           </div>
        </div>
      </section>

      {/* Projetos Relacionados */}
      {relatedPosts && relatedPosts.length > 0 && (
        <section className="py-16 bg-[#F9F8F6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-2xl font-bold text-brand-text mb-8">Outros projetos</h2>
            <BlogList posts={relatedPosts} />
          </div>
        </section>
      )}
      
      <ProjetosCTA />
    </main>
  );
}
