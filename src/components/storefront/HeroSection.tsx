import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  ShoppingBag,
  Heart,
  User as UserIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Search,
  Layers,
  BookOpen,
  Truck,
  Grid3X3,
  X,
  ShieldCheck,
  Home,
  Briefcase,
  Menu,
  MessageSquare,
  Bot,
} from 'lucide-react';
import { Product, HeroCarouselProduct, HeroGlassSettings, ObjectFitProperty, TextTypographySettings } from '../../types';
import { BrandLogo } from './BrandLogo';
import { INITIAL_HERO_SLIDES } from '../../data/initialData';

// Model Portraits for each active carousel product
import heroModelCream from '../../assets/images/hero_model_cream_moisture_1791613615042.jpg';
import heroModelToner from '../../assets/images/hero_model_toner_calming_1791613625790.jpg';
import heroModelSerumAmber from '../../assets/images/hero_model_amber_serum_1791613637362.jpg';
import heroModelRadiance from '../../assets/images/hero_model_bloom_radiance_1791611640841.jpg';

// Product Packshots
import creamJarImg from '../../assets/images/product_cream_jar_1791611651854.jpg';
import tonerBottleImg from '../../assets/images/product_toner_bottle_1791611662876.jpg';
import serumDropperImg from '../../assets/images/product_serum_dropper_1791611672796.jpg';

const hexToRgba = (hex: string, alpha: number) => {
  const clean = (hex || '#FFFFFF').replace('#', '');
  let r = 255, g = 255, b = 255;
  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16) || 255;
    g = parseInt(clean[1] + clean[1], 16) || 255;
    b = parseInt(clean[2] + clean[2], 16) || 255;
  } else if (clean.length >= 6) {
    r = parseInt(clean.substring(0, 2), 16) || 255;
    g = parseInt(clean.substring(2, 4), 16) || 255;
    b = parseInt(clean.substring(4, 6), 16) || 255;
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const isColorDark = (hex: string) => {
  const clean = (hex || '#FFFFFF').replace('#', '');
  let r = 255, g = 255, b = 255;
  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16) || 255;
    g = parseInt(clean[1] + clean[1], 16) || 255;
    b = parseInt(clean[2] + clean[2], 16) || 255;
  } else if (clean.length >= 6) {
    r = parseInt(clean.substring(0, 2), 16) || 255;
    g = parseInt(clean.substring(2, 4), 16) || 255;
    b = parseInt(clean.substring(4, 6), 16) || 255;
  }
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq < 128;
};

