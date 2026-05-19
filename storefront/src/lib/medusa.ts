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

export interface MedusaProductCategory {
  id: string;
  name: string;
  handle: string;
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
  categories?: MedusaProductCategory[];
  metadata?: Record<string, unknown> | null;
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
  qs.set(
    'fields',
    '*variants.calculated_price,*variants.prices,+images,*type,*collection,*tags,*categories,+metadata',
  );
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

// ---- Cart ----
export interface MedusaLineItem {
  id: string;
  variant_id: string;
  product_id: string;
  product_title: string;
  variant_title?: string;
  product_handle?: string;
  thumbnail?: string | null;
  quantity: number;
  unit_price: number;
  total?: number;
  subtotal?: number;
}

export interface MedusaCart {
  id: string;
  region_id?: string;
  email?: string | null;
  currency_code: string;
  items?: MedusaLineItem[];
  total?: number;
  subtotal?: number;
  shipping_total?: number;
  tax_total?: number;
  item_total?: number;
}

const CART_KEY = 'huewhimsy_cart_id';
export const getStoredCartId = (): string | null => {
  try {
    return localStorage.getItem(CART_KEY);
  } catch {
    return null;
  }
};
export const storeCartId = (id: string): void => {
  try {
    localStorage.setItem(CART_KEY, id);
  } catch {}
};
export const clearStoredCartId = (): void => {
  try {
    localStorage.removeItem(CART_KEY);
  } catch {}
};

const CART_FIELDS =
  'id,region_id,email,currency_code,total,subtotal,shipping_total,tax_total,item_total,' +
  '*items,*items.variant,*items.product';

export async function createCart(regionId?: string): Promise<MedusaCart> {
  const res = await storeFetch<{ cart: MedusaCart }>(
    `/store/carts?fields=${encodeURIComponent(CART_FIELDS)}`,
    {
      method: 'POST',
      body: JSON.stringify({ region_id: regionId ?? DEFAULT_REGION_ID }),
    },
  );
  return res.cart;
}

export async function getCart(cartId: string): Promise<MedusaCart | null> {
  try {
    const res = await storeFetch<{ cart: MedusaCart }>(
      `/store/carts/${cartId}?fields=${encodeURIComponent(CART_FIELDS)}`,
    );
    return res.cart;
  } catch (e) {
    console.warn('getCart failed:', e);
    return null;
  }
}

export async function addLineItem(
  cartId: string,
  variantId: string,
  quantity = 1,
): Promise<MedusaCart> {
  const res = await storeFetch<{ cart: MedusaCart }>(
    `/store/carts/${cartId}/line-items?fields=${encodeURIComponent(CART_FIELDS)}`,
    {
      method: 'POST',
      body: JSON.stringify({ variant_id: variantId, quantity }),
    },
  );
  return res.cart;
}

export async function updateLineItem(
  cartId: string,
  lineId: string,
  quantity: number,
): Promise<MedusaCart> {
  const res = await storeFetch<{ cart: MedusaCart }>(
    `/store/carts/${cartId}/line-items/${lineId}?fields=${encodeURIComponent(CART_FIELDS)}`,
    {
      method: 'POST',
      body: JSON.stringify({ quantity }),
    },
  );
  return res.cart;
}

export async function removeLineItem(
  cartId: string,
  lineId: string,
): Promise<MedusaCart> {
  // Medusa v2 DELETE returns either {cart} or {parent} (the updated cart).
  // After deletion, re-fetch the cart to get the canonical state with totals.
  await storeFetch<unknown>(
    `/store/carts/${cartId}/line-items/${lineId}`,
    {
      method: 'DELETE',
    },
  );
  const fresh = await getCart(cartId);
  if (!fresh) throw new Error('Cart vanished after line item removal');
  return fresh;
}

export async function ensureCart(): Promise<MedusaCart> {
  const stored = getStoredCartId();
  if (stored) {
    const c = await getCart(stored);
    if (c) return c;
    clearStoredCartId();
  }
  const c = await createCart();
  storeCartId(c.id);
  return c;
}

// ---- Customer auth ----
const AUTH_KEY = 'huewhimsy_auth_token';
export const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem(AUTH_KEY);
  } catch {
    return null;
  }
};
export const setAuthToken = (token: string): void => {
  try {
    localStorage.setItem(AUTH_KEY, token);
  } catch {}
};
export const clearAuthToken = (): void => {
  try {
    localStorage.removeItem(AUTH_KEY);
  } catch {}
};

