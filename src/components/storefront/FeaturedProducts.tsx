import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from './ProductCard';
import { RevealSection } from '../common/RevealSection';
import { SlidersHorizontal, Sparkles } from 'lucide-react';

import { FragranceFamily } from '../../types';

interface FeaturedProductsProps {
  onOpenCart?: () => void;
}

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ onOpenCart }) => {
  const { products } = useStore();
  const [activeFamily, setActiveFamily] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');

  const families = [
    { id: 'all', label: 'All Creations' },
    { id: 'Oriental Woody', label: 'Oriental Woody' },
    { id: 'Fresh Citrus', label: 'Fresh Citrus & Petrichor' },
    { id: 'Amber Gourmand', label: 'Amber & Saffron' },
    { id: 'Floral Attar', label: 'Floral Attar' },
    { id: 'Smoky Leather', label: 'Smoky Leather' },
  ];

  // Filtering
  const filtered = products.filter((p) => {
    if (activeFamily === 'all') return true;
    return p.fragranceFamily === activeFamily;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price-asc') return a.sellingPrice - b.sellingPrice;
    if (sortBy === 'price-desc') return b.sellingPrice - a.sellingPrice;
    if (sortBy === 'rating') return b.rating - a.rating;
    return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
  });

  return (
    <section id="collection" className="scroll-mt-16 sm:scroll-mt-20 py-12 sm:py-16 lg:py-20 bg-[#EBF2EC] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs tracking-[0.25em] uppercase font-bold text-[#12231A] mb-2 px-3.5 py-1 bg-white/70 backdrop-blur-xs rounded-full border border-[#A0B7A3]/50 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#96F816] fill-[#96F816]" />
            <span>Artisanal Perfume Wardrobe</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#12231A] font-extrabold mb-3">
            The Haute Parfumerie Flacons
          </h2>
          <p className="text-xs sm:text-sm text-[#12231A]/80 font-light leading-relaxed max-w-xl mx-auto">
            Distilled from royal Indian botanicals, rare resins, and natural floral absolutes.
            Each composition is macerated in wooden casks for sixty days to achieve timeless sillage.
          </p>
        </div>

        {/* Filter Pills & Sort Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between pb-5 mb-8 border-b border-[#A0B7A3]/40 gap-4">
          {/* Family Filters: Touch-scrollable on mobile, flex-wrap on tablet/desktop */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 md:pb-0 scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
            {families.map((fam) => (
              <button
                key={fam.id}
                onClick={() => setActiveFamily(fam.id)}
                className={`px-3.5 py-1.5 text-[11px] sm:text-xs tracking-wider uppercase font-bold transition-all cursor-pointer rounded-full shrink-0 ${
                  activeFamily === fam.id
                    ? 'bg-[#12231A] text-[#96F816] shadow-md border-2 border-[#96F816]'
                    : 'bg-white/90 border border-[#A0B7A3]/60 text-[#12231A] hover:border-[#96F816]'
                }`}
              >
                {fam.label}
              </button>
            ))}
          </div>

          {/* Sort & Count */}
          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-[#12231A]/70 shrink-0">
            <span className="text-[11px] font-mono font-bold">{sorted.length} Creations</span>
            <div className="flex items-center gap-1.5 bg-white border border-[#A0B7A3]/50 px-2.5 py-1 rounded-sm shadow-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#C5A880]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'featured' | 'price-asc' | 'price-desc' | 'rating')}
                className="bg-transparent text-xs text-[#12231A] focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured / Bestsellers</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Longevity / Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        {sorted.length === 0 ? (
          <div className="text-center py-16 bg-white/60 rounded-2xl border border-[#A0B7A3]/40">
            <p className="text-sm font-semibold text-[#12231A] mb-2">No creations found in this fragrance family.</p>
            <button
              onClick={() => setActiveFamily('all')}
              className="px-4 py-2 bg-[#12231A] text-[#96F816] text-xs uppercase font-bold tracking-wider rounded-full hover:bg-black transition-colors cursor-pointer"
            >
              View All Creations
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {sorted.map((product, idx) => (
              <RevealSection
                key={product.id}
                direction="up"
                delay={Math.min(idx * 50, 300)}
                duration={500}
                threshold={0.02}
              >
                <ProductCard product={product} onOpenCart={onOpenCart} />
              </RevealSection>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
