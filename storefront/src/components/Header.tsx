import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Search,
  User,
  ShoppingCart,
  Menu,
  ChevronDown,
  Globe,
  LogIn,
  UserPlus,
  LayoutDashboard,
  Package,
  Download,
  Heart,
  Settings,
  LifeBuoy,
  LogOut,
  Sparkles,
} from 'lucide-react';
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

const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'Library', path: '/library' },
  { name: 'Shop', path: '/shop' },
  { name: 'Free Activities', path: '/free-activities' },
  { name: 'Blog', path: '/blog' },
  { name: 'About', path: '/about' },
  { name: 'Services', path: '/services' },
  { name: 'Contact', path: '/contact' },
];

const LANGUAGES = [
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

export const Header: React.FC = () => {
  const { lang, setLang, cartCount, wishlistCount, user, logout } = useRainbow();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Subtle elevation when the user scrolls past the very top
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const currentLang = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md transition-shadow',
        scrolled
          ? 'shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] border-b border-black/[0.06]'
          : 'border-b border-transparent',
      )}
    >
      <div className="container-page h-[60px] sm:h-[68px] lg:h-[76px] flex items-center justify-between gap-3 sm:gap-5">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2 sm:gap-2.5 group flex-shrink-0">
          <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF5F6D] via-[#FF9A3C] to-[#B067FF] shadow-[0_4px_12px_-4px_rgba(255,95,109,0.5)] group-hover:scale-110 transition-transform duration-300" />
          <span className="text-lg sm:text-xl font-semibold tracking-tight text-[#0a0a0a]">
            Hue<span className="text-[#FF5F6D]">·</span>Whimsy
          </span>
        </NavLink>

        {/* Desktop nav — visible from xl up so the eight links + actions fit */}
        <nav className="hidden xl:flex items-center gap-1 flex-grow justify-center">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/'}
              className={({ isActive }) =>
                cn(
                  'relative px-3 py-2 text-sm font-medium rounded-full transition-colors',
                  isActive ? 'text-[#0a0a0a]' : 'text-[#525252] hover:text-[#0a0a0a]',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative z-10">{link.name}</span>
                  {isActive && (
                    <span className="absolute inset-x-3 -bottom-0.5 h-[2px] rounded-full bg-gradient-to-r from-[#FF9A3C] to-[#5BE37D]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
          {/* Search */}
          <NavLink
            to="/search"
            aria-label="Search"
            className="inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 text-[#404040] hover:text-black hover:bg-black/[0.04] rounded-full transition-colors"
          >
            <Search className="w-5 h-5" />
          </NavLink>

          {/* Wishlist — hide on smallest screens, account menu has it too */}
          <NavLink
            to="/wishlist"
            aria-label="Wishlist"
            className="relative hidden sm:inline-flex items-center justify-center w-11 h-11 text-[#404040] hover:text-black hover:bg-black/[0.04] rounded-full transition-colors"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <Badge className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-[#FF5F6D] text-white border-none text-[10px] leading-none font-bold rounded-full">
                {wishlistCount > 9 ? '9+' : wishlistCount}
              </Badge>
            )}
          </NavLink>

          {/* Account — desktop dropdown */}
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Account menu"
                className="inline-flex items-center justify-center w-11 h-11 text-[#404040] hover:text-black hover:bg-black/[0.04] rounded-full transition-colors cursor-pointer outline-none"
              >
                <User className="w-5 h-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-64 bg-white border border-black/[0.08] text-[#0a0a0a] mt-2 shadow-xl rounded-2xl p-2"
                align="end"
              >
                <div className="px-3 py-3 mb-1 rounded-xl bg-gradient-to-br from-[#FFD93D]/10 to-[#B067FF]/10">
                  {user ? (
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-sm">{user.name}</span>
                      <span className="text-[11px] text-[#525252] font-mono truncate">
                        ID · {user.customerId.slice(-10)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-sm">Welcome</span>
                      <span className="text-[11px] text-[#525252]">Sign in to sync your cart</span>
                    </div>
                  )}
                </div>

                {!user ? (
                  <>
                    <DropdownMenuItem className="rounded-lg px-2 py-1.5 text-sm cursor-pointer focus:bg-black/[0.04]">
                      <NavLink to="/account" className="flex items-center w-full">
                        <LogIn className="w-4 h-4 mr-2.5" /> Sign In
                      </NavLink>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg px-2 py-1.5 text-sm cursor-pointer focus:bg-black/[0.04]">
                      <NavLink to="/account?mode=register" className="flex items-center w-full">
                        <UserPlus className="w-4 h-4 mr-2.5" /> Create Account
                      </NavLink>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem className="rounded-lg px-2 py-1.5 text-sm cursor-pointer focus:bg-black/[0.04]">
                    <NavLink to="/account" className="flex items-center w-full">
                      <LayoutDashboard className="w-4 h-4 mr-2.5" /> My Dashboard
                    </NavLink>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator className="bg-black/[0.06] my-1" />

                <DropdownMenuItem className="rounded-lg px-2 py-1.5 text-sm cursor-pointer focus:bg-black/[0.04]">
                  <NavLink to="/account/orders" className="flex items-center w-full">
                    <Package className="w-4 h-4 mr-2.5" /> Orders
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg px-2 py-1.5 text-sm cursor-pointer focus:bg-black/[0.04]">
                  <NavLink to="/account/downloads" className="flex items-center w-full">
                    <Download className="w-4 h-4 mr-2.5" /> Downloads
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg px-2 py-1.5 text-sm cursor-pointer focus:bg-black/[0.04]">
                  <NavLink to="/wishlist" className="flex items-center w-full">
                    <Heart className="w-4 h-4 mr-2.5" />
                    <span className="flex-grow">Wishlist</span>
                    {wishlistCount > 0 && (
                      <Badge className="ml-2 bg-[#FF5F6D] text-white text-[10px] h-5 px-1.5 rounded-full">
                        {wishlistCount}
                      </Badge>
                    )}
                  </NavLink>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-black/[0.06] my-1" />

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center w-full px-2 py-1.5 rounded-lg text-sm cursor-pointer focus:bg-black/[0.04]">
                    <Globe className="w-4 h-4 mr-2.5" />
                    <span className="flex-grow text-left">Language</span>
                    <span className="text-xs text-[#525252]">{currentLang.name}</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="bg-white border border-black/[0.08] text-[#0a0a0a] shadow-xl rounded-2xl p-2 max-h-[300px] overflow-y-auto w-56">
                      {LANGUAGES.map((l) => (
                        <DropdownMenuItem
                          key={l.code}
                          onClick={() => setLang(l.code)}
                          className={cn(
                            'rounded-lg px-2 py-1.5 text-sm cursor-pointer focus:bg-black/[0.04]',
                            lang === l.code && 'bg-black/[0.04] font-semibold',
                          )}
                        >
                          {l.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>

                <DropdownMenuItem className="rounded-lg px-2 py-1.5 text-sm cursor-pointer focus:bg-black/[0.04]">
                  <NavLink to="/account" className="flex items-center w-full">
                    <Settings className="w-4 h-4 mr-2.5" /> Settings
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg px-2 py-1.5 text-sm cursor-pointer focus:bg-black/[0.04]">
                  <NavLink to="/contact" className="flex items-center w-full">
                    <LifeBuoy className="w-4 h-4 mr-2.5" /> Help &amp; Support
                  </NavLink>
                </DropdownMenuItem>

                {user && (
                  <>
                    <DropdownMenuSeparator className="bg-black/[0.06] my-1" />
                    <DropdownMenuItem
                      onClick={logout}
                      className="rounded-lg px-2 py-1.5 text-sm cursor-pointer text-red-500 hover:text-red-600 focus:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-2.5" /> Logout
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Cart */}
          <NavLink
            to="/cart"
            aria-label="Cart"
            className="relative inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 text-[#404040] hover:text-black hover:bg-black/[0.04] rounded-full transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <Badge className="absolute top-1 right-1 min-w-[20px] h-5 px-1 flex items-center justify-center bg-gradient-to-tr from-[#FF5F6D] to-[#B067FF] text-white border-none text-[10px] leading-none font-bold rounded-full">
                {cartCount > 9 ? '9+' : cartCount}
              </Badge>
            )}
          </NavLink>

          {/* Free Pack CTA — desktop only, hidden on tablets/mobile to save space */}
          <NavLink
            to="/free-activities"
            className="hidden 2xl:inline-flex items-center justify-center ml-2 rounded-full bg-gradient-to-r from-[#FF5F6D] via-[#FF9A3C] to-[#B067FF] text-white px-5 h-10 font-semibold text-sm hover:opacity-90 transition-all hover:scale-[1.03] active:scale-95 shadow-[0_4px_14px_-4px_rgba(255,95,109,0.55)]"
          >
            <Sparkles className="w-4 h-4 mr-1.5" /> Free Pack
          </NavLink>

          {/* Mobile hamburger — shown below xl */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              aria-label="Open menu"
              className="xl:hidden inline-flex items-center justify-center w-11 h-11 text-[#0a0a0a] hover:bg-black/[0.04] rounded-full transition-colors cursor-pointer outline-none"
            >
              <Menu className="w-6 h-6" />
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-white border-l border-black/[0.06] text-[#0a0a0a] w-full sm:max-w-md p-0 overflow-y-auto"
            >
              <SheetHeader className="px-6 pt-6 pb-4 border-b border-black/[0.06]">
                <SheetTitle className="text-left text-xl font-semibold text-[#0a0a0a] flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#FF5F6D] via-[#FF9A3C] to-[#B067FF]" />
                  Hue<span className="text-[#FF5F6D]">·</span>Whimsy
                </SheetTitle>
              </SheetHeader>

              <div className="px-6 py-6 flex flex-col gap-7">
                {/* Quick search */}
                <NavLink
                  to="/search"
                  className="flex items-center gap-3 px-4 h-12 rounded-2xl bg-black/[0.04] hover:bg-black/[0.07] transition-colors text-[#525252]"
                >
                  <Search className="w-4 h-4" /> Search…
                </NavLink>

                {/* Nav links */}
                <nav className="flex flex-col">
                  <p className="text-[11px] uppercase font-bold tracking-widest text-[#525252] mb-3 px-2">
                    Explore
                  </p>
                  {NAV_LINKS.map((link) => (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      end={link.path === '/'}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center px-3 py-3 text-base font-medium rounded-xl transition-colors',
                          isActive
                            ? 'bg-black/[0.05] text-[#0a0a0a]'
                            : 'text-[#404040] hover:bg-black/[0.04] hover:text-black',
                        )
                      }
                    >
                      {link.name}
                    </NavLink>
                  ))}
                </nav>

                {/* Account section */}
                <div className="flex flex-col">
                  <p className="text-[11px] uppercase font-bold tracking-widest text-[#525252] mb-3 px-2">
                    Account
                  </p>
                  {!user ? (
                    <div className="grid grid-cols-2 gap-2">
                      <NavLink
                        to="/account"
                        className="flex items-center justify-center gap-2 px-3 h-11 rounded-xl border border-black/10 text-sm font-semibold hover:bg-black/[0.04]"
                      >
                        <LogIn className="w-4 h-4" /> Sign In
                      </NavLink>
                      <NavLink
                        to="/account?mode=register"
                        className="flex items-center justify-center gap-2 px-3 h-11 rounded-xl bg-[#0a0a0a] text-white text-sm font-semibold hover:opacity-90"
                      >
                        <UserPlus className="w-4 h-4" /> Register
                      </NavLink>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-gradient-to-br from-[#FFD93D]/10 to-[#B067FF]/10 p-4 mb-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF5F6D] to-[#B067FF] flex items-center justify-center text-white font-bold">
                        {(user.firstName?.[0] ?? user.email[0]).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{user.name}</p>
                        <p className="text-[11px] text-[#525252] truncate">{user.email}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <NavLink to="/wishlist" className="flex items-center gap-2 px-3 h-11 rounded-xl bg-black/[0.04] hover:bg-black/[0.07] text-sm">
                      <Heart className="w-4 h-4 text-[#FF5F6D]" />
                      <span className="flex-grow">Wishlist</span>
                      {wishlistCount > 0 && (
                        <span className="text-[10px] font-bold bg-[#FF5F6D] text-white rounded-full px-1.5 py-0.5 leading-none">
                          {wishlistCount}
                        </span>
                      )}
                    </NavLink>
                    <NavLink to="/account/orders" className="flex items-center gap-2 px-3 h-11 rounded-xl bg-black/[0.04] hover:bg-black/[0.07] text-sm">
                      <Package className="w-4 h-4 text-[#4DA8FF]" /> Orders
                    </NavLink>
                    <NavLink to="/account/downloads" className="flex items-center gap-2 px-3 h-11 rounded-xl bg-black/[0.04] hover:bg-black/[0.07] text-sm">
                      <Download className="w-4 h-4 text-[#5BE37D]" /> Downloads
                    </NavLink>
                    <NavLink to="/cart" className="flex items-center gap-2 px-3 h-11 rounded-xl bg-black/[0.04] hover:bg-black/[0.07] text-sm">
                      <ShoppingCart className="w-4 h-4 text-[#B067FF]" />
                      <span className="flex-grow">Cart</span>
                      {cartCount > 0 && (
                        <span className="text-[10px] font-bold bg-gradient-to-r from-[#FF5F6D] to-[#B067FF] text-white rounded-full px-1.5 py-0.5 leading-none">
                          {cartCount}
                        </span>
                      )}
                    </NavLink>
                  </div>
                </div>

                {/* Language */}
                <div>
                  <p className="text-[11px] uppercase font-bold tracking-widest text-[#525252] mb-3 px-2">
                    Language
                  </p>
                  <details className="group rounded-xl bg-black/[0.04] open:bg-black/[0.07] transition-colors">
                    <summary className="flex items-center px-4 h-12 cursor-pointer list-none">
                      <Globe className="w-4 h-4 mr-2.5 text-[#525252]" />
                      <span className="flex-grow text-sm font-medium">{currentLang.name}</span>
                      <ChevronDown className="w-4 h-4 text-[#525252] group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="max-h-60 overflow-y-auto px-2 pb-2 grid grid-cols-1 gap-0.5">
                      {LANGUAGES.map((l) => (
                        <button
                          key={l.code}
                          onClick={() => setLang(l.code)}
                          className={cn(
                            'text-left px-3 py-2 rounded-lg text-sm transition-colors',
                            lang === l.code
                              ? 'bg-white font-semibold'
                              : 'text-[#404040] hover:bg-white',
                          )}
                        >
                          {l.name}
                        </button>
                      ))}
                    </div>
                  </details>
                </div>

                {/* Free Pack CTA */}
                <NavLink
                  to="/free-activities"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FF5F6D] via-[#FF9A3C] to-[#B067FF] text-white h-12 font-semibold text-sm hover:opacity-95 shadow-[0_6px_20px_-6px_rgba(255,95,109,0.55)]"
                >
                  <Sparkles className="w-4 h-4" /> Get the Free Welcome Pack
                </NavLink>

                {user && (
                  <button
                    onClick={() => {
                      void logout();
                      setMobileOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 h-11 rounded-xl border border-red-200 text-red-500 font-medium hover:bg-red-50 text-sm"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
