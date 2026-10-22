import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Sparkles,
  Layers,
  Droplets,
  Sun,
  Wind,
  Moon,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  ShoppingBag,
  Heart,
  Check,
  Clock,
  FlaskConical,
  ShieldCheck,
  Award,
  ThermometerSnowflake,
} from 'lucide-react';
import { Product } from '../../types';
import { INITIAL_PRODUCTS } from '../../data/initialData';

const SLIDE_DURATION = 5000; // 5 seconds per slide

export const OlfactoryPyramidSection: React.FC = () => {
  const { products, setSelectedProduct, addToCart, wishlist, toggleWishlist } = useStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);
  const [justAdded, setJustAdded] = useState(false);

  // Standard fragrance families in editorial presentation order
  const standardFamilies = useMemo(
    () => [
      'Oriental Woody',
      'Fresh Citrus',
      'Amber Gourmand',
      'Floral Attar',
      'Smoky Leather',
      'Aquatic Aromatic',
    ],
    []
  );

  // Gather active products with fallback
  const sourceProducts = useMemo(() => {
    const list = products && products.length > 0 ? products : INITIAL_PRODUCTS;
    const active = list.filter((p) => p.status !== 'archived');
    return active.length > 0 ? active : INITIAL_PRODUCTS;
  }, [products]);

  // Build the list of products for the carousel so all tabs are visited
  const carouselProducts = useMemo(() => {
    const familyOrderedProducts: Product[] = [];
    const usedIds = new Set<string>();

    // First, for each standard family, find all matching products
    standardFamilies.forEach((fam) => {
      const matches = sourceProducts.filter((p) => p.fragranceFamily === fam);
      matches.forEach((p) => {
        if (!usedIds.has(p.id)) {
          familyOrderedProducts.push(p);
          usedIds.add(p.id);
        }
      });
    });

    // Then, append any remaining active products
    sourceProducts.forEach((p) => {
      if (!usedIds.has(p.id)) {
        familyOrderedProducts.push(p);
        usedIds.add(p.id);
      }
    });

    return familyOrderedProducts.length > 0 ? familyOrderedProducts : INITIAL_PRODUCTS;
  }, [sourceProducts, standardFamilies]);

  // Available families with active products
  const availableFamilies = useMemo(() => {
    const found = Array.from(new Set(carouselProducts.map((p) => p.fragranceFamily).filter(Boolean)));
    const ordered = standardFamilies.filter((fam) => found.includes(fam as any));
    found.forEach((fam) => {
      if (!ordered.includes(fam)) ordered.push(fam);
    });
    return ordered.length > 0 ? ordered : standardFamilies;
  }, [carouselProducts, standardFamilies]);

  const currentProd: Product = carouselProducts[currentIndex] || carouselProducts[0];
  const activeFamily = currentProd?.fragranceFamily || availableFamilies[0];
  const isWishlisted = currentProd ? wishlist.includes(currentProd.id) : false;

  // Jump to specific slide and reset timer progress
  const goToSlide = (idx: number) => {
    setCurrentIndex(idx);
    setProgress(0);
  };

  const handlePrev = () => {
    goToSlide((currentIndex - 1 + carouselProducts.length) % carouselProducts.length);
  };

  const handleNext = () => {
    goToSlide((currentIndex + 1) % carouselProducts.length);
  };

  // When clicking a tab button, jump directly to that family's product
  const handleSelectFamily = (fam: string) => {
    const targetIdx = carouselProducts.findIndex((p) => p.fragranceFamily === fam);
    if (targetIdx !== -1) {
      goToSlide(targetIdx);
    }
  };

  // Auto carousel timer loop with pause-on-hover & progress bar tracking
  useEffect(() => {
    if (!isPlaying || isHovered || carouselProducts.length <= 1) return;

    const stepMs = 50;
    const increment = (stepMs / SLIDE_DURATION) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentIndex((curr) => (curr + 1) % carouselProducts.length);
          return 0;
        }
        return prev + increment;
      });
    }, stepMs);

    return () => clearInterval(timer);
  }, [isPlaying, isHovered, carouselProducts.length, currentIndex]);

  // Quick Add to Cart
  const handleQuickAdd = () => {
    if (!currentProd) return;
    const variantSize = currentProd.variants?.[0]?.size || '50ml';
    addToCart(currentProd, variantSize, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  if (!currentProd) return null;

  return (
    <section id="pyramid" className="py-20 bg-[#FAFBF9] border-b border-[#A0B7A3]/30 relative overflow-hidden">
      {/* Decorative ambient background accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#96F816]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#A0B7A3]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase font-bold text-[#12231A] mb-3 px-3.5 py-1.5 bg-[#EBF2EC] rounded-full border border-[#A0B7A3]/40 shadow-xs">
            <FlaskConical className="w-3.5 h-3.5 text-[#12231A]" />
            <span>The Science of Maceration</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#96F816] animate-pulse" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#12231A] font-extrabold mb-4 tracking-tight">
            The Architecture of Scent
          </h2>

          <p className="text-xs sm:text-sm text-[#12231A]/75 font-light leading-relaxed">
            Every Hiffyy creation undergoes a proprietary 60–90 day cold-maceration protocol in micro-batches.
            Observe how volatile head notes transition through opulent floral hearts into deep,
            resinous woods that anchor on skin through tropical subcontinental heat.
          </p>
        </div>

        {/* Carousel Controls & Auto-Play Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 px-2">
          {/* Left: Auto-cycle status & Progress Bar */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? 'Pause Auto-Carousel' : 'Resume Auto-Carousel'}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EBF2EC] hover:bg-[#12231A] hover:text-[#96F816] text-[#12231A] text-[11px] font-bold tracking-wider uppercase transition-all cursor-pointer border border-[#A0B7A3]/40"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3 h-3 text-[#96F816]" />
                  <span>Auto-Changing</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 text-current" />
                  <span>Paused</span>
                </>
              )}
            </button>

            {/* Live Progress Bar Indicator */}
            <div className="w-28 sm:w-36 h-2 bg-[#EBF2EC] border border-[#A0B7A3]/40 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-[#96F816] transition-all duration-75 ease-linear rounded-full"
                style={{ width: `${isPlaying && !isHovered ? progress : 100}%` }}
              />
            </div>

            <span className="text-[11px] font-bold text-[#12231A]/60 hidden sm:inline-block">
              {currentIndex + 1} / {carouselProducts.length}
            </span>
          </div>

          {/* Right: Manual Previous / Next Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-[#12231A]/50 font-bold hidden md:inline-block mr-1">
              {isHovered ? 'Paused on hover' : 'Auto-cycles all tabs'}
            </span>
            <button
              onClick={handlePrev}
              aria-label="Previous Creation"
              className="w-8 h-8 rounded-full bg-white border border-[#A0B7A3]/50 flex items-center justify-center text-[#12231A] hover:bg-[#12231A] hover:text-[#96F816] hover:border-[#96F816] transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next Creation"
              className="w-8 h-8 rounded-full bg-white border border-[#A0B7A3]/50 flex items-center justify-center text-[#12231A] hover:bg-[#12231A] hover:text-[#96F816] hover:border-[#96F816] transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Family Tabs with Auto-Highlight Synchronization */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mb-10">
          {availableFamilies.map((fam) => {
            const isTabActive = activeFamily === fam;
            return (
              <button
                key={fam}
                onClick={() => handleSelectFamily(fam)}
                className={`relative px-4 sm:px-5 py-2.5 text-xs uppercase tracking-wider font-bold transition-all cursor-pointer rounded-full flex items-center gap-2 shadow-xs ${
                  isTabActive
                    ? 'bg-[#12231A] text-[#96F816] border-2 border-[#96F816] shadow-md scale-105'
                    : 'bg-white border border-[#A0B7A3]/50 text-[#12231A]/80 hover:border-[#96F816] hover:text-[#12231A]'
                }`}
              >
                {isTabActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#96F816] animate-pulse" />
                )}
                <span>{fam}</span>
              </button>
            );
          })}
        </div>

        {/* Carousel Showcase Card (Pauses auto-rotation on mouse hover) */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="bg-[#EBF2EC] border border-[#A0B7A3]/40 p-6 sm:p-10 rounded-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-sm relative"
        >
          {/* Top Progress Line across the card */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#A0B7A3]/20 rounded-t-2xl overflow-hidden">
            <div
              className="h-full bg-[#96F816] transition-all duration-75 ease-linear"
              style={{ width: `${isPlaying && !isHovered ? progress : 0}%` }}
            />
          </div>

          {/* Left: Interactive Olfactory Pyramid Architecture (Animated per slide) */}
          <div key={`pyramid-${currentProd.id}`} className="lg:col-span-7 space-y-4 animate-fade-in-slide">
            {/* Header info badge */}
            <div className="flex items-center justify-between pb-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#12231A]/70 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#12231A]" />
                Molecular Sillage Breakdown
              </span>
              <span className="text-[10px] tracking-wider uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-white border border-[#A0B7A3]/50 text-[#12231A]">
                {currentProd.fragranceFamily}
              </span>
            </div>

            {/* Top Notes Layer */}
            <div className="p-5 bg-white border-l-4 border-[#96F816] shadow-xs rounded-xl transition-all hover:shadow-md">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#12231A]">
                  <Sun className="w-4 h-4 text-[#96F816]" />
                  <span>Top Notes (0 - 30 Minutes of Sillage)</span>
                </div>
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#12231A]/50 bg-[#EBF2EC] px-2 py-0.5 rounded-sm">
                  High Volatility
                </span>
              </div>
              <p className="text-xs text-[#12231A]/70 mb-3 leading-relaxed">
                The immediate, effervescent greeting. Volatile citrus, crisp aldehydes, and fresh spices distilled to awaken the senses.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(currentProd.notes?.top || ['Wild Assam Oud', 'Bergamot']).map((note) => (
                  <span
                    key={note}
                    className="px-2.5 py-1 bg-[#EBF2EC] text-[#12231A] text-xs font-semibold rounded-md border border-[#A0B7A3]/30"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>

            {/* Heart Notes Layer */}
            <div className="p-5 bg-white border-l-4 border-[#A0B7A3] shadow-xs rounded-xl transition-all hover:shadow-md">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#12231A]">
                  <Wind className="w-4 h-4 text-[#A0B7A3]" />
                  <span>Heart Notes (30 Minutes - 4 Hours)</span>
                </div>
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#12231A]/50 bg-[#EBF2EC] px-2 py-0.5 rounded-sm">
                  Macerated Core
                </span>
              </div>
              <p className="text-xs text-[#12231A]/70 mb-3 leading-relaxed">
                The emotional soul and genuine character of the flacon. Rare steam-distilled floral absolutes, resins, and spiced woods.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(currentProd.notes?.heart || ['Damask Rose', 'Cardamom']).map((note) => (
                  <span
                    key={note}
                    className="px-2.5 py-1 bg-[#EBF2EC] text-[#12231A] text-xs font-semibold rounded-md border border-[#A0B7A3]/30"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>

            {/* Base Notes Layer */}
            <div className="p-5 bg-white border-l-4 border-[#12231A] shadow-xs rounded-xl transition-all hover:shadow-md">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#12231A]">
                  <Moon className="w-4 h-4 text-[#12231A]" />
                  <span>Base Notes (4 - 14+ Hours Anchor)</span>
                </div>
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#12231A]/50 bg-[#EBF2EC] px-2 py-0.5 rounded-sm">
                  Imperial Fixative
                </span>
              </div>
              <p className="text-xs text-[#12231A]/70 mb-3 leading-relaxed">
                Precious aged agarwoods, ambergris accords, and Mysore sandalwood molecules that fuse indelibly with individual dermal chemistry.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(currentProd.notes?.base || ['Mysore Sandalwood', 'Amber Resin']).map((note) => (
                  <span
                    key={note}
                    className="px-2.5 py-1 bg-[#EBF2EC] text-[#12231A] text-xs font-semibold rounded-md border border-[#A0B7A3]/30"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>

            {/* Maceration Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <div className="p-2.5 bg-white/80 rounded-lg border border-[#A0B7A3]/30 text-center">
                <div className="text-[10px] uppercase font-bold text-[#12231A]/60 flex items-center justify-center gap-1 mb-0.5">
                  <Clock className="w-3 h-3 text-[#12231A]" />
                  <span>Aging</span>
                </div>
                <span className="text-[11px] font-extrabold text-[#12231A]">75-90 Days</span>
              </div>

              <div className="p-2.5 bg-white/80 rounded-lg border border-[#A0B7A3]/30 text-center">
                <div className="text-[10px] uppercase font-bold text-[#12231A]/60 flex items-center justify-center gap-1 mb-0.5">
                  <ThermometerSnowflake className="w-3 h-3 text-[#12231A]" />
                  <span>Maceration</span>
                </div>
                <span className="text-[11px] font-extrabold text-[#12231A]">Cold Aged</span>
              </div>

              <div className="p-2.5 bg-white/80 rounded-lg border border-[#A0B7A3]/30 text-center">
                <div className="text-[10px] uppercase font-bold text-[#12231A]/60 flex items-center justify-center gap-1 mb-0.5">
                  <ShieldCheck className="w-3 h-3 text-[#12231A]" />
                  <span>Climate</span>
                </div>
                <span className="text-[11px] font-extrabold text-[#12231A]">42°C Stable</span>
              </div>

              <div className="p-2.5 bg-white/80 rounded-lg border border-[#A0B7A3]/30 text-center">
                <div className="text-[10px] uppercase font-bold text-[#12231A]/60 flex items-center justify-center gap-1 mb-0.5">
                  <Award className="w-3 h-3 text-[#12231A]" />
                  <span>Sillage</span>
                </div>
                <span className="text-[11px] font-extrabold text-[#12231A]">{currentProd.sillage || 'Imperial'}</span>
              </div>
            </div>
          </div>

          {/* Right: Flacon Showcase Card (Animated per slide) */}
          <div
            key={`flacon-${currentProd.id}`}
            className="lg:col-span-5 bg-white p-6 sm:p-7 border border-[#A0B7A3]/40 rounded-2xl text-center flex flex-col items-center shadow-md animate-fade-in-slide relative"
          >
            {/* Top Badges */}
            <div className="flex items-center justify-between w-full mb-3">
              <span className="text-[10px] tracking-[0.2em] uppercase font-black text-[#12231A] px-2.5 py-0.5 bg-[#96F816] rounded-full shadow-xs">
                {currentProd.concentration || 'Extrait de Parfum'}
              </span>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(currentProd.id)}
                title={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
                className="w-8 h-8 rounded-full bg-[#EBF2EC] hover:bg-[#12231A] hover:text-[#96F816] text-[#12231A] flex items-center justify-center transition-all cursor-pointer border border-[#A0B7A3]/40"
              >
                <Heart
                  className={`w-4 h-4 ${isWishlisted ? 'fill-[#12231A] text-[#12231A]' : 'text-current'}`}
                />
              </button>
            </div>

            {/* Product Title */}
            <h3 className="text-xl sm:text-2xl font-serif font-extrabold text-[#12231A] mb-1">
              {currentProd.title}
            </h3>

            {/* Sillage & Longevity micro-stats */}
            <p className="text-[11px] uppercase tracking-wider font-semibold text-[#12231A]/60 mb-4">
              {currentProd.longevity || '14+ Hours on Skin'} • {currentProd.fragranceFamily}
            </p>

            {/* Flacon Image Frame */}
            <div className="w-52 h-64 overflow-hidden mb-4 rounded-xl border border-[#A0B7A3]/40 bg-[#FAFBF9] relative group shadow-inner">
              <img
                src={currentProd.images?.[0] || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=80'}
                alt={currentProd.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
              />
              {/* Subtle bottle color accent indicator */}
              {currentProd.bottleColor && (
                <div
                  className="absolute bottom-2.5 right-2.5 w-4 h-4 rounded-full border-2 border-white shadow-xs"
                  style={{ backgroundColor: currentProd.bottleColor }}
                  title="Flacon Signature Hue"
                />
              )}
            </div>

            {/* Olfactory Story or Description */}
            <p className="text-xs text-[#12231A]/75 line-clamp-3 mb-5 leading-relaxed italic px-2">
              "{currentProd.olfactoryStory || currentProd.description}"
            </p>

            {/* Price Row */}
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl font-serif font-black text-[#12231A]">
                ₹{currentProd.sellingPrice.toLocaleString('en-IN')}
              </span>
              {currentProd.compareAtPrice > currentProd.sellingPrice && (
                <span className="text-xs text-[#12231A]/40 line-through">
                  ₹{currentProd.compareAtPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-2">
              <button
                onClick={() => setSelectedProduct(currentProd)}
                className="w-full py-3 px-6 bg-[#12231A] text-white hover:bg-[#96F816] hover:text-[#12231A] text-xs uppercase tracking-wider font-extrabold transition-all cursor-pointer rounded-full shadow-sm flex items-center justify-center gap-2 group active:scale-98"
              >
                <span>Examine This Flacon</span>
                <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={handleQuickAdd}
                className="w-full py-2.5 px-6 bg-white hover:bg-[#EBF2EC] text-[#12231A] border border-[#12231A]/20 hover:border-[#12231A] text-xs uppercase tracking-wider font-bold transition-all cursor-pointer rounded-full shadow-xs flex items-center justify-center gap-2 active:scale-98"
              >
                {justAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#12231A]" />
                    <span>Added to Bag!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Quick Acquire (50ml)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Pagination Dots & Slide Selector */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {carouselProducts.map((p, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={p.id}
                onClick={() => goToSlide(idx)}
                title={`${p.title} (${p.fragranceFamily})`}
                aria-label={`Slide ${idx + 1}: ${p.title}`}
                className={`transition-all duration-300 cursor-pointer rounded-full ${
                  isActive
                    ? 'w-8 h-2.5 bg-[#12231A] border border-[#96F816]'
                    : 'w-2.5 h-2.5 bg-[#A0B7A3]/50 hover:bg-[#12231A]/70'
                }`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};
