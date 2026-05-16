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
    <header className="sticky top-0 z-50 h-[64px] md:h-[76px] w-full border-b border-black/10 bg-white">
      <div className="container mx-auto h-full px-4 flex items-center justify-between">
        
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2 group">
          <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF5F6D] to-[#B067FF] group-hover:scale-110 transition-transform duration-300" />
          <span className="text-xl font-semibold tracking-tight text-[#0a0a0a] transition-colors group-hover:text-black">
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
                  "text-sm font-medium transition-all hover:text-black relative py-2",
                  isActive ? "text-[#0a0a0a]" : "text-[#525252]"
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
          <NavLink to="/search" className="p-2 text-[#404040] hover:text-black hover:bg-black/5 rounded-full transition-colors">
            <Search className="w-5 h-5" />
          </NavLink>

          <NavLink to="/wishlist" className="relative p-2 text-[#404040] hover:text-black hover:bg-black/5 rounded-full transition-colors">
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <Badge className="absolute top-0 right-0 w-4 h-4 p-0 flex items-center justify-center bg-[#FF5F6D] text-white border-none text-[8px] scale-90 translate-x-1 -translate-y-1">
                {wishlistCount}
              </Badge>
            )}
          </NavLink>

          {/* Account Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-center w-10 h-10 text-[#404040] hover:text-black hover:bg-black/5 rounded-full transition-colors cursor-pointer outline-none">
              <User className="w-5 h-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 bg-white border-black/10 text-[#0a0a0a] mt-2 backdrop-blur-xl">
              <div className="px-3 py-2 text-sm font-semibold border-b border-black/5">
                {user ? (
                  <div className="flex flex-col">
                    <span className="text-[#0a0a0a]">{user.name}</span>
                    <span className="text-[10px] text-[#525252] font-mono mt-1">ID: {user.customerId}</span>
                  </div>
                ) : "My Account"}
              </div>
              {!user ? (
                <>
                  <DropdownMenuItem className="focus:bg-gray-100 cursor-pointer">
                    <LogIn className="w-4 h-4 mr-2" /> Sign In
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-gray-100 cursor-pointer">
                    <UserPlus className="w-4 h-4 mr-2" /> Register
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem className="focus:bg-gray-100 cursor-pointer">
                  <NavLink to="/account" className="flex items-center w-full h-full">
                    <LayoutDashboard className="w-4 h-4 mr-2" /> My Dashboard
                  </NavLink>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="bg-black/5" />
              <DropdownMenuItem className="focus:bg-gray-100 cursor-pointer">
                <NavLink to="/account/orders" className="flex items-center w-full h-full">
                  <Package className="w-4 h-4 mr-2" /> Orders
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-gray-100 cursor-pointer">
                <NavLink to="/account/downloads" className="flex items-center w-full h-full">
                  <Download className="w-4 h-4 mr-2" /> Downloads
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-gray-100 cursor-pointer">
                <NavLink to="/wishlist" className="flex items-center w-full h-full">
                  <Heart className="w-4 h-4 mr-2" /> Wishlist
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-black/5" />
              
              {/* Language Settings Submenu */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="focus:bg-gray-100 cursor-pointer">
                  <Globe className="w-4 h-4 mr-2" /> Language Settings
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="bg-white border-black/10 text-[#0a0a0a] backdrop-blur-xl max-h-[300px] overflow-y-auto">
                    {languages.map((l) => (
                      <DropdownMenuItem 
                        key={l.code} 
                        onClick={() => setLang(l.code)}
                        className={cn("focus:bg-gray-100 cursor-pointer", lang === l.code && "bg-black/5")}
                      >
                        {l.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuItem className="focus:bg-gray-100 cursor-pointer">
                <Settings className="w-4 h-4 mr-2" /> Account Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-gray-100 cursor-pointer">
                <Bell className="w-4 h-4 mr-2" /> Notifications
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-gray-100 cursor-pointer">
                <LifeBuoy className="w-4 h-4 mr-2" /> Support
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-black/5" />
              {user && (
                <DropdownMenuItem onClick={logout} className="focus:bg-gray-100 cursor-pointer text-red-500 hover:text-red-400">
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Cart Icon */}
          <NavLink to="/cart" className="relative p-2 text-[#404040] hover:text-black hover:bg-black/5 rounded-full transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <Badge className="absolute top-0 right-0 w-5 h-5 p-0 flex items-center justify-center bg-gradient-to-tr from-[#FF5F6D] to-[#B067FF] text-white border-none text-[10px] scale-90 translate-x-1 -translate-y-1">
                {cartCount}
              </Badge>
            )}
          </NavLink>

          <NavLink to="/free-activities" className="hidden md:inline-flex items-center justify-center ml-2 rounded-full bg-gradient-to-r from-[#FF5F6D] to-[#B067FF] text-white px-5 h-10 font-semibold text-sm hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-md">
            🎁 Get Free Pack
          </NavLink>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger className="lg:hidden flex items-center justify-center w-10 h-10 text-[#0a0a0a] hover:bg-black/5 rounded-full transition-colors cursor-pointer outline-none">
              <Menu className="w-6 h-6" />
            </SheetTrigger>
            <SheetContent side="right" className="bg-white border-black/10 text-[#0a0a0a]">
              <SheetHeader>
                <SheetTitle className="text-left text-[#0a0a0a]">Hue Whimsy</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className="text-lg font-medium text-[#404040] hover:text-black"
                  >
                    {link.name}
                  </NavLink>
                ))}
                <div className="mt-4 pt-4 border-t border-black/10">
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
