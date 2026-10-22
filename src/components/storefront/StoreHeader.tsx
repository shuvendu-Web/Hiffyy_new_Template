import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ShoppingBag, Heart, Search, ShieldCheck, User as UserIcon, X, Sparkles, Layers } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface StoreHeaderProps {
  onOpenCart: () => void;
  onOpenQuiz: () => void;
  onTrackOrder: () => void;
  onOpenAccountModal?: () => void;
}

export const StoreHeader: React.FC<StoreHeaderProps> = ({
  onOpenCart,
  onOpenQuiz,
  onTrackOrder,
  onOpenAccountModal,
}) => {
  const { cart, wishlist, products, setSelectedProduct, setCurrentView, user, loginWithGoogle, openAuthModal, logout } = useStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

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

  return (
    <header className="sticky top-0 z-40 bg-[#EBF2EC]/95 backdrop-blur-md border-b border-[#A0B7A3]/50 transition-all">
      {/* Announcement Bar */}
      <div className="bg-[#12231A] text-[#EBF2EC] text-[11px] tracking-[0.2em] uppercase py-2 px-4 text-center font-medium flex items-center justify-center gap-3">
        <span>COMPLIMENTARY SHIPPING ACROSS INDIA &gt; ₹1999</span>
        <span className="opacity-40">•</span>
        <span>EACH FLACON INCLUDES 2ML TEST VIAL BEFORE BREAKING SECURITY SEAL</span>
        <span className="opacity-40 hidden md:inline">•</span>
        <span className="hidden md:inline text-[#96F816] font-bold">CODE: FIRSTHIFFYY FOR 10% OFF</span>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7 text-xs font-semibold tracking-[0.12em] uppercase text-[#12231A]/90">
            <a href="#collection" className="hover:text-[#12231A] hover:underline underline-offset-8 transition-colors">
              The Flacons
            </a>
            <a href="#pyramid" className="hover:text-[#12231A] hover:underline underline-offset-8 transition-colors">
              Notes Pyramid
            </a>
            <button
              onClick={onOpenQuiz}
              className="flex items-center gap-1.5 text-[#12231A] hover:text-black transition-colors cursor-pointer group"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#96F816] fill-[#96F816] group-hover:scale-110 transition-transform" />
              <span className="underline decoration-[#96F816] decoration-2 underline-offset-4">Scent Diagnostic</span>
            </button>
            <a href="#journal" className="hover:text-[#12231A] hover:underline underline-offset-8 transition-colors">
              Journal
            </a>
            {onOpenAccountModal && (
              <button
                onClick={onOpenAccountModal}
                className="hover:text-[#12231A] hover:underline underline-offset-8 transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>Address Book</span>
              </button>
            )}
            <button
              onClick={onTrackOrder}
              className="hover:text-[#12231A] hover:underline underline-offset-8 transition-colors cursor-pointer"
            >
              Track Order
            </button>
          </nav>

          {/* Center Brand Identity with New Luxury Logo */}
          <BrandLogo
            variant="header"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          />

          {/* Right Action Icons */}
          <div className="flex items-center space-x-4 sm:space-x-5">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-[#12231A] hover:text-black transition-colors cursor-pointer"
              title="Search fragrances or notes"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Wishlist */}
            <a
              href="#collection"
              className="relative p-2 text-[#12231A] hover:text-black transition-colors hidden sm:block"
              title="Saved Fragrances"
            >
              <Heart className="w-4 h-4" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#96F816] text-[#12231A] text-[9px] font-black flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </a>

            {/* User Account / Auth */}
            <div className="relative">
              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="p-2 text-[#12231A] hover:text-black transition-colors flex items-center gap-1 cursor-pointer"
                title="Account"
              >
                {user ? (
                  <div className="w-6 h-6 rounded-full bg-[#12231A] text-[#96F816] text-[10px] flex items-center justify-center font-bold">
                    {user.displayName?.[0] || user.email?.[0] || 'U'}
                  </div>
                ) : (
                  <UserIcon className="w-4 h-4" />
                )}
              </button>

              {accountMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-[#E6DFD5] shadow-xl py-3 z-50 rounded-sm">
                  {user ? (
                    <div className="px-4 pb-3 border-b border-[#E6DFD5]">
                      <p className="text-xs font-semibold text-[#12231A] truncate">{user.displayName || 'Patron'}</p>
                      <p className="text-[11px] text-[#717A75] truncate">{user.email}</p>
                    </div>
                  ) : (
                    <div className="px-4 pb-3 border-b border-[#E6DFD5]">
                      <p className="text-xs font-semibold text-[#12231A]">HIFFYY Patron Account</p>
                      <p className="text-[11px] text-[#717A75]">Sign in to access orders & Commerce OS</p>
                      <button
                        onClick={async () => {
                          await loginWithGoogle({ email: 'shuvendu.dhenki@gmail.com', displayName: 'Shuvendu Dhenki' });
                          setAccountMenuOpen(false);
                        }}
                        className="mt-2 w-full py-1.5 px-3 bg-[#12231A] text-[#96F816] text-[11px] tracking-wider uppercase font-semibold hover:bg-black cursor-pointer rounded flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <span>Sign In as Super Admin</span>
                      </button>
                      <button
                        onClick={() => {
                          openAuthModal();
                          setAccountMenuOpen(false);
                        }}
                        className="mt-1.5 w-full py-1 text-center text-[10px] text-[#886938] hover:text-[#12231A] font-medium cursor-pointer"
                      >
                        Choose another account &rarr;
                      </button>
                    </div>
                  )}

                  <div className="pt-2">
                    {onOpenAccountModal && (
                      <button
                        onClick={() => {
                          onOpenAccountModal();
                          setAccountMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-1.5 text-xs text-[#12231A] font-bold hover:bg-[#FAF8F5] cursor-pointer flex items-center justify-between"
                      >
                        <span>Address Book & Account</span>
                        <span className="text-[10px] text-[#C5A880]">Saved</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onTrackOrder();
                        setAccountMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-1.5 text-xs text-[#1B201E] hover:bg-[#FAF8F5] cursor-pointer"
                    >
                      Track My Orders
                    </button>
                    <button
                      onClick={() => {
                        setCurrentView('admin');
                        setAccountMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-1.5 text-xs text-[#886938] font-medium hover:bg-[#FAF8F5] flex items-center justify-between cursor-pointer"
                    >
                      <span>HIFFYY Commerce OS</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />
                    </button>
                    <button
                      onClick={() => {
                        setCurrentView('pos');
                        setAccountMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-1.5 text-xs text-[#12231A] hover:bg-[#FAF8F5] flex items-center justify-between cursor-pointer"
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
                        className="w-full text-left px-4 py-1.5 text-xs text-[#12231A]/70 hover:text-black hover:bg-[#FAF8F5] border-t border-[#E6DFD5] mt-1 cursor-pointer"
                      >
                        Sign Out
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bag / Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2 text-[#12231A] hover:text-black transition-colors cursor-pointer flex items-center gap-1.5 group"
              title="Shopping Bag"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#96F816] text-[#12231A] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {cartCount}
                  </span>
                )}
              </div>
            </button>

            {/* Quick Portal Switcher */}
            <button
              onClick={() => setCurrentView('admin')}
              className="hidden md:flex items-center gap-1.5 py-1.5 px-3 bg-[#96F816] text-[#12231A] hover:bg-[#85e110] border border-[#12231A] text-[10px] tracking-[0.15em] uppercase font-bold transition-all cursor-pointer shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin OS
            </button>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 bg-[#12231A]/70 backdrop-blur-sm z-50 flex flex-col items-center pt-24 px-4">
          <div className="w-full max-w-2xl bg-white p-6 shadow-2xl border border-[#E6DFD5] rounded-sm relative">
            <button
              onClick={() => setSearchOpen(false)}
              className="absolute top-4 right-4 text-[#717A75] hover:text-black cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] tracking-[0.2em] uppercase text-[#886938] font-bold block mb-1">
              Search Fragrances, Notes or Families
            </span>
            <div className="relative mt-2">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#717A75]" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Try: 'Oud', 'Vetiver', 'Kannauj Rose', 'Pampore Saffron', 'Extrait'..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#E6DFD5] text-sm focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            {/* Results */}
            <div className="mt-4 max-h-80 overflow-y-auto">
              {searchResults.length > 0 ? (
                <div className="space-y-3">
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => {
                        setSelectedProduct(product);
                        setSearchOpen(false);
                      }}
                      className="flex items-center gap-4 p-2.5 hover:bg-[#FAF8F5] cursor-pointer transition-colors border-b border-[#F4EFE6] last:border-0"
                    >
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-12 h-14 object-cover rounded-sm border border-[#E6DFD5]"
                      />
                      <div className="flex-1">
                        <h4 className="text-sm font-serif font-bold text-[#12231A]">{product.title}</h4>
                        <p className="text-[11px] text-[#717A75]">
                          {product.fragranceFamily} • {product.concentration}
                        </p>
                        <p className="text-[10px] text-[#886938] mt-0.5">
                          Top: {product.notes.top.slice(0, 2).join(', ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold text-[#12231A]">₹{product.sellingPrice.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchQuery.trim() ? (
                <p className="text-xs text-center text-[#717A75] py-6">
                  No matching olfactory creations found for "{searchQuery}". Try searching by note like 'amber' or 'rose'.
                </p>
              ) : (
                <div className="py-4">
                  <span className="text-[10px] tracking-wider uppercase text-[#717A75] block mb-2 font-medium">
                    Popular Olfactory Searches:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {['Wild Assam Oud', 'Monsoon Petrichor', 'Kashmiri Saffron', 'Extrait de Parfum', 'Kannauj Rose'].map(
                      (tag) => (
                        <button
                          key={tag}
                          onClick={() => setSearchQuery(tag)}
                          className="px-2.5 py-1 bg-[#FAF8F5] border border-[#E6DFD5] text-[11px] text-[#12231A] hover:border-[#C5A880] cursor-pointer"
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
    </header>
  );
};
