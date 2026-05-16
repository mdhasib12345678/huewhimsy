import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RainbowProvider } from './components/RainbowContext';
import { Layout } from './components/Layout';

// Eager: visible on first paint
import { Home } from './pages/Home';

// Lazy: pulled in only when the user visits the route
const Library = lazy(() => import('./pages/Library').then((m) => ({ default: m.Library })));
const Services = lazy(() => import('./pages/Services').then((m) => ({ default: m.Services })));
const Blog = lazy(() => import('./pages/Blog').then((m) => ({ default: m.Blog })));
const BlogPost = lazy(() => import('./pages/BlogPost').then((m) => ({ default: m.BlogPost })));
const FreeActivities = lazy(() => import('./pages/FreeActivities').then((m) => ({ default: m.FreeActivities })));
const About = lazy(() => import('./pages/About').then((m) => ({ default: m.About })));
const Contact = lazy(() => import('./pages/Contact').then((m) => ({ default: m.Contact })));
const Cart = lazy(() => import('./pages/Cart').then((m) => ({ default: m.Cart })));
const Checkout = lazy(() => import('./pages/Checkout').then((m) => ({ default: m.Checkout })));
const Account = lazy(() => import('./pages/Account').then((m) => ({ default: m.Account })));
const AccountOrders = lazy(() => import('./pages/AccountOrders').then((m) => ({ default: m.AccountOrders })));
const AccountDownloads = lazy(() => import('./pages/AccountDownloads').then((m) => ({ default: m.AccountDownloads })));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation').then((m) => ({ default: m.OrderConfirmation })));
const Search = lazy(() => import('./pages/Search').then((m) => ({ default: m.Search })));
const Shop = lazy(() => import('./pages/Shop').then((m) => ({ default: m.Shop })));
const ProductDetails = lazy(() => import('./pages/ProductDetails').then((m) => ({ default: m.ProductDetails })));
const Wishlist = lazy(() => import('./pages/Wishlist').then((m) => ({ default: m.Wishlist })));
const Privacy = lazy(() => import('./pages/StaticPage').then((m) => ({ default: m.Privacy })));
const Terms = lazy(() => import('./pages/StaticPage').then((m) => ({ default: m.Terms })));
const Refund = lazy(() => import('./pages/StaticPage').then((m) => ({ default: m.Refund })));
const Shipping = lazy(() => import('./pages/StaticPage').then((m) => ({ default: m.Shipping })));

const RouteFallback: React.FC = () => (
  <div className="container mx-auto px-4 py-32 text-center">
    <div className="inline-block w-12 h-12 rounded-full border-4 border-[#FFD93D] border-t-transparent animate-spin" />
  </div>
);

export default function App() {
  return (
    <RainbowProvider>
      <Router>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/library" element={<Library />} />
              <Route path="/library/:id" element={<ProductDetails />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/shop/:id" element={<ProductDetails />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/services" element={<Services />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/about" element={<About />} />
              <Route path="/free-activities" element={<FreeActivities />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/account" element={<Account />} />
              <Route path="/account/orders" element={<AccountOrders />} />
              <Route path="/account/downloads" element={<AccountDownloads />} />
              <Route path="/order/:id" element={<OrderConfirmation />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/refund" element={<Refund />} />
              <Route path="/shipping" element={<Shipping />} />
              <Route path="/search" element={<Search />} />
              <Route path="*" element={<Search />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </RainbowProvider>
  );
}