export interface MedusaCustomer {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  has_account?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MedusaOrder {
  id: string;
  display_id?: number;
  status: string;
  fulfillment_status?: string;
  payment_status?: string;
  total: number;
  subtotal?: number;
  currency_code: string;
  created_at: string;
  items?: MedusaLineItem[];
}

async function authFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const url = `${BASE_URL.replace(/\/$/, '')}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-publishable-api-key': PUBLISHABLE_KEY,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers as Record<string, string> | undefined),
  };
  const res = await fetch(url, { ...init, headers, credentials: 'include' });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Medusa ${res.status} ${res.statusText}: ${text.slice(0, 300)}`);
  }
  return res.json() as Promise<T>;
}

/** Step 1 of register: obtain pre-auth token, then call createCustomer with that token. */
export async function registerAuth(email: string, password: string): Promise<string> {
  const url = `${BASE_URL.replace(/\/$/, '')}/auth/customer/emailpass/register`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-publishable-api-key': PUBLISHABLE_KEY },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Register failed (${res.status}): ${text.slice(0, 200)}`);
  }
  const data: { token: string } = await res.json();
  return data.token;
}

/** Step 2 of register: create the customer profile using the pre-auth token. */
export async function createCustomer(
  preAuthToken: string,
  payload: { email: string; first_name?: string; last_name?: string; phone?: string },
): Promise<MedusaCustomer> {
  const url = `${BASE_URL.replace(/\/$/, '')}/store/customers`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': PUBLISHABLE_KEY,
      Authorization: `Bearer ${preAuthToken}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Create customer failed (${res.status}): ${text.slice(0, 200)}`);
  }
  const data: { customer: MedusaCustomer } = await res.json();
  return data.customer;
}

/** Register + create customer + login in one go. Returns the auth token (already stored). */
export async function registerCustomer(payload: {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}): Promise<{ customer: MedusaCustomer; token: string }> {
  const { email, password, first_name, last_name, phone } = payload;
  const preToken = await registerAuth(email, password);
  const customer = await createCustomer(preToken, { email, first_name, last_name, phone });
  // After /store/customers the pre-auth token is the customer token.
  setAuthToken(preToken);
  return { customer, token: preToken };
}

export async function loginCustomer(email: string, password: string): Promise<string> {
  const url = `${BASE_URL.replace(/\/$/, '')}/auth/customer/emailpass`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-publishable-api-key': PUBLISHABLE_KEY },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Login failed (${res.status}): ${text.slice(0, 200)}`);
  }
  const data: { token: string } = await res.json();
  setAuthToken(data.token);
  return data.token;
}

export async function getCurrentCustomer(): Promise<MedusaCustomer | null> {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const res = await authFetch<{ customer: MedusaCustomer }>('/store/customers/me');
    return res.customer;
  } catch (e) {
    console.warn('getCurrentCustomer failed:', e);
    return null;
  }
}

export async function logoutCustomer(): Promise<void> {
  try {
    await authFetch<unknown>('/auth/session', { method: 'DELETE' });
  } catch {}
  clearAuthToken();
}

export interface CartAddress {
  first_name?: string;
  last_name?: string;
  phone?: string;
  address_1: string;
  address_2?: string;
  city: string;
  postal_code: string;
  province?: string;
  country_code: string;
  company?: string;
}