const getTypographyStyle = (
  style?: TextTypographySettings,
  defaults?: {
    color?: string;
    weight?: string;
    transform?: string;
    fontStyle?: string;
    letterSpacing?: string;
    family?: 'sans' | 'serif' | 'mono';
    size?: string;
  }
): React.CSSProperties => {
  const fontFamilyMap = {
    sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    serif: 'Playfair Display, "Times New Roman", Georgia, serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  };

  const letterSpacingMap: Record<string, string> = {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  };

  const fontSizeMap: Record<string, string> = {
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  };

  if (!style) {
    return {
      color: defaults?.color,
      fontWeight: defaults?.weight,
      fontStyle: defaults?.fontStyle as React.CSSProperties['fontStyle'],
      textTransform: defaults?.transform as React.CSSProperties['textTransform'],
      letterSpacing: defaults?.letterSpacing,
      fontFamily: defaults?.family ? fontFamilyMap[defaults.family] : undefined,
      fontSize: defaults?.size ? fontSizeMap[defaults.size] : undefined,
    };
  }

  const selectedFamily = style.fontFamily || defaults?.family;

  return {
    color: style.color || defaults?.color,
    fontWeight: style.fontWeight || defaults?.weight,
    fontStyle: (style.fontStyle || defaults?.fontStyle) as React.CSSProperties['fontStyle'],
    textTransform: (style.textTransform || defaults?.transform) as React.CSSProperties['textTransform'],
    fontFamily: selectedFamily ? fontFamilyMap[selectedFamily] : undefined,
    letterSpacing: style.letterSpacing ? letterSpacingMap[style.letterSpacing] : defaults?.letterSpacing,
    fontSize: style.fontSize ? fontSizeMap[style.fontSize] : (defaults?.size ? fontSizeMap[defaults.size] : undefined),
  };
};

interface HeroSectionProps {
  onOpenQuiz?: () => void;
  onOpenCart?: () => void;
  onOpenAccountModal?: (tab?: 'addresses' | 'orders' | 'wishlist') => void;
  onOpenWishlist?: () => void;
  onTrackOrder?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenQuiz,
  onOpenCart,
  onOpenAccountModal,
  onOpenWishlist,
  onTrackOrder,
}) => {
  const {
    cart,
    wishlist,
    toggleWishlist,
    addToCart,
    user,
    products,
    heroSlides,
    heroGlassSettings,
    setSelectedProduct,
    setCurrentView,
    loginWithGoogle,
    openAuthModal,
    logout,
  } = useStore();
  const [currency, setCurrency] = useState<'USD' | 'INR'>('INR');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [addedItemKey, setAddedItemKey] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const carouselContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Responsive no-wrap carousel: keep active product card centered inside its container without scrolling the window/webpage
  useEffect(() => {
    const container = carouselContainerRef.current;
    if (container) {
      const activeCard = container.children[activeIndex] as HTMLElement;
      if (activeCard) {
        const cardLeft = activeCard.offsetLeft;
        const cardWidth = activeCard.offsetWidth;
        const containerWidth = container.clientWidth;
        const targetScrollLeft = cardLeft - containerWidth / 2 + cardWidth / 2;
        container.scrollTo({
          left: Math.max(0, targetScrollLeft),
          behavior: 'smooth',
        });
      }
    }
  }, [activeIndex]);

  const searchResults = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.fragranceFamily.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.notes.top.some((n) => n.toLowerCase().includes(searchQuery.toLowerCase())) ||
          p.notes.heart.some((n) => n.toLowerCase().includes(searchQuery.toLowerCase())) ||
          p.notes.base.some((n) => n.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const heroProducts: HeroCarouselProduct[] = heroSlides && heroSlides.length > 0 ? heroSlides : INITIAL_HERO_SLIDES;

  const activeProduct = heroProducts[activeIndex % heroProducts.length] || heroProducts[0];

  // Auto carousel effect with smooth timer
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % heroProducts.length);
    }, 4200);

    return () => clearInterval(interval);
  }, [isPaused, heroProducts.length]);

  const goToPrev = () => {
    setActiveIndex((prev) => (prev - 1 + heroProducts.length) % heroProducts.length);
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev + 1) % heroProducts.length);
  };

  const handleQuickAdd = (item: HeroCarouselProduct, e: React.MouseEvent) => {
    e.stopPropagation();

    const existing = products.find((p) => p.id === item.id);
    const productToAdd: Product = existing || {
      id: item.id,
      title: item.title,
      slug: item.id,
      sku: `SKU-${item.id.toUpperCase()}`,
      fragranceFamily: 'Oriental Woody',
      concentration: 'Extrait de Parfum',
      notes: {
        top: ['Centella Asiatica', 'Bergamot', 'Petrichor'],
        heart: ['Damask Rose', 'Golden Saffron', 'Neroli'],
        base: ['Mysore Sandalwood', 'White Amber', 'Cedarwood'],
      },
      description: `${item.title} formulated with pure botanical extracts and active elixirs for radiant glow.`,
      olfactoryStory: 'A celebration of Indian botanical mastery and eternal dermal sillage.',
      longevity: '14+ Hours on Skin',
      sillage: 'Imperial',
      status: 'active',
      sellingPrice: item.priceINR,
      compareAtPrice: Math.round(item.priceINR * 1.25),
      costPrice: Math.round(item.priceINR * 0.4),
      stockOnHand: 150,
      stockReserved: 10,
      availableStock: 140,
      reorderThreshold: 20,
      images: [item.cardImage],
      variants: [
        {
          size: item.variantSize,
          sku: `SKU-${item.id}-01`,
          barcode: '8901234500001',
          sellingPrice: item.priceINR,
          compareAtPrice: Math.round(item.priceINR * 1.25),
          costPrice: Math.round(item.priceINR * 0.4),
          stock: 140,
        },
      ],
      isBestseller: true,
      isNewArrival: true,
      rating: 4.9,
      reviewCount: 320,
      bottleColor: '#A0B7A3',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addToCart(productToAdd, item.variantSize, 1);
    setAddedItemKey(item.id);
    setTimeout(() => setAddedItemKey(null), 2000);

    if (onOpenCart) {
      setTimeout(() => onOpenCart(), 300);
    }
  };

  return (
    <section className="w-full bg-[#EBF2EC] py-2.5 sm:py-3.5 px-3 sm:px-6 lg:px-8 transition-colors duration-500">
      {/* Outer rounded card matching reference design with individual canvasBgColor per active slide */}
      <div
        className="max-w-[1380px] mx-auto relative rounded-[28px] sm:rounded-[36px] lg:rounded-[42px] overflow-hidden shadow-2xl shadow-[#12231A]/10 border border-[#8BA68F]/40 transition-colors duration-700"
        style={{
          backgroundColor: activeProduct.canvasBgColor || '#A0B7A3',
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Subtle Ambient Radial Lighting with individual slide tone support */}
        <div
          className="absolute inset-0 opacity-90 pointer-events-none transition-all duration-700"
          style={{
            background: activeProduct.canvasBgColor
              ? `radial-gradient(circle at 50% 40%, ${hexToRgba(activeProduct.canvasBgColor, 0.55)} 0%, ${activeProduct.canvasBgColor} 100%)`
              : 'linear-gradient(to top right, #94AB97, #A0B7A3, #AEC5B1)',
          }}
        />

        {/* FULL HERO SECTION SLIDE IMAGES (Operates across entire full hero section with dynamic object-fit & object-position) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {heroProducts.map((prod, idx) => {
            const fit = prod.heroModelObjectFit || 'contain';
            const position = prod.heroModelObjectPosition || (fit === 'contain' ? 'center bottom' : 'center center');
            return (
              <img
                key={prod.id}
                src={prod.heroModelImage}
                alt={prod.title}
                decoding="async"
                loading={idx === activeIndex ? 'eager' : 'lazy'}
                style={{
                  objectFit: fit,
                  objectPosition: position,
                }}
                className={`absolute inset-0 w-full h-full select-none transition-all duration-700 ease-in-out ${
                  idx === activeIndex
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-95 pointer-events-none'
                }`}
              />
            );
          })}
          {/* Subtle gradient vignette overlay to guarantee readability of title, copy, and buttons */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/15 pointer-events-none" />
        </div>

        {/* In-Hero Navigation Header */}
        <div className="relative z-30 pt-4 sm:pt-5 px-5 sm:px-8 lg:px-10 flex items-center justify-between gap-4">
          {/* Left: Brand Logo & Text Menu */}
          <div className="flex items-center gap-4 sm:gap-7 lg:gap-10">
            {/* Brand Logo */}
            <BrandLogo
              variant="hero"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            />

            {/* Main Navigation Menu (Home, About Us, Shop, Story (Journal), Contact Us) */}
            <nav className="hidden md:flex items-center gap-4 sm:gap-6 lg:gap-8 text-xs lg:text-[13px] font-semibold text-[#12231A] tracking-wider uppercase" aria-label="Hero Navigation">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-black hover:underline underline-offset-8 transition-colors cursor-pointer"
              >
                Home
              </a>
              <a
                href="#journal"
                className="hover:text-black hover:underline underline-offset-8 transition-colors"
              >
                About Us
              </a>
              <a
                href="#collection"
                className="hover:text-black hover:underline underline-offset-8 transition-colors"
              >
                Shop
              </a>
              <a
                href="#journal"
                className="hover:text-black hover:underline underline-offset-8 transition-colors"
              >
                Story
              </a>
              <a
                href="https://wa.me/919477831477"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-black hover:underline underline-offset-8 transition-colors"
              >
                Contact Us
              </a>
            </nav>

            {/* Mobile Menu Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 rounded-full bg-white/25 backdrop-blur-md text-[#12231A] hover:bg-[#96F816] transition-all flex items-center justify-center cursor-pointer border border-white/20 active:scale-95"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

          {/* Right Utility & Commerce Action Icons (INR button removed) */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* WhatsApp Button (Top, shown after 1st scroll) */}
            <a
              href="https://wa.me/919477831477?text=Hello%20HIFFYY,%20I%20would%20like%20to%20inquire%20about%20your%20perfume%20collections."
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#25D366]/25 backdrop-blur-md text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all duration-300 items-center justify-center cursor-pointer shadow-sm border border-[#25D366]/40 active:scale-95 ${
                isScrolled ? 'opacity-100 scale-100 flex' : 'opacity-0 scale-90 pointer-events-none hidden'
              }`}
              title="Chat on WhatsApp"
              aria-label="WhatsApp"
            >
              <MessageSquare className="w-4 h-4 transition-transform group-hover:scale-110" />
            </a>

            {/* AI Chat Button (Top, shown after 1st scroll) */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-sillage-chat'))}
              className={`group relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/25 backdrop-blur-md text-[#12231A] hover:bg-[#96F816] hover:text-[#12231A] transition-all duration-300 items-center justify-center cursor-pointer shadow-sm border border-white/20 active:scale-95 ${
                isScrolled ? 'opacity-100 scale-100 flex' : 'opacity-0 scale-90 pointer-events-none hidden'
              }`}
              title="Ask Sillage AI Concierge"
              aria-label="AI Chat"
            >
              <Bot className="w-4 h-4 transition-transform group-hover:scale-110" />
            </button>

            {/* Search Icon */}
            <button
              onClick={() => setSearchOpen(true)}
              className="group relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/25 backdrop-blur-md text-[#12231A] hover:bg-[#96F816] hover:text-[#12231A] transition-all flex items-center justify-center cursor-pointer shadow-sm border border-white/20 active:scale-95"
              title="Search Fragrances & Notes"
              aria-label="Search"
            >
              <Search className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span className="sr-only">Search</span>
              <span className="absolute -bottom-8 right-0 px-2 py-0.5 bg-[#12231A] text-white text-[10px] tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-md">
                Search
              </span>
            </button>

            {/* Wishlist Heart Icon */}
            <button
              onClick={() => {
                if (onOpenWishlist) {
                  onOpenWishlist();
                } else if (onOpenAccountModal) {
                  onOpenAccountModal('wishlist');
                } else {
                  const el = document.getElementById('collection');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="group relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/25 backdrop-blur-md text-[#12231A] hover:bg-[#96F816] hover:text-[#12231A] flex items-center justify-center transition-all cursor-pointer shadow-sm border border-white/20 active:scale-95"
              title="Saved Fragrances (Wishlist)"
              aria-label="Wishlist"
            >
              <Heart className="w-4 h-4 transition-transform group-hover:scale-110" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#96F816] text-[#12231A] text-[9px] font-black flex items-center justify-center shadow-md">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Button with #96F816 Badge */}
            <button
              onClick={onOpenCart}
              className="group relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/25 backdrop-blur-md text-[#12231A] hover:bg-[#96F816] hover:text-[#12231A] flex items-center justify-center transition-all relative cursor-pointer shadow-sm border border-white/20 active:scale-95"
              title="Shopping Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 transition-transform group-hover:scale-110" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#96F816] text-[#12231A] text-[10px] font-black flex items-center justify-center shadow-md">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Profile Avatar with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-white/60 bg-white/30 flex items-center justify-center hover:border-[#96F816] transition-all cursor-pointer shadow-sm active:scale-95"
                title="Customer Account"
                aria-label="Account Menu"
              >
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Customer'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-4 h-4 text-[#12231A]" />
                )}
              </button>

              {accountMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white border border-[#E6DFD5] shadow-2xl py-2 z-50 rounded-lg text-left animate-in fade-in slide-in-from-top-2 duration-200">
                  {user ? (
                    <div className="px-3.5 pb-2.5 border-b border-[#E6DFD5]">
                      <p className="text-xs font-semibold text-[#12231A] truncate">{user.displayName || 'Patron'}</p>
                      <p className="text-[10px] text-[#717A75] truncate">{user.email}</p>
                    </div>
                  ) : (
                    <div className="px-3.5 pb-2.5 border-b border-[#E6DFD5]">
                      <p className="text-xs font-semibold text-[#12231A]">HIFFYY Patron Account</p>
                      <p className="text-[10px] text-[#717A75]">Sign in to access order history</p>
                      <button
                        onClick={async () => {
                          await loginWithGoogle({ email: 'shuvendu.dhenki@gmail.com', displayName: 'Shuvendu Dhenki' });
                          setAccountMenuOpen(false);
                        }}
                        className="mt-1.5 w-full py-1.5 px-3 bg-[#12231A] text-[#96F816] text-[10px] tracking-wider uppercase font-semibold hover:bg-black cursor-pointer rounded flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <span>Sign In as Super Admin</span>
                      </button>
                      <button
                        onClick={() => {
                          openAuthModal();
                          setAccountMenuOpen(false);
                        }}
                        className="mt-1 w-full py-0.5 text-center text-[10px] text-[#886938] hover:text-[#12231A] font-medium cursor-pointer"
                      >
                        Choose another account &rarr;
                      </button>
                    </div>
                  )}

                  <div className="pt-1.5 text-xs">
                    {onOpenAccountModal && (
                      <button
                        onClick={() => {
                          onOpenAccountModal();
                          setAccountMenuOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-1.5 text-[#12231A] font-medium hover:bg-[#FAF8F5] cursor-pointer flex items-center justify-between"
                      >
                        <span>Address Book & Orders</span>
                        <span className="text-[9px] text-[#96F816] bg-[#12231A] px-1 py-0.5 rounded font-bold">Saved</span>
                      </button>
                    )}
                    {onTrackOrder && (
                      <button
                        onClick={() => {
                          onTrackOrder();
                          setAccountMenuOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-1.5 text-[#12231A] hover:bg-[#FAF8F5] cursor-pointer"
                      >
                        Track My Orders
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setCurrentView('admin');
                        setAccountMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-1.5 text-[#12231A] font-medium hover:bg-[#FAF8F5] flex items-center justify-between cursor-pointer"
                    >
                      <span>HIFFYY Commerce OS</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-[#12231A]" />
                    </button>
                    <button
                      onClick={() => {
                        setCurrentView('pos');
                        setAccountMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-1.5 text-[#12231A] hover:bg-[#FAF8F5] flex items-center justify-between cursor-pointer"
                    >
                      <span>Retail POS Terminal</span>
                      <Layers className="w-3.5 h-3.5 text-[#717A75]" />
                    </button>
                    {user && (
                      <button
                        onClick={() => {
                          logout();
                          setAccountMenuOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-1.5 text-gray-500 hover:text-black hover:bg-[#FAF8F5] cursor-pointer border-t border-[#E6DFD5] mt-1"
                      >
                        Sign Out
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="relative z-40 mx-4 sm:mx-8 mb-2 p-3 bg-white/95 backdrop-blur-md rounded-2xl border border-white/60 shadow-xl md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-1.5 text-xs font-semibold text-[#12231A] tracking-wider uppercase">
              {/* Account / Login Status Block requested by user */}
              <div className="px-3 py-2.5 rounded-lg bg-[#FAF8F5] border border-[#E6DFD5] flex items-center justify-between mb-1">
                {user ? (
                  <div className="flex items-center gap-2.5">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'Patron'}
                        className="w-8 h-8 rounded-full object-cover border-2 border-[#96F816]"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#12231A] text-[#96F816] flex items-center justify-center font-bold">
                        {user.displayName?.[0] || 'U'}
                      </div>
                    )}
                    <div className="text-left">
                      <p className="text-xs font-bold text-[#12231A] truncate max-w-[140px]">{user.displayName || 'Patron'}</p>
                      <p className="text-[9px] text-[#717A75] lowercase truncate max-w-[140px]">{user.email}</p>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      openAuthModal();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2.5 text-[#12231A] hover:text-black w-full text-left cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#12231A] text-[#96F816] flex items-center justify-center shadow-sm">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold tracking-wider">Sign In / Login</p>
                      <p className="text-[9px] text-[#717A75] normal-case">Access order history & saved items</p>
                    </div>
                  </button>
                )}
                {user && (
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-[10px] text-red-600 font-bold uppercase px-2 py-1 bg-red-50 rounded hover:bg-red-100 cursor-pointer"
                  >
                    Logout
                  </button>
                )}
              </div>

              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setMobileMenuOpen(false);
                }}
                className="px-3 py-2 rounded-lg hover:bg-[#96F816]/30 transition-colors flex items-center justify-between"
              >
                <span>Home</span>
                <Home className="w-3.5 h-3.5 text-[#12231A]/60" />
              </a>
              <a
                href="#journal"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-[#96F816]/30 transition-colors flex items-center justify-between"
              >
                <span>About Us</span>
                <span className="text-[10px] text-[#717A75] font-normal normal-case">Our Story</span>
              </a>
              <a
                href="#collection"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-[#96F816]/30 transition-colors flex items-center justify-between"
              >
                <span>Shop</span>
                <ShoppingBag className="w-3.5 h-3.5 text-[#12231A]/60" />
              </a>
              <a
                href="#journal"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-[#96F816]/30 transition-colors flex items-center justify-between"
              >
                <span>Story</span>
                <Briefcase className="w-3.5 h-3.5 text-[#12231A]/60" />
              </a>
              <a
                href="https://wa.me/919477831477"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/25 transition-colors flex items-center justify-between text-emerald-900"
              >
                <span>Contact Us</span>
                <span className="text-[10px] bg-[#25D366] text-white px-2 py-0.5 rounded font-mono font-bold">WhatsApp</span>
              </a>
            </nav>
          </div>
        )}

        {/* Main Hero Body (Compact) */}
        <div className="relative z-10 min-h-[460px] sm:min-h-[500px] lg:min-h-[530px] px-5 sm:px-8 lg:px-10 pt-4 sm:pt-6 pb-6 sm:pb-8 flex flex-col justify-between">
          {/* Upper Body: Left Dynamic Typography & Right Floating Social Proof */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
            {/* Left Column: Heading and Subtitle that smoothly reflect active product */}
            <div className="lg:col-span-6 pt-2 sm:pt-4 z-20">
              {/* Product Badge Pill in #96F816 with individual typography */}
              {(() => {
                const sub = activeProduct.subtitleStyle;
                const pillBg = sub?.pillBgColor || '#12231A';
                const textColor = sub?.color || '#96F816';
                return (
                  <div
                    style={{
                      backgroundColor: pillBg,
                      borderColor: hexToRgba(textColor, 0.35),
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-3 shadow-sm border transition-all duration-500"
                  >
                    <Sparkles className="w-3 h-3" style={{ color: textColor }} />
                    <span
                      style={getTypographyStyle(sub, {
                        color: '#96F816',
                        weight: '600',
                        transform: 'uppercase',
                        letterSpacing: '0.05em',
                      })}
                      className="text-[10px]"
                    >
                      {activeProduct.subtitle}
                    </span>
                  </div>
                );
              })()}

              <h1 className="leading-[1.08] transition-all duration-500">
                <span
                  style={getTypographyStyle(activeProduct.headlineFirstStyle, {
                    color: '#FFFFFF',
                    weight: '500',
                  })}
                  className="block text-3xl sm:text-4xl lg:text-[48px] tracking-tight"
                >
                  {activeProduct.headlineFirst}
                </span>
                <span
                  style={getTypographyStyle(activeProduct.headlineSecondStyle, {
                    color: '#FFFFFF',
                    weight: '500',
                    family: 'serif',
                  })}
                  className="block text-3xl sm:text-4xl lg:text-[48px] tracking-tight drop-shadow-sm font-serif"
                >
                  {activeProduct.headlineSecond}
                </span>
              </h1>

              <p
                style={getTypographyStyle(activeProduct.descriptionStyle, {
                  color: 'rgba(255, 255, 255, 0.9)',
                  weight: '400',
                })}
                className="mt-2.5 sm:mt-3 text-xs sm:text-[13px] max-w-sm sm:max-w-md leading-relaxed transition-opacity duration-500"
              >
                {activeProduct.description}
              </p>

              {/* Progress Dots Indicator in #96F816 */}
              <div className="flex items-center gap-1.5 mt-4">
                {heroProducts.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                      idx === activeIndex
                        ? 'w-7 bg-[#96F816] shadow-sm shadow-[#96F816]/50'
                        : 'w-2 bg-white/40 hover:bg-white/70'
                    }`}
                    title={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Right Column: Floating Social Proof & Active Product Add to Cart CTA */}
            <div className="lg:col-span-6 flex flex-col items-start lg:items-end z-20 pt-2 lg:pt-8">
              <div className="flex flex-col items-start lg:items-end">
                {/* Avatar Stack + Dynamic Stat Badge */}
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"
                      alt="Customer"
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-[#A0B7A3] object-cover shadow-sm"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&h=120&q=80"
                      alt="Customer"
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-[#A0B7A3] object-cover shadow-sm"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80"
                      alt="Customer"
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-[#A0B7A3] object-cover shadow-sm"
                    />
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {activeProduct.statBadge}
                  </span>
                </div>

                {/* Subtext with Active Product Title with individual typography */}
                <p
                  style={getTypographyStyle(activeProduct.titleStyle, {
                    color: 'rgba(255, 255, 255, 0.95)',
                    weight: '600',
                    letterSpacing: '0.025em',
                  })}
                  className="text-xs mt-1.5 mb-3"
                >
                  {activeProduct.title}
                </p>

                {/* Floating Add to Cart Pill Button with #96F816 and Black Accent */}
                <button
                  onClick={(e) => handleQuickAdd(activeProduct, e)}
                  className="inline-flex items-center gap-2 pl-4 sm:pl-5 pr-1.5 py-1.5 bg-white text-[#12231A] rounded-full font-bold text-xs sm:text-[13px] hover:bg-[#96F816] transition-all cursor-pointer shadow-xl hover:shadow-[#96F816]/30 active:scale-95 group border border-white/80"
                >
                  <span>
                    {addedItemKey === activeProduct.id
                      ? 'Added to Bag ✓'
                      : `Add to Cart • ${
                          currency === 'USD'
                            ? `$${activeProduct.priceUSD ?? Math.round((activeProduct.priceINR ?? 3499) / 83)}`
                            : `₹${(activeProduct.priceINR ?? 3499).toLocaleString()}`
                        }`}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-[#12231A] text-white group-hover:bg-black group-hover:text-[#96F816] flex items-center justify-center transition-colors">
                    {addedItemKey === activeProduct.id ? (
                      <Check className="w-3.5 h-3.5 text-[#96F816]" />
                    ) : (
                      <ShoppingBag className="w-3.5 h-3.5" />
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>



          {/* Bottom Carousel Section with Green Navigation Arrows (< and >) */}
          <div className="relative z-20 pt-6 sm:pt-8 mt-auto">
            {/* Carousel Frame with Prev & Next Arrows in #96F816 */}
            <div className="relative flex items-center justify-between">
              {/* Left Arrow Button (<) in #96F816 */}
              <button
                onClick={goToPrev}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#96F816] text-[#12231A] hover:bg-[#85e110] flex items-center justify-center shadow-lg shadow-[#96F816]/30 hover:scale-110 active:scale-95 transition-all cursor-pointer z-30 shrink-0 mr-1.5 sm:mr-3 border-2 border-white/60"
                title="Previous Fragrance Product"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
              </button>

              {/* Product Cards Row (Responsive No-Wrap Carousel: Desktop 4, Tablet 3, Mobile 2) */}
              <div className="flex-1 relative overflow-visible">
                <div
                  ref={carouselContainerRef}
                  className="flex flex-nowrap gap-2.5 sm:gap-3.5 items-end overflow-x-auto scroll-smooth scrollbar-none pb-2 pt-6 overflow-y-visible"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {heroProducts.map((prod, idx) => {
                    const isActive = idx === activeIndex;

                    // Individual Slide Settings Isolation:
                    // If customCardGlass is enabled on this specific slide, use its individual properties.
                    // Otherwise, gracefully fall back to the global heroGlassSettings.
                    const useIndividual = Boolean(prod.customCardGlass);
                    const tintColor = useIndividual && prod.cardGlassColor ? prod.cardGlassColor : (heroGlassSettings?.tintColor || '#FFFFFF');
                    const opacity = useIndividual && prod.cardGlassOpacity !== undefined ? prod.cardGlassOpacity : (heroGlassSettings?.opacity ?? 85);
                    const blur = useIndividual && prod.cardGlassBlur !== undefined ? prod.cardGlassBlur : (heroGlassSettings?.blur ?? 16);
                    const borderColor = useIndividual && prod.cardBorderColor ? prod.cardBorderColor : (heroGlassSettings?.borderColor || '#FFFFFF');
                    const borderOpacity = useIndividual && prod.cardBorderOpacity !== undefined ? prod.cardBorderOpacity : (heroGlassSettings?.borderOpacity ?? 50);
                    const glowColor = useIndividual && prod.cardGlowColor ? prod.cardGlowColor : (heroGlassSettings?.glowColor || '#96F816');
                    const textMode = useIndividual && prod.cardGlassTextColor ? prod.cardGlassTextColor : (heroGlassSettings?.cardTextColor || 'auto');

                    const glassBg = hexToRgba(tintColor, opacity / 100);
                    const glassBorder = `1px solid ${hexToRgba(borderColor, borderOpacity / 100)}`;
                    const glassBlur = `${blur}px`;
                    const glassRadius = heroGlassSettings?.enabled ? `${heroGlassSettings.borderRadius ?? 16}px` : '16px';
                    const glassShadow = (heroGlassSettings?.shadowGlow || useIndividual)
                      ? `0 10px 25px -5px ${hexToRgba(glowColor, 0.25)}, 0 8px 10px -6px ${hexToRgba(glowColor, 0.2)}`
                      : undefined;

                    const isLightText =
                      textMode === 'light' ||
                      (textMode !== 'dark' && isColorDark(tintColor) && opacity > 40);

                    return (
                      <div
                        key={prod.id}
                        onClick={() => setActiveIndex(idx)}
                        style={{
                          backgroundColor: glassBg,
                          backdropFilter: (heroGlassSettings?.enabled || useIndividual) ? `blur(${glassBlur})` : undefined,
                          WebkitBackdropFilter: (heroGlassSettings?.enabled || useIndividual) ? `blur(${glassBlur})` : undefined,
                          border: isActive ? `2px solid ${glowColor}` : glassBorder,
                          borderRadius: glassRadius,
                          boxShadow: isActive
                            ? `0 12px 30px -4px ${hexToRgba(glowColor, 0.45)}`
                            : glassShadow,
                        }}
                        className={`relative p-2.5 sm:p-3 transition-all duration-300 cursor-pointer flex flex-col justify-between h-[165px] sm:h-[180px] shrink-0 w-[calc(50%-5px)] sm:w-[calc(33.333%-8px)] lg:w-[calc(25%-9px)] overflow-visible ${
                          isActive
                            ? '-translate-y-1'
                            : 'hover:shadow-md opacity-90 hover:opacity-100'
                        }`}
                      >
                        {/* Wishlist Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(prod.id);
                          }}
                          className={`absolute top-2 right-2 p-1.5 rounded-full shadow-sm transition-colors cursor-pointer ${
                            wishlist.includes(prod.id)
                              ? 'bg-[#96F816] text-[#12231A]'
                              : isLightText
                              ? 'bg-black/40 text-white hover:bg-[#96F816] hover:text-[#12231A]'
                              : 'bg-white/90 text-[#12231A] hover:bg-[#96F816]'
                          }`}
                          title="Save to Wishlist"
                        >
                          <Heart className={`w-3 h-3 ${wishlist.includes(prod.id) ? 'fill-[#12231A]' : ''}`} />
                        </button>

                        {/* Product Packshot Photo with object-fit (overflow-hidden removed) */}
                        <div className="w-full h-18 sm:h-22 flex items-center justify-center mb-1 relative overflow-visible">
                          <img
                            src={prod.cardImage}
                            alt={prod.title}
                            style={{
                              objectFit: prod.cardImageObjectFit || 'contain',
                              width: prod.cardImageObjectFit === 'cover' || prod.cardImageObjectFit === 'fill' ? '100%' : undefined,
                              height: prod.cardImageObjectFit === 'cover' || prod.cardImageObjectFit === 'fill' ? '100%' : undefined,
                            }}
                            className="max-h-full max-w-full transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>

                        <div>
                          {/* Price */}
                          <div className={`font-extrabold text-xs sm:text-sm tracking-tight flex items-center justify-between ${
                            isLightText ? 'text-white' : 'text-[#12231A]'
                          }`}>
                            <span>₹{(prod.priceINR ?? 3499).toLocaleString()}</span>
                          </div>

                          {/* Title */}
                          <div
                            style={prod.titleStyle ? getTypographyStyle(prod.titleStyle) : undefined}
                            className={`text-[10px] sm:text-[11px] font-semibold leading-tight line-clamp-1 mt-0.5 ${
                              !prod.titleStyle?.color ? (isLightText ? 'text-gray-100' : 'text-slate-800') : ''
                            }`}
                          >
                            {prod.title}
                          </div>

                          {/* Bottom Volume & Action Button */}
                          <div className="flex items-center justify-between gap-1 mt-1.5">
                            <span className={`text-[8px] font-medium ${
                              isLightText ? 'text-gray-300' : 'text-slate-400'
                            }`}>
                              {prod.volumeLabel}
                            </span>

                            <button
                              onClick={(e) => handleQuickAdd(prod, e)}
                              style={{
                                backgroundColor: isActive ? glowColor : undefined,
                                color: isActive ? (isColorDark(glowColor) ? '#FFFFFF' : '#12231A') : undefined,
                              }}
                              className={`text-[9px] sm:text-[10px] font-bold px-2.5 py-0.5 rounded-full transition-all cursor-pointer shrink-0 shadow-xs ${
                                isActive
                                  ? 'hover:brightness-110'
                                  : isLightText
                                  ? 'bg-white/90 text-[#12231A] hover:bg-white'
                                  : 'bg-black text-white hover:bg-slate-800'
                              }`}
                            >
                              {addedItemKey === prod.id ? 'Added ✓' : 'Book'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Arrow Button (>) in #96F816 */}
              <button
                onClick={goToNext}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#96F816] text-[#12231A] hover:bg-[#85e110] flex items-center justify-center shadow-lg shadow-[#96F816]/30 hover:scale-110 active:scale-95 transition-all cursor-pointer z-30 shrink-0 ml-1.5 sm:ml-3 border-2 border-white/60"
                title="Next Fragrance Product"
              >
                <ChevronRight className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Quick Navigation Dock (Appears when scrolling down past hero: with Search, Wishlist, and Portfolio) */}
      {isScrolled && (
        <aside
          aria-label="Floating quick navigation dock"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-black/40 backdrop-blur-xl px-3.5 py-1.5 rounded-full border border-white/20 shadow-2xl flex items-center gap-2 sm:gap-2.5 animate-in fade-in duration-300"
        >
          <BrandLogo
            variant="mark"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          />
          <div className="h-4 w-px bg-white/20" />
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#96F816] hover:text-[#12231A] text-white flex items-center justify-center transition-all"
            title="Home"
          >
            <Home className="w-3.5 h-3.5" />
          </a>
          <a
            href="#collection"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#96F816] hover:text-[#12231A] text-white flex items-center justify-center transition-all"
            title="Shop / Collections"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
          </a>
          <a
            href="#journal"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#96F816] hover:text-[#12231A] text-white flex items-center justify-center transition-all"
            title="Story"
          >
            <Briefcase className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={() => setSearchOpen(true)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#96F816] hover:text-[#12231A] text-white flex items-center justify-center transition-all cursor-pointer"
            title="Search Fragrances"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              if (onOpenWishlist) {
                onOpenWishlist();
              } else if (onOpenAccountModal) {
                onOpenAccountModal('wishlist');
              } else {
                const el = document.getElementById('collection');
                el?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#96F816] hover:text-[#12231A] text-white flex items-center justify-center transition-all cursor-pointer relative"
            title="Saved Fragrances (Wishlist)"
          >
            <Heart className="w-3.5 h-3.5" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#96F816] text-[#12231A] text-[9px] font-black flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>
          <button
            onClick={onOpenCart}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#96F816] hover:text-[#12231A] text-white flex items-center justify-center transition-all cursor-pointer relative"
            title="Shopping Cart"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#96F816] text-[#12231A] text-[9px] font-black flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          {/* Extreme Right: Login / Account User Image */}
          <button
            onClick={() => {
              if (onOpenAccountModal) {
                onOpenAccountModal();
              } else {
                setAccountMenuOpen(true);
              }
            }}
            className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#96F816] hover:scale-105 transition-all flex items-center justify-center shrink-0 cursor-pointer shadow-md bg-white/20 text-white"
            title={user ? (user.displayName || 'Customer Account') : 'Sign In / Login'}
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Customer'}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon className="w-3.5 h-3.5 text-white" />
            )}
          </button>
        </aside>
      )}

      {/* Search Overlay Modal (Compact) */}
      {searchOpen && (
        <div className="fixed inset-0 bg-[#12231A]/70 backdrop-blur-sm z-50 flex flex-col items-center pt-16 px-4">
          <div className="w-full max-w-lg bg-white p-4 sm:p-5 shadow-2xl border border-[#E6DFD5] rounded-xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSearchOpen(false)}
              className="absolute top-3.5 right-3.5 text-[#717A75] hover:text-black cursor-pointer p-1 rounded-full hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="text-[9px] tracking-[0.2em] uppercase text-[#12231A] font-bold block mb-1">
              Search Fragrances, Notes or Families
            </span>
            <div className="relative mt-1.5">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#717A75]" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Try: 'Oud', 'Vetiver', 'Kannauj Rose', 'Saffron'..."
                className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs rounded-lg focus:outline-none focus:border-[#96F816] focus:ring-1 focus:ring-[#96F816]"
              />
            </div>

            {/* Results */}
            <div className="mt-3 max-h-60 overflow-y-auto">
              {searchResults.length > 0 ? (
                <div className="space-y-1.5">
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => {
                        setSelectedProduct(product);
                        setSearchOpen(false);
                        const collectionEl = document.getElementById('collection');
                        collectionEl?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="flex items-center gap-3 p-2 hover:bg-[#FAF8F5] cursor-pointer transition-colors border-b border-[#F4EFE6] last:border-0 rounded-lg text-xs"
                    >
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-10 h-12 object-cover rounded border border-[#E6DFD5]"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-serif font-bold text-[#12231A] truncate">{product.title}</h4>
                        <p className="text-[10px] text-[#717A75] truncate">
                          {product.fragranceFamily} • {product.concentration}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-[#12231A]">
                          ₹{product.sellingPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchQuery.trim() ? (
                <p className="text-xs text-center text-[#717A75] py-4">
                  No matching olfactory creations found for "{searchQuery}".
                </p>
              ) : (
                <div className="py-2.5">
                  <span className="text-[9px] tracking-wider uppercase text-[#717A75] block mb-1.5 font-medium">
                    Popular Olfactory Searches:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {['Wild Assam Oud', 'Monsoon Petrichor', 'Kashmiri Saffron', 'Extrait de Parfum', 'Kannauj Rose'].map(
                      (tag) => (
                        <button
                          key={tag}
                          onClick={() => setSearchQuery(tag)}
                          className="px-2 py-0.5 bg-[#FAF8F5] border border-[#E6DFD5] text-[10px] text-[#12231A] hover:border-[#96F816] hover:bg-[#96F816]/10 rounded cursor-pointer transition-colors"
                        >
                          {tag}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
