import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RainbowProvider } from './components/RainbowContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Library } from './pages/Library';
import { Services } from './pages/Services';
import { Blog } from './pages/Blog';
import { BlogPost } from './pages/BlogPost';
import { FreeActivities } from './pages/FreeActivities';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Account } from './pages/Account';
import { AccountOrders } from './pages/AccountOrders';
import { AccountDownloads } from './pages/AccountDownloads';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { Search } from './pages/Search';
import { Shop } from './pages/Shop';
import { ProductDetails } from './pages/ProductDetails';
import { Wishlist } from './pages/Wishlist';
import { Privacy, Terms, Refund, Shipping } from './pages/StaticPage';

export default function App() {
  return (
    <RainbowProvider>
      <Router>
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
      </Router>
    </RainbowProvider>
  );
}
