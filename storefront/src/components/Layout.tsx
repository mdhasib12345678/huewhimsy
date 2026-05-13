import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { RainbowMesh } from './RainbowMesh';
import { useRainbow } from './RainbowContext';
import { Header } from './Header';
import { Footer } from './Footer';

export const Layout: React.FC = () => {
  const { intensity } = useRainbow();

  return (
    <div className="relative min-h-screen flex flex-col text-[#F5F5F5] font-sans selection:bg-[#FFD93D] selection:text-[#0a0a0a]">
      {/* The Global Background */}
      <RainbowMesh intensity={intensity} />
      
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
