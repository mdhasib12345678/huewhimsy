import React from 'react';
import { NavLink } from 'react-router-dom';
import { Search, User, ShoppingCart, Menu, X, ChevronDown, Globe, LogIn, UserPlus, LayoutDashboard, Package, Download, Heart, Settings, Bell, LifeBuoy, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useRainbow } from './RainbowContext';
import { cn } from '@/lib/utils';

export const Header: React.FC = () => {
  const { lang, setLang, cartCount, wishlistCount, user, logout } = useRainbow();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Library', path: '/library' },
    { name: 'Shop', path: '/shop' },
    { name: 'Free Activities', path: '/free-activities' },
    { name: 'Blog', path: '/blog' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Contact', path: '/contact' },
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'pt', name: 'Português' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
    { code: 'nl', name: 'Nederlands' },
    { code: 'pl', name: 'Polski' },
    { code: 'sv', name: 'Svenska' },
    { code: 'da', name: 'Dansk' },
    { code: 'no', name: 'Norsk' },
    { code: 'fi', name: 'Suomi' },
    { code: 'el', name: 'Ελληνικά' },
    { code: 'zh-cn', name: '简体中文' },
    { code: 'zh-tw', name: '繁體中文' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'ar', name: 'العربية' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'vi', name: 'Tiếng Việt' },
    { code: 'id', name: 'Bahasa Indonesia' },
  ];

  return (
    <header className="sticky top-0 z-50 h-[64px] md:h-[76px] w-full border-b border-white/10 bg-white/5 backdrop-blur-md">
      <div className="container mx-auto h-full px-4 flex items-center justify-between">
        
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2 group">
          <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF5F6D] to-[#B067FF] group-hover:scale-110 transition-transform duration-300" />
          <span className="text-xl font-semibold tracking-tight text-[#F5F5F5] transition-colors group-hover:text-white">
            Hue Whimsy
          </span>
        </NavLink>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-[18px] xl:gap-[26px]">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                cn(
                  "text-sm font-medium transition-all hover:text-white relative py-2",
                  isActive ? "text-white" : "text-[#B8BEC6]"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {link.name}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#FF9A3C] to-[#5BE37D] rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <NavLink to="/search" className="p-2 text-[#B8BEC6] hover:text-white hover:bg-white/10 rounded-full transition-colors">
            <Search className="w-5 h-5" />
          </NavLink>

          <NavLink to="/wishlist" className="relative p-2 text-[#B8BEC6] hover:text-white hover:bg-white/10 rounded-full transition-colors">
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <Badge className="absolute top-0 right-0 w-4 h-4 p-0 flex items-center justify-center bg-[#FF5F6D] text-white border-none text-[8px] scale-90 translate-x-1 -translate-y-1">
                {wishlistCount}
              </Badge>
            )}
          </NavLink>

          {/* Account Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-center w-10 h-10 text-[#B8BEC6] hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer outline-none">
              <User className="w-5 h-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 bg-[#1a1a1a] border-white/10 text-[#F5F5F5] mt-2 backdrop-blur-xl">
              <div className="px-3 py-2 text-sm font-semibold border-b border-white/5">
                {user ? (
                  <div className="flex flex-col">
                    <span className="text-white">{user.name}</span>
                    <span className="text-[10px] text-[#B8BEC6] font-mono mt-1">ID: {user.customerId}</span>
                  </div>
                ) : "My Account"}
              </div>
              {!user ? (
                <>
                  <DropdownMenuItem className="focus:bg-white/10 cursor-pointer">
                    <LogIn className="w-4 h-4 mr-2" /> Sign In
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-white/10 cursor-pointer">
                    <UserPlus className="w-4 h-4 mr-2" /> Register
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem className="focus:bg-white/10 cursor-pointer">
                  <NavLink to="/account" className="flex items-center w-full h-full">
                    <LayoutDashboard className="w-4 h-4 mr-2" /> My Dashboard
                  </NavLink>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="focus:bg-white/10 cursor-pointer">
                <NavLink to="/account/orders" className="flex items-center w-full h-full">
                  <Package className="w-4 h-4 mr-2" /> Orders
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-white/10 cursor-pointer">
                <NavLink to="/account/downloads" className="flex items-center w-full h-full">
                  <Download className="w-4 h-4 mr-2" /> Downloads
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-white/10 cursor-pointer">
                <NavLink to="/wishlist" className="flex items-center w-full h-full">
                  <Heart className="w-4 h-4 mr-2" /> Wishlist
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              
              {/* Language Settings Submenu */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="focus:bg-white/10 cursor-pointer">
                  <Globe className="w-4 h-4 mr-2" /> Language Settings
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="bg-[#1a1a1a] border-white/10 text-[#F5F5F5] backdrop-blur-xl max-h-[300px] overflow-y-auto">
                    {languages.map((l) => (
                      <DropdownMenuItem 
                        key={l.code} 
                        onClick={() => setLang(l.code)}
                        className={cn("focus:bg-white/10 cursor-pointer", lang === l.code && "bg-white/10")}
                      >
                        {l.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuItem className="focus:bg-white/10 cursor-pointer">
                <Settings className="w-4 h-4 mr-2" /> Account Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-white/10 cursor-pointer">
                <Bell className="w-4 h-4 mr-2" /> Notifications
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-white/10 cursor-pointer">
                <LifeBuoy className="w-4 h-4 mr-2" /> Support
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              {user && (
                <DropdownMenuItem onClick={logout} className="focus:bg-white/10 cursor-pointer text-red-500 hover:text-red-400">
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Cart Icon */}
          <NavLink to="/cart" className="relative p-2 text-[#B8BEC6] hover:text-white hover:bg-white/10 rounded-full transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <Badge className="absolute top-0 right-0 w-5 h-5 p-0 flex items-center justify-center bg-gradient-to-tr from-[#FF5F6D] to-[#B067FF] text-white border-none text-[10px] scale-90 translate-x-1 -translate-y-1">
                {cartCount}
              </Badge>
            )}
          </NavLink>

          <Button className="hidden md:flex ml-2 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm transition-all hover:scale-105 active:scale-95">
            Get Free Pack
          </Button>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger className="lg:hidden flex items-center justify-center w-10 h-10 text-[#F5F5F5] hover:bg-white/10 rounded-full transition-colors cursor-pointer outline-none">
              <Menu className="w-6 h-6" />
            </SheetTrigger>
            <SheetContent side="right" className="bg-[#0a0a0a] border-white/10 text-white">
              <SheetHeader>
                <SheetTitle className="text-left text-[#F5F5F5]">Hue Whimsy</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className="text-lg font-medium text-[#B8BEC6] hover:text-white"
                  >
                    {link.name}
                  </NavLink>
                ))}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <Button className="w-full rounded-full bg-gradient-to-r from-[#FF5F6D] to-[#B067FF] text-white">
                    Get Free Pack
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
