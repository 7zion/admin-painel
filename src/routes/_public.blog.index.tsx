import { createFileRoute } from '@tanstack/react-router'
import { BlogHero } from '../components/moraes/blog/BlogHero';
import { BlogFeatured } from '../components/moraes/blog/BlogFeatured';
import { BlogCategories } from '../components/moraes/blog/BlogCategories';
import { BlogList } from '../components/moraes/blog/BlogList';
import { BlogCTA } from '../components/moraes/blog/BlogCTA';
import { fetchAllBlogPostsServer, fetchAllBlogCategoriesServer } from '../lib/cms-server';
import { BlogPost, BlogCategory } from '../types/admin';

export const Route = createFileRoute('/_public/blog/')({
  loader: async () => {
    const posts = await fetchAllBlogPostsServer();
    const categories = await fetchAllBlogCategoriesServer();
    return { 
      posts: posts as BlogPost[],
      categories: categories as BlogCategory[]
    };
  },
  validateSearch: (search: Record<string, unknown>): { categoria?: string } => {
    return {
      categoria: search.categoria as string | undefined,
    }
  },
  component: Blog,
  head: () => ({
    meta: [
      { title: 'Projetos | Moraes Tijolos Revestimento' },
      { name: 'description', content: 'Inspiração, ideias e conhecimento para transformar seus espaços.' },
    ]
  }),
})

function Blog() {
  const { posts, categories } = Route.useLoaderData();
  const search = Route.useSearch();
  
  const filteredPosts = search.categoria 
    ? posts.filter(p => (p.category || 'Sem Categoria').toLowerCase() === search.categoria?.toLowerCase())
    : posts;

  let featuredPost = null;
  let listPosts = [...filteredPosts];

  if (filteredPosts.length > 0) {
    const featuredIndex = filteredPosts.findIndex(p => p.isFeatured);
    if (featuredIndex !== -1) {
      featuredPost = filteredPosts[featuredIndex];
      listPosts.splice(featuredIndex, 1);
    } else {
      featuredPost = filteredPosts[0];
      listPosts.splice(0, 1);
    }
  }

  return (
    <main className="w-full bg-[#F9F8F6]">
      <BlogHero />
      {featuredPost && <BlogFeatured post={featuredPost} />}
      <BlogCategories currentCategory={search.categoria} categories={categories} />
      <BlogList posts={listPosts} />
      <BlogCTA />
    </main>
  );
}