export async function updateCart(
  cartId: string,
  payload: {
    email?: string;
    shipping_address?: CartAddress;
    billing_address?: CartAddress;
  },
): Promise<MedusaCart> {
  const res = await authFetch<{ cart: MedusaCart }>(
    `/store/carts/${cartId}?fields=${encodeURIComponent(CART_FIELDS)}`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
  return res.cart;
}

export async function attachCustomerToCart(cartId: string): Promise<MedusaCart> {
  const res = await authFetch<{ cart: MedusaCart }>(
    `/store/carts/${cartId}/customer?fields=${encodeURIComponent(CART_FIELDS)}`,
    {
      method: 'POST',
      body: JSON.stringify({}),
    },
  );
  return res.cart;
}

export async function listCustomerOrders(limit = 20): Promise<MedusaOrder[]> {
  try {
    const res = await authFetch<{ orders: MedusaOrder[] }>(
      `/store/orders?limit=${limit}&fields=id,display_id,status,fulfillment_status,payment_status,total,currency_code,created_at`,
    );
    return res.orders ?? [];
  } catch (e) {
    console.warn('listCustomerOrders failed:', e);
    return [];
  }
}

// ---- Checkout: shipping + payment + complete-cart ----

export interface ShippingOption {
  id: string;
  name: string;
  amount: number;
  price_type?: string;
  service_zone_id?: string;
  shipping_profile_id?: string;
  provider_id?: string;
  data?: Record<string, unknown>;
}

export async function listCartShippingOptions(cartId: string): Promise<ShippingOption[]> {
  try {
    const res = await storeFetch<{ shipping_options: ShippingOption[] }>(
      `/store/shipping-options?cart_id=${encodeURIComponent(cartId)}`,
    );
    return res.shipping_options ?? [];
  } catch (e) {
    console.warn('listCartShippingOptions failed:', e);
    return [];
  }
}

export async function addShippingMethodToCart(
  cartId: string,
  optionId: string,
  data?: Record<string, unknown>,
): Promise<MedusaCart> {
  const res = await storeFetch<{ cart: MedusaCart }>(
    `/store/carts/${cartId}/shipping-methods?fields=${encodeURIComponent(CART_FIELDS)}`,
    {
      method: 'POST',
      body: JSON.stringify({ option_id: optionId, ...(data ? { data } : {}) }),
    },
  );
  return res.cart;
}

export interface PaymentProviderInfo {
  id: string;
  is_enabled: boolean;
}

export async function listPaymentProviders(regionId?: string): Promise<PaymentProviderInfo[]> {
  try {
    const qs = regionId ? `?region_id=${encodeURIComponent(regionId)}` : '';
    const res = await storeFetch<{ payment_providers: PaymentProviderInfo[] }>(
      `/store/payment-providers${qs}`,
    );
    return res.payment_providers ?? [];
  } catch (e) {
    console.warn('listPaymentProviders failed:', e);
    return [];
  }
}

export interface PaymentCollection {
  id: string;
  amount: number;
  currency_code: string;
  status: string;
  payment_sessions?: { id: string; provider_id: string; status: string; data?: Record<string, unknown> }[];
}

export async function createPaymentCollection(cartId: string): Promise<PaymentCollection | null> {
  try {
    const res = await storeFetch<{ payment_collection: PaymentCollection }>(
      `/store/payment-collections`,
      {
        method: 'POST',
        body: JSON.stringify({ cart_id: cartId }),
      },
    );
    return res.payment_collection;
  } catch (e) {
    // If a payment collection already exists for the cart, Medusa returns 4xx.
    // The caller falls back to reading it off the cart object.
    console.warn('createPaymentCollection failed (may already exist):', e);
    return null;
  }
}

export async function initPaymentSession(
  collectionId: string,
  providerId: string,
  data?: Record<string, unknown>,
): Promise<PaymentCollection> {
  const res = await storeFetch<{ payment_collection: PaymentCollection }>(
    `/store/payment-collections/${collectionId}/payment-sessions`,
    {
      method: 'POST',
      body: JSON.stringify({ provider_id: providerId, ...(data ? { data } : {}) }),
    },
  );
  return res.payment_collection;
}

export interface CompletedOrder extends MedusaOrder {
  email?: string;
}

export async function completeCart(cartId: string): Promise<
  | { type: 'order'; order: CompletedOrder }
  | { type: 'cart'; cart: MedusaCart; error?: string }
> {
  const url = `${BASE_URL.replace(/\/$/, '')}/store/carts/${cartId}/complete`;
  const token = getAuthToken();
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': PUBLISHABLE_KEY,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
  });
  const text = await res.text();
  let json: any = {};
  try { json = text ? JSON.parse(text) : {}; } catch { /* keep empty */ }
  if (!res.ok) {
    throw new Error(json?.message || `Complete cart failed (${res.status})`);
  }
  if (json.type === 'order' && json.order) return { type: 'order', order: json.order };
  if (json.type === 'cart' && json.cart) return { type: 'cart', cart: json.cart, error: json.error };
  // Some versions return { order } directly on success.
  if (json.order) return { type: 'order', order: json.order };
  if (json.cart) return { type: 'cart', cart: json.cart };
  throw new Error('Unexpected complete-cart response');
}

