import React from 'react';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { BlogPost } from '../../../types/admin';

const contentSanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), 'iframe', 'video', 'source', 'u', 'br'],
  attributes: {
    ...defaultSchema.attributes,
    p: [...(defaultSchema.attributes?.p || []), 'style', 'class'],
    span: [...(defaultSchema.attributes?.span || []), 'style'],
    img: [...(defaultSchema.attributes?.img || []), 'style', 'width', 'height'],
    iframe: ['src', 'width', 'height', 'allow', 'allowfullscreen', 'frameborder', 'title', 'style'],
    video: ['src', 'controls', 'width', 'height', 'style'],
    source: ['src', 'type'],
    br: ['class'],
  },
  protocols: {
    ...defaultSchema.protocols,
    src: ['http', 'https'],
  },
};

export function BlogPostContent({ post }: { post: BlogPost }) {
  // Garante que parágrafos vazios do Tiptap (<p></p> ou <p><br></p>) mantenham quebra de linha visual no HTML
  const formattedContent = (post.content || '')
    .replace(/<p><\/p>/g, '<p><br/></p>')
    .replace(/<p>\s*<\/p>/g, '<p><br/></p>');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="lg:w-1/3">
          <h2 className="font-serif text-3xl font-bold text-brand-text mb-6">
            Sobre o projeto
          </h2>
        </div>
        <div className="lg:w-2/3 prose prose-sm sm:prose-base prose-p:text-brand-text/80 prose-headings:font-serif prose-headings:text-brand-text prose-a:text-brand-rust hover:prose-a:text-brand-rust/80 max-w-none">
          <Markdown rehypePlugins={[rehypeRaw, [rehypeSanitize, contentSanitizeSchema]]}>{formattedContent}</Markdown>
        </div>
      </div>
    </div>
  );
}
