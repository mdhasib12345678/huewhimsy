import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRainbow } from '@/components/RainbowContext';
import { listBlogPosts, type BlogPost } from '@/lib/medusa';
import { SEO } from '@/components/SEO';

export const Blog: React.FC = () => {
  const { setIntensity } = useRainbow();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIntensity(0.4);
    return () => setIntensity(0.7);
  }, []);

  useEffect(() => {
    void listBlogPosts({ limit: 30 })
      .then((res) => setPosts(res.posts))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container-page section-y">
      <SEO
        title="The Whimsy Journal — Blog"
        description="Phonics tips, free activities, and stories from the Rilo & Rivy creator team."
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10 sm:mb-14 max-w-3xl mx-auto"
      >
        <h1 className="fluid-h1 font-bold text-[#0a0a0a] mb-4 sm:mb-5">The Whimsy Journal</h1>
        <p className="fluid-lead text-[#525252]">
          Phonics tips, free activities, and stories from the Rilo &amp; Rivy creator team.
        </p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-80 rounded-3xl bg-black/[0.04] animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl sm:text-2xl text-[#525252] mb-4">📝 No posts yet</p>
          <p className="text-[#525252]">Check back soon — we're publishing weekly!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <NavLink to={`/blog/${post.slug}`} className="group block h-full">
                <Card className="overflow-hidden border border-black/[0.07] bg-white shadow-sm hover:shadow-lg hover:border-black/[0.15] transition-all h-full rounded-3xl flex flex-col">
                  <CardContent className="p-0 flex flex-col h-full">
                    {post.cover_image ? (
                      <div className="aspect-[16/10] overflow-hidden bg-black/[0.03]">
                        <img
                          src={post.cover_image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[16/10] bg-gradient-to-br from-[#FF5F6D]/15 via-[#FFD93D]/15 to-[#4DA8FF]/15 flex items-center justify-center">
                        <span className="text-4xl sm:text-5xl">📖</span>
                      </div>
                    )}
                    <div className="p-5 sm:p-6 flex flex-col flex-grow">
                      <div className="flex items-center gap-2 sm:gap-3 mb-3 text-xs text-[#525252] flex-wrap">
                        {post.category && (
                          <Badge variant="secondary" className="bg-[#FFD93D]/15 text-[#0a0a0a] border border-[#FFD93D]/30 text-[10px] sm:text-xs">
                            {post.category}
                          </Badge>
                        )}
                        {post.published_at && (
                          <span className="text-[11px]">{new Date(post.published_at).toLocaleDateString()}</span>
                        )}
                        {post.read_time_minutes && (
                          <span className="text-[11px]">· {post.read_time_minutes} min read</span>
                        )}
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-[#0a0a0a] group-hover:text-[#FF5F6D] transition-colors mb-2 sm:mb-3 leading-snug">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-sm text-[#525252] line-clamp-3 leading-relaxed">{post.excerpt}</p>
                      )}
                      {post.author_name && (
                        <p className="text-xs text-[#525252] mt-auto pt-4">— {post.author_name}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </NavLink>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
