import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useRainbow } from '@/components/RainbowContext';
import { getPage, type StaticPage as StaticPageType } from '@/lib/medusa';
import { SEO } from '@/components/SEO';

interface Props {
  slug: string;
  fallbackTitle?: string;
}

export const StaticPage: React.FC<Props> = ({ slug, fallbackTitle }) => {
  const { setIntensity } = useRainbow();
  const [page, setPage] = useState<StaticPageType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIntensity(0.2);
    return () => setIntensity(0.7);
  }, []);

  useEffect(() => {
    setLoading(true);
    void getPage(slug)
      .then(setPage)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-3xl">
        <div className="h-16 bg-gray-100 animate-pulse rounded mb-8" />
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-100 animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="container mx-auto px-4 py-32 text-center max-w-2xl">
        <h1 className="text-4xl font-bold text-[#0a0a0a] mb-4">{fallbackTitle ?? 'Page coming soon'}</h1>
        <p className="text-[#525252] mb-8">
          This page is being prepared. Check back soon, or contact us if you need this information urgently.
        </p>
        <a href="/contact" className="text-[#FF5F6D] underline">
          Contact us
        </a>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 py-20 max-w-3xl"
    >
      <SEO
        title={page.meta_title ?? page.title}
        description={page.meta_description ?? page.excerpt ?? undefined}
        image={page.og_image ?? undefined}
      />
      <h1 className="text-4xl md:text-6xl font-bold text-[#0a0a0a] mb-8">{page.title}</h1>
      {page.published_at && (
        <p className="text-sm text-[#525252] mb-8">
          Last updated {new Date(page.published_at).toLocaleDateString()}
        </p>
      )}
      <div
        className="prose prose-lg max-w-none text-[#0a0a0a] [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-6 [&_h3]:mb-3 [&_p]:mb-4 [&_a]:text-[#FF5F6D] [&_a]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_li]:mb-1"
        dangerouslySetInnerHTML={{ __html: page.body }}
      />
    </motion.div>
  );
};

export const Privacy: React.FC = () => <StaticPage slug="privacy" fallbackTitle="Privacy Policy" />;
export const Terms: React.FC = () => <StaticPage slug="terms" fallbackTitle="Terms of Service" />;
export const Refund: React.FC = () => <StaticPage slug="refund" fallbackTitle="Refund Policy" />;
export const Shipping: React.FC = () => <StaticPage slug="shipping" fallbackTitle="Shipping Information" />;
