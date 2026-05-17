import React, { useEffect, useState } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import { useRainbow } from '@/components/RainbowContext';
import { getBlogPost, type BlogPost as BlogPostType } from '@/lib/medusa';
import { SEO } from '@/components/SEO';

export const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { setIntensity } = useRainbow();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIntensity(0.3);
    return () => setIntensity(0.7);
  }, []);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    void getBlogPost(slug)
      .then(setPost)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-3xl">
        <div className="h-10 w-32 bg-gray-100 animate-pulse rounded mb-8" />
        <div className="h-16 bg-gray-100 animate-pulse rounded mb-4" />
        <div className="aspect-video bg-gray-100 animate-pulse rounded-2xl mb-8" />
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-100 animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="text-4xl font-bold text-[#0a0a0a] mb-4">Post not found</h1>
        <p className="text-[#525252] mb-8">This blog post doesn't exist or hasn't been published yet.</p>
        <NavLink to="/blog" className="text-[#FF5F6D] underline">
          Back to all posts
        </NavLink>
      </div>
    );
  }

  const postJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.cover_image ?? undefined,
    datePublished: post.published_at ?? undefined,
    author: post.author_name ? { '@type': 'Person', name: post.author_name } : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'HueWhimsy',
      logo: { '@type': 'ImageObject', url: 'https://huewhimsy.com/logo.png' },
    },
    mainEntityOfPage: `https://huewhimsy.com/blog/${post.slug}`,
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 py-20 max-w-3xl"
    >
      <SEO
        title={post.meta_title ?? post.title}
        description={post.meta_description ?? post.excerpt ?? undefined}
        image={post.og_image ?? post.cover_image ?? undefined}
        type="article"
        jsonLd={postJsonLd}
      />
      <NavLink to="/blog" className="inline-flex items-center gap-2 text-sm text-[#525252] hover:text-[#0a0a0a] mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to blog
      </NavLink>

      <div className="flex items-center gap-3 mb-4 text-sm text-[#525252]">
        {post.category && <Badge className="bg-[#FFD93D] text-[#0a0a0a]">{post.category}</Badge>}
        {post.published_at && <span>{new Date(post.published_at).toLocaleDateString()}</span>}
        {post.read_time_minutes && <span>· {post.read_time_minutes} min read</span>}
      </div>

      <h1 className="text-4xl md:text-6xl font-bold text-[#0a0a0a] mb-6 leading-tight">{post.title}</h1>

      {post.excerpt && (
        <p className="text-xl text-[#525252] mb-8 italic">{post.excerpt}</p>
      )}

      {post.cover_image && (
        <div className="aspect-video rounded-2xl overflow-hidden mb-12 bg-gray-100">
          <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div
        className="prose prose-lg max-w-none text-[#0a0a0a] [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-6 [&_h3]:mb-3 [&_p]:mb-4 [&_a]:text-[#FF5F6D] [&_a]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_li]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-[#FFD93D] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-[#525252] [&_code]:bg-[#F5F5F5] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm"
        dangerouslySetInnerHTML={{ __html: post.body }}
      />

      {post.author_name && (
        <div className="mt-16 pt-8 border-t border-black/10 flex items-center gap-4">
          {post.author_avatar ? (
            <img src={post.author_avatar} alt={post.author_name} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#FFD93D]/30 flex items-center justify-center font-bold">
              {post.author_name.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-bold text-[#0a0a0a]">{post.author_name}</p>
            <p className="text-sm text-[#525252]">Hue Whimsy Author</p>
          </div>
        </div>
      )}

      {post.tags && post.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-[#F5F5F5] text-[#525252]">
              #{tag}
            </Badge>
          ))}
        </div>
      )}
    </motion.article>
  );
};
