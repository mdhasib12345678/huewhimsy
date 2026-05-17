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
    <div className="container mx-auto px-4 py-20">
      <SEO
        title="The Whimsy Journal — Blog"
        description="Phonics tips, free activities, and stories from the Rilo & Rivy creator team."
      />
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl md:text-7xl font-bold text-[#0a0a0a] mb-4 text-center"
      >
        The Whimsy Journal
      </motion.h1>
      <p className="text-center text-xl text-[#525252] mb-16 max-w-2xl mx-auto">
        Phonics tips, free activities, and stories from the Rilo &amp; Rivy creator team.
      </p>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-80 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-2xl text-[#525252] mb-4">📝 No posts yet</p>
          <p className="text-[#525252]">Check back soon — we're publishing weekly!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <NavLink to={`/blog/${post.slug}`} className="group">
                <Card className="overflow-hidden border-black/10 bg-white shadow-sm hover:shadow-md transition-shadow h-full">
                  <CardContent className="p-0">
                    {post.cover_image ? (
                      <div className="aspect-video overflow-hidden bg-gray-100">
                        <img
                          src={post.cover_image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-[#FF5F6D]/20 via-[#FFD93D]/20 to-[#4DA8FF]/20 flex items-center justify-center">
                        <span className="text-4xl">📖</span>
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-3 text-xs text-[#525252]">
                        {post.category && (
                          <Badge variant="secondary" className="bg-[#F5F5F5] text-[#525252]">
                            {post.category}
                          </Badge>
                        )}
                        {post.published_at && (
                          <span>{new Date(post.published_at).toLocaleDateString()}</span>
                        )}
                        {post.read_time_minutes && <span>· {post.read_time_minutes} min read</span>}
                      </div>
                      <h2 className="text-xl font-bold text-[#0a0a0a] group-hover:text-[#FF5F6D] transition-colors mb-3">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-sm text-[#525252] line-clamp-3">{post.excerpt}</p>
                      )}
                      {post.author_name && (
                        <p className="text-xs text-[#525252] mt-4">— {post.author_name}</p>
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