// =============================================================================
// Phase 3 — CMS module fetchers (Blog, Endorsements, FAQ, Hero, Services,
// Activities, Newsletter, Contact, Wishlist, Reviews, Pages)
// =============================================================================

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  cover_image: string | null;
  author_name: string | null;
  author_avatar: string | null;
  category: string | null;
  tags: string[] | null;
  read_time_minutes: number | null;
  status: string;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  og_image: string | null;
  created_at: string;
}

export async function listBlogPosts(params: { limit?: number; offset?: number; category?: string; locale?: string; q?: string } = {}) {
  const qs = new URLSearchParams();
  qs.set('limit', String(params.limit ?? 20));
  if (params.offset) qs.set('offset', String(params.offset));
  if (params.category) qs.set('category', params.category);
  if (params.locale) qs.set('locale', params.locale);
  if (params.q) qs.set('q', params.q);
  return storeFetch<{ posts: BlogPost[]; count: number; limit: number; offset: number }>(`/store/blog?${qs}`);
}

export async function getBlogPost(slug: string, locale?: string): Promise<BlogPost | null> {
  try {
    const qs = locale ? `?locale=${locale}` : '';
    const res = await storeFetch<{ post: BlogPost }>(`/store/blog/${slug}${qs}`);
    return res.post;
  } catch {
    return null;
  }
}

export interface Endorsement {
  id: string;
  name: string;
  role: string | null;
  quote: string;
  rating: number | null;
  avatar: string | null;
  location: string | null;
  display_order: number;
}

export async function listEndorsements(params: { limit?: number; locale?: string } = {}) {
  const qs = new URLSearchParams();
  qs.set('limit', String(params.limit ?? 20));
  if (params.locale) qs.set('locale', params.locale);
  return storeFetch<{ endorsements: Endorsement[]; count: number }>(`/store/endorsements?${qs}`);
}

export interface FaqEntry {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  display_order: number;
}

export async function listFaqs(params: { category?: string; locale?: string; limit?: number } = {}) {
  const qs = new URLSearchParams();
  qs.set('limit', String(params.limit ?? 50));
  if (params.category) qs.set('category', params.category);
  if (params.locale) qs.set('locale', params.locale);
  return storeFetch<{ faqs: FaqEntry[]; count: number }>(`/store/faq?${qs}`);
}

export interface HeroBanner {
  id: string;
  placement: string;
  title: string;
  subtitle: string | null;
  cta_label: string | null;
  cta_url: string | null;
  image: string | null;
  mobile_image: string | null;
  video_url: string | null;
  text_color: string | null;
  display_order: number;
}

export async function listHeroBanners(placement: string, locale?: string): Promise<HeroBanner[]> {
  try {
    const qs = new URLSearchParams();
    qs.set('placement', placement);
    qs.set('limit', '10');
    if (locale) qs.set('locale', locale);
    const res = await storeFetch<{ banners: HeroBanner[] }>(`/store/hero?${qs}`);
    return res.banners ?? [];
  } catch {
    return [];
  }
}

export async function getHeroBanner(placement: string, locale?: string): Promise<HeroBanner | null> {
  const banners = await listHeroBanners(placement, locale);
  return banners[0] ?? null;
}

export interface ServiceTier {
  label: string;
  price_amount: number;
  currency?: string;
  features?: string[];
}

export interface ServiceOffering {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string;
  icon: string | null;
  cover_image: string | null;
  pricing_tiers: ServiceTier[] | null;
  features: string[] | null;
  display_order: number;
  meta_title: string | null;
  meta_description: string | null;
}

export async function listServices(locale?: string) {
  const qs = new URLSearchParams();
  qs.set('limit', '50');
  if (locale) qs.set('locale', locale);
  return storeFetch<{ services: ServiceOffering[]; count: number }>(`/store/services?${qs}`);
}

export async function getService(slug: string, locale?: string): Promise<ServiceOffering | null> {
  try {
    const qs = locale ? `?locale=${locale}` : '';
    const res = await storeFetch<{ service: ServiceOffering }>(`/store/services/${slug}${qs}`);
    return res.service;
  } catch {
    return null;
  }
}

