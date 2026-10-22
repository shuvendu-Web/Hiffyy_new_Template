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
    <section id="collection" className="py-20 bg-[#EBF2EC] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.25em] uppercase font-bold text-[#12231A] mb-2 px-3 py-1 bg-white/60 rounded-full border border-[#A0B7A3]/40">
            <Sparkles className="w-3.5 h-3.5 text-[#96F816] fill-[#96F816]" />
            <span>Artisanal Perfume Wardrobe</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#12231A] font-extrabold mb-4">
            The Haute Parfumerie Flacons
          </h2>
          <p className="text-xs sm:text-sm text-[#12231A]/80 font-light leading-relaxed">
            Distilled from royal Indian botanicals, rare resins, and natural floral absolutes.
            Each composition is macerated in wooden casks for sixty days to achieve timeless sillage.
          </p>
        </div>

        {/* Filter Pills & Sort Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pb-6 mb-8 border-b border-[#A0B7A3]/40 gap-4">
          {/* Family Filters */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            {families.map((fam) => (
              <button
                key={fam.id}
                onClick={() => setActiveFamily(fam.id)}
                className={`px-3.5 py-1.5 text-xs tracking-wider uppercase font-bold transition-all cursor-pointer rounded-full ${
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
          <div className="flex items-center space-x-3 text-xs text-[#12231A]/70">
            <span className="text-[11px] font-mono font-bold">{sorted.length} Creations</span>
            <div className="flex items-center gap-1.5 bg-white border border-[#A0B7A3]/50 px-2.5 py-1 rounded-sm">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {sorted.map((product, idx) => (
            <RevealSection
              key={product.id}
              direction="up"
              delay={Math.min(idx * 75, 450)}
              duration={700}
            >
              <ProductCard product={product} onOpenCart={onOpenCart} />
            </RevealSection>
          ))}
        </div>

      </div>
    </section>
  );
};
