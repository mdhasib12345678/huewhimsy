import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export const Layout: React.FC = () => {
  return (
    <div className="relative min-h-screen flex flex-col bg-white text-[#0a0a0a] font-sans selection:bg-[#FFD93D] selection:text-[#0a0a0a]">
      <Header />
      <main className="flex-grow bg-white">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