export interface FreeActivity {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  file_url: string | null;
  thumbnail: string | null;
  category: string | null;
  age_range: string | null;
  pages: number | null;
  requires_subscription: boolean;
  download_gated?: boolean;
  display_order: number;
}

export async function listActivities(params: { category?: string; locale?: string; limit?: number } = {}) {
  const qs = new URLSearchParams();
  qs.set('limit', String(params.limit ?? 50));
  if (params.category) qs.set('category', params.category);
  if (params.locale) qs.set('locale', params.locale);
  return storeFetch<{ activities: FreeActivity[]; count: number }>(`/store/activities?${qs}`);
}

export async function getActivity(slug: string, locale?: string): Promise<FreeActivity | null> {
  try {
    const qs = locale ? `?locale=${locale}` : '';
    const res = await storeFetch<{ activity: FreeActivity }>(`/store/activities/${slug}${qs}`);
    return res.activity;
  } catch {
    return null;
  }
}

export interface NewsletterResult {
  subscriber: { id: string; email: string; status: string };
  already_subscribed?: boolean;
  resubscribed?: boolean;
}

export async function subscribeNewsletter(payload: { email: string; name?: string; source?: string; locale?: string }): Promise<NewsletterResult> {
  return storeFetch<NewsletterResult>('/store/newsletter', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function unsubscribeNewsletter(email: string): Promise<{ ok: boolean }> {
  return storeFetch<{ ok: boolean }>('/store/newsletter/unsubscribe', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function submitContactForm(payload: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  page_url?: string;
  locale?: string;
}) {
  return storeFetch<{ submission: { id: string }; received: boolean }>('/store/contact', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export interface StaticPage {
  id: string;
  slug: string;
  title: string;
  body: string;
  excerpt: string | null;
  cover_image: string | null;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  og_image: string | null;
}

export async function getPage(slug: string, locale?: string): Promise<StaticPage | null> {
  try {
    const qs = locale ? `?locale=${locale}` : '';
    const res = await storeFetch<{ page: StaticPage }>(`/store/pages/${slug}${qs}`);
    return res.page;
  } catch {
    return null;
  }
}

export interface ProductReview {
  id: string;
  product_id: string;
  author_name: string;
  rating: number;
  title: string | null;
  body: string;
  helpful_count: number;
  reply: string | null;
  reply_at: string | null;
  created_at: string;
}

export interface ReviewSummary {
  count: number;
  average: number;
  distribution: Record<string, number>;
}

export async function listReviews(productId: string, params: { limit?: number; offset?: number } = {}) {
  const qs = new URLSearchParams();
  qs.set('product_id', productId);
  qs.set('limit', String(params.limit ?? 20));
  if (params.offset) qs.set('offset', String(params.offset));
  return storeFetch<{ reviews: ProductReview[]; summary: ReviewSummary; limit: number; offset: number }>(`/store/reviews?${qs}`);
}

export async function submitReview(payload: {
  product_id: string;
  author_name: string;
  author_email?: string;
  rating: number;
  title?: string;
  body: string;
}) {
  return storeFetch<{ review: ProductReview; pending_moderation: boolean }>('/store/reviews', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function markReviewHelpful(reviewId: string) {
  return storeFetch<{ id: string; helpful_count: number }>(`/store/reviews/${reviewId}/helpful`, { method: 'POST' });
}

export interface WishlistItem {
  id: string;
  product_id: string;
  variant_id: string | null;
  notes: string | null;
  added_at: string;
}

export async function getCustomerWishlist(): Promise<WishlistItem[]> {
  try {
    const res = await authFetch<{ items: WishlistItem[] }>('/store/wishlist');
    return res.items ?? [];
  } catch (e) {
    console.warn('getCustomerWishlist failed:', e);
    return [];
  }
}

export async function addToWishlist(productId: string, variantId?: string, notes?: string) {
  return authFetch<{ item: WishlistItem; already_in_wishlist?: boolean }>('/store/wishlist', {
    method: 'POST',
    body: JSON.stringify({ product_id: productId, variant_id: variantId, notes }),
  });
}

export async function removeFromWishlist(productId: string) {
  return authFetch<{ ok: boolean; removed: boolean }>(`/store/wishlist/${productId}`, { method: 'DELETE' });
}
