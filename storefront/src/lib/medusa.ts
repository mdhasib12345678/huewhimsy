// HueWhimsy Medusa client — minimal fetch wrapper for the v2 /store API.
// All build-time config is supplied via Vite env vars (VITE_*).

const BASE_URL = (import.meta.env.VITE_MEDUSA_BACKEND_URL as string) || '';
const PUBLISHABLE_KEY = (import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY as string) || '';
const DEFAULT_REGION_ID = (import.meta.env.VITE_DEFAULT_REGION_ID as string) || '';

export const medusaConfig = {
  baseUrl: BASE_URL,
  publishableKey: PUBLISHABLE_KEY,
  defaultRegionId: DEFAULT_REGION_ID,
  isConfigured: Boolean(BASE_URL && PUBLISHABLE_KEY),
};

// ---- Types (subset of Medusa Store API) ----
export interface MedusaPrice {
  id: string;
  amount: number;          // Medusa stores prices in major units (e.g. 14.99) for v2
  currency_code: string;
  calculated_amount?: number;
}

export interface MedusaVariant {
  id: string;
  title: string;
  sku?: string | null;
  manage_inventory?: boolean;
  inventory_quantity?: number;
  prices?: MedusaPrice[];
  calculated_price?: {
    calculated_amount: number;
    currency_code: string;
    original_amount?: number;
  };
}

export interface MedusaImage {
  id: string;
  url: string;
}

export interface MedusaProduct {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  handle: string;
  thumbnail?: string | null;
  images?: MedusaImage[];
  variants: MedusaVariant[];
  collection?: { id: string; title: string; handle: string } | null;
  type?: { id: string; value: string } | null;
  tags?: { id: string; value: string }[];
  created_at: string;
  updated_at: string;
}

// ---- Fetch helpers ----
async function storeFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!medusaConfig.isConfigured) {
    throw new Error('Medusa is not configured (VITE_MEDUSA_BACKEND_URL or VITE_MEDUSA_PUBLISHABLE_KEY missing)');
  }
  const url = `${BASE_URL.replace(/\/$/, '')}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-publishable-api-key': PUBLISHABLE_KEY,
    ...(init.headers as Record<string, string> | undefined),
  };
  const res = await fetch(url, { ...init, headers, credentials: 'include' });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Medusa ${res.status} ${res.statusText}: ${text.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

// ---- Products ----
export async function listProducts(params: {
  limit?: number;
  offset?: number;
  q?: string;
  handle?: string;
  region_id?: string;
} = {}): Promise<{ products: MedusaProduct[]; count: number; offset: number; limit: number }> {
  const qs = new URLSearchParams();
  qs.set('fields', '*variants.calculated_price,*variants.prices,+images,*type,*collection,*tags');
  qs.set('limit', String(params.limit ?? 50));
  if (params.offset) qs.set('offset', String(params.offset));
  if (params.q) qs.set('q', params.q);
  if (params.handle) qs.set('handle', params.handle);
  qs.set('region_id', params.region_id ?? DEFAULT_REGION_ID);
  return storeFetch(`/store/products?${qs.toString()}`);
}

export async function getProduct(handle: string, regionId?: string): Promise<MedusaProduct | null> {
  const res = await listProducts({ handle, region_id: regionId, limit: 1 });
  return res.products[0] ?? null;
}

// ---- Price helpers ----
export function variantPrice(variant: MedusaVariant): number {
  // Prefer calculated_price (region-aware), else first listed price.
  const cp = variant.calculated_price?.calculated_amount;
  if (typeof cp === 'number') return cp;
  const p = variant.prices?.[0]?.amount;
  return typeof p === 'number' ? p : 0;
}

export function productPrice(product: MedusaProduct): number {
  return product.variants?.[0] ? variantPrice(product.variants[0]) : 0;
}

export function formatPrice(amount: number, currency = 'USD'): string {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}
