import { useEffect } from 'react';
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

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string, attrs: Record<string, string> = {}) {
  const selector = Object.entries(attrs)
    .map(([k, v]) => `[${k}="${v}"]`)
    .join('');
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]${selector}`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function upsertJsonLd(id: string, json: unknown) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.id = id;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(json);
}

function removeAllAlternates() {
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove());
}

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
  useEffect(() => {
    const fullTitle = title ? `${title} — HueWhimsy` : 'HueWhimsy — Whimsical Books & Creative Learning';
    document.title = fullTitle;

    const canonicalUrl =
      canonical ?? `${SITE_URL}${typeof window !== 'undefined' ? window.location.pathname : '/'}`;

    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', noindex ? 'noindex,nofollow' : 'index,follow');

    upsertLink('canonical', canonicalUrl);

    removeAllAlternates();
    SUPPORTED_LOCALES.forEach((l) => {
      const path = canonicalUrl.replace(SITE_URL, '').replace(/^\/+/, '/') || '/';
      const href = l === 'en' ? `${SITE_URL}${path}` : `${SITE_URL}/${l}${path === '/' ? '' : path}`;
      upsertLink('alternate', href, { hreflang: l });
    });
    upsertLink('alternate', canonicalUrl, { hreflang: 'x-default' });

    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:image', image);
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:site_name', 'HueWhimsy');
    upsertMeta('property', 'og:locale', locale);

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', image);

    upsertJsonLd('jsonld-org', ORG_JSON_LD);
    upsertJsonLd('jsonld-website', WEBSITE_JSON_LD);

    if (jsonLd) {
      const items = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      items.forEach((j, i) => upsertJsonLd(`jsonld-page-${i}`, j));
    } else {
      document.querySelectorAll('script[id^="jsonld-page-"]').forEach((el) => el.remove());
    }
  }, [title, description, image, type, canonical, locale, noindex, jsonLd]);

  return null;
};
