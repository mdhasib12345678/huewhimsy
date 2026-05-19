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
      <div className="container-reading section-y">
        <div className="h-12 bg-black/[0.04] animate-pulse rounded mb-6" />
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-4 bg-black/[0.04] animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="container-page section-y-lg text-center max-w-2xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#0a0a0a] mb-3 sm:mb-4">{fallbackTitle ?? 'Page coming soon'}</h1>
        <p className="text-sm sm:text-base text-[#525252] mb-6 sm:mb-8">
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
      className="container-reading section-y"
    >
      <SEO
        title={page.meta_title ?? page.title}
        description={page.meta_description ?? page.excerpt ?? undefined}
        image={page.og_image ?? undefined}
      />
      <h1 className="fluid-h1 font-bold text-[#0a0a0a] mb-5 sm:mb-7">{page.title}</h1>
      {page.published_at && (
        <p className="text-xs sm:text-sm text-[#525252] mb-6 sm:mb-8">
          Last updated {new Date(page.published_at).toLocaleDateString()}
        </p>
      )}
      <div
        className="prose prose-lg max-w-none text-[#0a0a0a] [&_h2]:text-xl [&_h2]:sm:text-2xl [&_h2]:font-bold [&_h2]:mt-7 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:sm:text-xl [&_h3]:font-bold [&_h3]:mt-5 [&_h3]:mb-2.5 [&_p]:mb-4 [&_p]:leading-relaxed [&_a]:text-[#FF5F6D] [&_a]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_li]:mb-1"
        dangerouslySetInnerHTML={{ __html: page.body }}
      />
    </motion.div>
  );
};

export const Privacy: React.FC = () => <StaticPage slug="privacy" fallbackTitle="Privacy Policy" />;
export const Terms: React.FC = () => <StaticPage slug="terms" fallbackTitle="Terms of Service" />;
export const Refund: React.FC = () => <StaticPage slug="refund" fallbackTitle="Refund Policy" />;
export const Shipping: React.FC = () => <StaticPage slug="shipping" fallbackTitle="Shipping Information" />;
