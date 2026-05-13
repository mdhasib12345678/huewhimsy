import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserProfile {
  name: string;
  username: string;
  customerId: string;
  email: string;
}

interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  color: string;
  type: 'book' | 'product';
}

interface RainbowContextType {
  intensity: number;
  setIntensity: (val: number) => void;
  lang: string;
  setLang: (l: string) => void;
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (item: any) => void;
  removeFromCart: (id: string) => void;
  updateCartQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  wishlistCount: number;
  wishlistItems: string[];
  toggleWishlist: (id: string) => void;
  user: UserProfile | null;
  login: (userData: UserProfile) => void;
  logout: () => void;
}

const RainbowContext = createContext<RainbowContextType | undefined>(undefined);

export const RainbowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [intensity, setIntensity] = useState(1.0);
  const [lang, setLang] = useState('en');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  const addToCart = (item: any) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1, type: item.type || 'book' }];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(i => i.id !== id));
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(i => 
      i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i
    ));
  };

  const clearCart = () => setCartItems([]);

  const toggleWishlist = (id: string) => {
    setWishlistItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const login = (userData: UserProfile) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <RainbowContext.Provider value={{ 
      intensity, setIntensity, 
      lang, setLang, 
      cartItems, cartCount, addToCart, removeFromCart, updateCartQuantity, clearCart,
      wishlistCount, wishlistItems, toggleWishlist,
      user, login, logout 
    }}>
      {children}
    </RainbowContext.Provider>
  );
};

export const useRainbow = () => {
  const context = useContext(RainbowContext);
  if (!context) throw new Error('useRainbow must be used within RainbowProvider');
  return context;
};
