import React, { useState } from 'react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { Heart, ShoppingBag, Check, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onOpenCart?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenCart }) => {
  const { addToCart, wishlist, toggleWishlist, setSelectedProduct } = useStore();
  const [selectedSize, setSelectedSize] = useState<'30ml' | '50ml' | '100ml'>(
    product.variants[0]?.size || '50ml'
  );
  const [addedAnimation, setAddedAnimation] = useState(false);

  const isLiked = wishlist.includes(product.id);
  const activeVariant = product.variants.find((v) => v.size === selectedSize) || product.variants[0];
  const currentPrice = activeVariant ? activeVariant.sellingPrice : product.sellingPrice;
  const comparePrice = activeVariant ? activeVariant.compareAtPrice : product.compareAtPrice;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, selectedSize, 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
    if (onOpenCart) {
      setTimeout(() => onOpenCart(), 300);
    }
  };

  return (
    <div
      onClick={() => setSelectedProduct(product)}
      className="group relative bg-white border border-[#E6DFD5] hover:border-[#C5A880] transition-all duration-300 rounded-sm overflow-hidden flex flex-col cursor-pointer shadow-sm hover:shadow-md"
    >
      {/* Bottle Image Gallery & Badges */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#FAF8F5]">
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isBestseller && (
            <span className="px-2.5 py-1 bg-[#12231A] text-[#96F816] text-[9px] uppercase tracking-[0.2em] font-extrabold shadow-sm">
              Bestseller
            </span>
          )}
          {product.isNewArrival && (
            <span className="px-2.5 py-1 bg-[#96F816] text-[#12231A] text-[9px] uppercase tracking-[0.2em] font-black shadow-sm">
              New Launch
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
            isLiked
              ? 'bg-[#96F816] text-[#12231A]'
              : 'bg-white/90 text-[#12231A] hover:bg-[#96F816] backdrop-blur-sm'
          }`}
          title="Save to Wishlist"
        >
          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-[#12231A]' : ''}`} />
        </button>

        {/* Quick View Pill on Hover */}
        <div className="absolute inset-x-0 bottom-3 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="px-3 py-1.5 bg-[#12231A]/95 text-[#96F816] text-[10px] uppercase tracking-wider font-bold backdrop-blur-sm flex items-center gap-1.5 shadow-md">
            <Eye className="w-3 h-3 text-[#96F816]" />
            View Olfactory Pyramid
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between bg-white">
        <div>
          {/* Fragrance Family & Concentration */}
          <div className="flex items-center justify-between text-[10px] tracking-wider uppercase text-[#886938] font-semibold mb-1">
            <span>{product.fragranceFamily}</span>
            <span className="text-[#717A75]">{product.concentration}</span>
          </div>

          {/* Title */}
          <h3 className="text-base font-serif font-bold text-[#12231A] group-hover:text-[#886938] transition-colors leading-snug mb-2">
            {product.title}
          </h3>

          {/* Sensory Notes Pills */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              <span className="text-[10px] bg-[#FAF8F5] border border-[#E6DFD5] px-2 py-0.5 text-[#1B201E]/80">
                Top: {product.notes.top[0]}
              </span>
              <span className="text-[10px] bg-[#FAF8F5] border border-[#E6DFD5] px-2 py-0.5 text-[#1B201E]/80">
                Heart: {product.notes.heart[0]}
              </span>
            </div>
          </div>
        </div>

        <div>
          {/* Size Variant Selector */}
          <div className="flex items-center justify-between mb-3 pt-3 border-t border-[#F4EFE6]">
            <div className="flex items-center gap-1.5">
              {product.variants.map((v) => (
                <button
                  key={v.size}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSize(v.size);
                  }}
                  className={`px-2.5 py-1 text-[10px] font-bold transition-all ${
                    selectedSize === v.size
                      ? 'bg-[#12231A] text-[#96F816] shadow-sm'
                      : 'bg-[#EBF2EC] text-[#12231A] hover:bg-[#A0B7A3]/30 border border-[#A0B7A3]/40'
                  }`}
                >
                  {v.size}
                </button>
              ))}
            </div>

            {/* Price */}
            <div className="text-right">
              <span className="text-sm font-extrabold text-[#12231A]">
                ₹{currentPrice.toLocaleString('en-IN')}
              </span>
              {comparePrice > currentPrice && (
                <span className="text-[11px] text-[#717A75] line-through ml-1.5">
                  ₹{comparePrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          {/* Add to Bag CTA */}
          <button
            onClick={handleQuickAdd}
            className={`w-full py-2.5 px-4 text-xs tracking-[0.15em] uppercase font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
              addedAnimation
                ? 'bg-[#96F816] text-[#12231A]'
                : 'bg-[#12231A] text-white hover:bg-[#96F816] hover:text-[#12231A]'
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#12231A]" />
                <span>Added to Bag</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Bag • {selectedSize}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
