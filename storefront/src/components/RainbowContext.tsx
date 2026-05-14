import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import {
  ensureCart,
  getCart,
  getStoredCartId,
  addLineItem,
  updateLineItem,
  removeLineItem,
  storeCartId,
  clearStoredCartId,
  getCurrentCustomer,
  loginCustomer,
  registerCustomer,
  logoutCustomer,
  getAuthToken,
  type MedusaCart,
  type MedusaLineItem,
  type MedusaCustomer,
} from '@/lib/medusa';

export interface UserProfile {
  name: string;
  username: string;
  customerId: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

function customerToProfile(c: MedusaCustomer): UserProfile {
  const first = c.first_name?.trim() ?? '';
  const last = c.last_name?.trim() ?? '';
  const full = [first, last].filter(Boolean).join(' ') || c.email.split('@')[0];
  const username = c.email.split('@')[0].toLowerCase();
  return {
    name: full,
    username,
    customerId: c.id,
    email: c.email,
    firstName: first || undefined,
    lastName: last || undefined,
  };
}

export interface CartItem {
  id: string;          // For Medusa-backed items this is the line_item id.
  productId?: string;  // Medusa product id (if backed)
  variantId?: string;  // Medusa variant id (if backed)
  title: string;
  price: number;
  quantity: number;
  color: string;
  type: 'book' | 'product';
  thumbnail?: string | null;
  handle?: string;
  isLocal?: boolean;   // true => not synced to Medusa (mock data fallback)
}

interface AddToCartInput {
  id?: string;
  productId?: string;
  variantId?: string;
  title: string;
  price: number;
  quantity?: number;
  color?: string;
  type?: 'book' | 'product';
  thumbnail?: string | null;
  handle?: string;
}

interface RainbowContextType {
  intensity: number;
  setIntensity: (val: number) => void;
  lang: string;
  setLang: (l: string) => void;
  cartItems: CartItem[];
  cartCount: number;
  cartId: string | null;
  cartLoading: boolean;
  addToCart: (item: AddToCartInput) => Promise<void> | void;
  removeFromCart: (id: string) => Promise<void> | void;
  updateCartQuantity: (id: string, delta: number) => Promise<void> | void;
  clearCart: () => Promise<void> | void;
  wishlistCount: number;
  wishlistItems: string[];
  toggleWishlist: (id: string) => void;
  user: UserProfile | null;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { email: string; password: string; first_name?: string; last_name?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const RainbowContext = createContext<RainbowContextType | undefined>(undefined);

const PALETTE = ['#FF5F6D', '#4DA8FF', '#FFD93D', '#5BE37D', '#FF9A3C', '#B067FF'];
const colorForKey = (k: string): string => {
  let h = 0;
  for (let i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
};

function mapLineItem(li: MedusaLineItem): CartItem {
  return {
    id: li.id,
    productId: li.product_id,
    variantId: li.variant_id,
    title: li.product_title || li.variant_title || 'Product',
    price: typeof li.unit_price === 'number' ? li.unit_price : 0,
    quantity: li.quantity,
    color: colorForKey(li.product_handle || li.id),
    type: 'product',
    thumbnail: li.thumbnail ?? null,
    handle: li.product_handle,
  };
}

function mergeCart(serverItems: MedusaLineItem[], localOnly: CartItem[]): CartItem[] {
  return [...serverItems.map(mapLineItem), ...localOnly];
}

export const RainbowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [intensity, setIntensity] = useState(1.0);
  const [lang, setLang] = useState('en');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);
  const [cartLoading, setCartLoading] = useState(true);
  const WISHLIST_KEY = 'huewhimsy_wishlist';
  const [wishlistItems, setWishlistItems] = useState<string[]>(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(WISHLIST_KEY) : null;
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
    } catch {
      return [];
    }
  });
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  // Restore Medusa cart on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const id = getStoredCartId();
        if (id) {
          const cart = await getCart(id);
          if (cart && !cancelled) {
            setCartId(cart.id);
            setCartItems(mergeCart(cart.items ?? [], []));
          } else if (!cancelled) {
            clearStoredCartId();
          }
        }
      } catch (e) {
        console.warn('cart hydrate failed:', e);
      } finally {
        if (!cancelled) setCartLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const applyCart = useCallback((cart: MedusaCart) => {
    setCartId(cart.id);
    storeCartId(cart.id);
    setCartItems((prev) => {
      const localOnly = prev.filter((i) => i.isLocal);
      return mergeCart(cart.items ?? [], localOnly);
    });
  }, []);

  const addToCart = useCallback(
    async (input: AddToCartInput) => {
      const qty = Math.max(1, input.quantity ?? 1);
      // Medusa-backed item
      if (input.variantId) {
        try {
          const cart = await ensureCart();
          setCartId(cart.id);
          storeCartId(cart.id);
          const updated = await addLineItem(cart.id, input.variantId, qty);
          applyCart(updated);
          return;
        } catch (e) {
          console.warn('addLineItem failed, falling back to local:', e);
          // fall through to local
        }
      }
      // Local-only fallback (mock data items, e.g. Library books)
      const localId = input.id || `local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setCartItems((prev) => {
        const existing = prev.find((i) => i.id === localId);
        if (existing) {
          return prev.map((i) => (i.id === localId ? { ...i, quantity: i.quantity + qty } : i));
        }
        return [
          ...prev,
          {
            id: localId,
            title: input.title,
            price: input.price,
            quantity: qty,
            color: input.color || colorForKey(localId),
            type: input.type || 'product',
            thumbnail: input.thumbnail ?? null,
            handle: input.handle,
            isLocal: true,
          },
        ];
      });
    },
    [applyCart],
  );

  const removeFromCart = useCallback(
    async (id: string) => {
      // If it's a Medusa line item, hit API.
      const item = cartItems.find((i) => i.id === id);
      if (item && !item.isLocal && cartId) {
        try {
          const updated = await removeLineItem(cartId, id);
          applyCart(updated);
          return;
        } catch (e) {
          console.warn('removeLineItem failed:', e);
        }
      }
      setCartItems((prev) => prev.filter((i) => i.id !== id));
    },
    [cartItems, cartId, applyCart],
  );

  const updateCartQuantity = useCallback(
    async (id: string, delta: number) => {
      const item = cartItems.find((i) => i.id === id);
      if (!item) return;
      const next = Math.max(1, item.quantity + delta);
      if (!item.isLocal && cartId) {
        try {
          const updated = await updateLineItem(cartId, id, next);
          applyCart(updated);
          return;
        } catch (e) {
          console.warn('updateLineItem failed:', e);
        }
      }
      setCartItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity: next } : i)),
      );
    },
    [cartItems, cartId, applyCart],
  );

  const clearCart = useCallback(async () => {
    // Remove each Medusa item; local items just drop.
    const tasks = cartItems
      .filter((i) => !i.isLocal && cartId)
      .map((i) => removeLineItem(cartId!, i.id).catch(() => {}));
    await Promise.all(tasks);
    setCartItems([]);
  }, [cartItems, cartId]);

  const toggleWishlist = (id: string) => {
    setWishlistItems((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  // Persist wishlist to localStorage whenever it changes.
  useEffect(() => {
    try {
      window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistItems));
    } catch {}
  }, [wishlistItems]);

  // Restore customer on mount if we have a token.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!getAuthToken()) {
        if (!cancelled) setAuthLoading(false);
        return;
      }
      try {
        const c = await getCurrentCustomer();
        if (!cancelled) setUser(c ? customerToProfile(c) : null);
      } catch (e) {
        console.warn('restore customer failed:', e);
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await loginCustomer(email, password);
    const c = await getCurrentCustomer();
    if (c) setUser(customerToProfile(c));
  }, []);

  const register = useCallback(
    async (payload: { email: string; password: string; first_name?: string; last_name?: string }) => {
      const { customer } = await registerCustomer(payload);
      setUser(customerToProfile(customer));
    },
    [],
  );

  const logout = useCallback(async () => {
    await logoutCustomer();
    setUser(null);
  }, []);

  return (
    <RainbowContext.Provider
      value={{
        intensity,
        setIntensity,
        lang,
        setLang,
        cartItems,
        cartCount,
        cartId,
        cartLoading,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        wishlistCount,
        wishlistItems,
        toggleWishlist,
        user,
        authLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </RainbowContext.Provider>
  );
};

export const useRainbow = () => {
  const context = useContext(RainbowContext);
  if (!context) throw new Error('useRainbow must be used within RainbowProvider');
  return context;
};
