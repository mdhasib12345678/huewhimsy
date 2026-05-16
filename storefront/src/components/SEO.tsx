import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SUPPORTED_LOCALES } from '@/i18n';

const SITE_URL = 'https://huewhimsy.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`;

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  canonical?: string;
  locale?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

function buildAlternates(canonical: string) {
  // For each locale produce a hreflang link. canonical is the EN version
  // (no locale prefix). Localised URLs use /{lang}/... prefix.
  const path = canonical.replace(SITE_URL, '').replace(/^\/+/, '/') || '/';
  return SUPPORTED_LOCALES.map((l) => {
    const href = l === 'en' ? `${SITE_URL}${path}` : `${SITE_URL}/${l}${path === '/' ? '' : path}`;
    return { hreflang: l, href };
  });
}

const ORG_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'HueWhimsy',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  sameAs: [
    'https://instagram.com/huewhimsy',
    'https://pinterest.com/huewhimsy',
    'https://x.com/huewhimsy',
    'https://linkedin.com/in/huewhimsy',
    'https://youtube.com/@huewhimsy',
  ],
};

const WEBSITE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'HueWhimsy',
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export const SEO: React.FC<SEOProps> = ({
  title,
  description = "Cozy learning adventures with Rilo and Rivy — whimsical children's books and creative activities for ages 3 to 8.",
  image = DEFAULT_OG_IMAGE,
  type = 'website',
  canonical,
  locale = 'en',
  noindex = false,
  jsonLd,
}) => {
  const fullTitle = title ? `${title} — HueWhimsy` : 'HueWhimsy — Whimsical Books & Creative Learning';
  const canonicalUrl = canonical ?? `${SITE_URL}${typeof window !== 'undefined' ? window.location.pathname : '/'}`;
  const alts = buildAlternates(canonicalUrl);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      <link rel="canonical" href={canonicalUrl} />
      {alts.map((a) => (
        <link key={a.hreflang} rel="alternate" hrefLang={a.hreflang} href={a.href} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="HueWhimsy" />
      <meta property="og:locale" content={locale} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      <script type="application/ld+json">{JSON.stringify(ORG_JSON_LD)}</script>
      <script type="application/ld+json">{JSON.stringify(WEBSITE_JSON_LD)}</script>
      {jsonLd &&
        (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).map((j, i) => (
          <script key={i} type="application/ld+json">
            {JSON.stringify(j)}
          </script>
        ))}
    </Helmet>
  );
};
