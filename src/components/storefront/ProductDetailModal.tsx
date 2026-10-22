import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  ShoppingBag,
  Heart,
  Check,
  ShieldCheck,
  Clock,
  Sparkles,
  MapPin,
  RefreshCw,
  Droplets,
  Layers,
} from 'lucide-react';

interface ProductDetailModalProps {
  onOpenCheckout?: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ onOpenCheckout }) => {
  const { selectedProduct, setSelectedProduct, addToCart, wishlist, toggleWishlist } = useStore();
  const [selectedSize, setSelectedSize] = useState<'30ml' | '50ml' | '100ml'>('50ml');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [added, setAdded] = useState(false);

  // Pin Code Serviceability Check
  const [pinCode, setPinCode] = useState('');
  const [pinResult, setPinResult] = useState<{ serviceable: boolean; message: string } | null>(null);

  if (!selectedProduct) return null;

  const isLiked = wishlist.includes(selectedProduct.id);
  const currentVariant =
    selectedProduct.variants.find((v) => v.size === selectedSize) || selectedProduct.variants[0];
  const price = currentVariant ? currentVariant.sellingPrice : selectedProduct.sellingPrice;
  const comparePrice = currentVariant ? currentVariant.compareAtPrice : selectedProduct.compareAtPrice;

  const handleAddToCart = () => {
    addToCart(selectedProduct, selectedSize, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setSelectedProduct(null);
      if (onOpenCheckout) {
        onOpenCheckout();
      }
    }, 350);
  };

  const handleCheckPin = () => {
    const cleanPin = pinCode.trim();
    if (cleanPin.length !== 6 || !/^\d+$/.test(cleanPin)) {
      setPinResult({ serviceable: false, message: 'Please enter a valid 6-digit Indian PIN code.' });
      return;
    }
    // Metro check
    if (['110001', '400001', '560001', '700001', '600001', '500001'].some((prefix) => cleanPin.startsWith(prefix.slice(0, 2)))) {
      setPinResult({
        serviceable: true,
        message: 'Express Delivery available in 2 Business Days via Delhivery Air.',
      });
    } else {
      setPinResult({
        serviceable: true,
        message: 'Standard Delivery available in 3-5 Business Days across India.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#12231A]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#FAF8F5] border border-[#E6DFD5] shadow-2xl rounded-xl my-4 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute top-3 right-3 z-10 p-1.5 bg-white/80 hover:bg-white text-[#12231A] rounded-full border border-[#E6DFD5] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery Column */}
          <div className="p-4 sm:p-5 bg-white border-b md:border-b-0 md:border-r border-[#E6DFD5] flex flex-col justify-between">
            <div>
              {/* Main Image */}
              <div className="aspect-[4/5] w-full max-h-[320px] overflow-hidden bg-[#FAF8F5] border border-[#E6DFD5] mb-3 relative rounded-lg">
                <img
                  src={selectedProduct.images[activeImageIndex] || selectedProduct.images[0]}
                  alt={selectedProduct.title}
                  className="w-full h-full object-cover object-center"
                />
                <button
                  onClick={() => toggleWishlist(selectedProduct.id)}
                  className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/80 backdrop-blur-sm text-[#717A75] hover:text-[#12231A]"
                >
                  <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-[#96F816] text-[#12231A]' : ''}`} />
                </button>
              </div>

              {/* Thumbnails */}
              {selectedProduct.images.length > 1 && (
                <div className="flex gap-2">
                  {selectedProduct.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-12 h-14 rounded overflow-hidden border transition-all cursor-pointer ${
                        activeImageIndex === idx ? 'border-[#12231A] ring-1 ring-[#12231A]' : 'border-[#E6DFD5] opacity-70'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Authenticity Guarantee */}
            <div className="mt-3 pt-3 border-t border-[#F4EFE6] flex items-center gap-2 text-[11px] text-[#717A75]">
              <ShieldCheck className="w-4 h-4 text-[#96F816] shrink-0" />
              <span>
                Serialized hologram & complimentary 2ml sample vial included.
              </span>
            </div>
          </div>

          {/* Details Column */}
          <div className="p-4 sm:p-5 flex flex-col justify-between max-h-[75vh] overflow-y-auto">
            <div>
              {/* Family & Concentration */}
              <div className="flex items-center gap-1.5 text-[9px] tracking-[0.2em] uppercase font-bold text-[#886938] mb-1">
                <span>{selectedProduct.fragranceFamily}</span>
                <span>•</span>
                <span>{selectedProduct.concentration}</span>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-serif text-[#12231A] font-bold mb-2">
                {selectedProduct.title}
              </h2>

              {/* Pricing */}
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-xl font-serif font-bold text-[#12231A]">
                  ₹{price.toLocaleString('en-IN')}
                </span>
                {comparePrice > price && (
                  <span className="text-xs text-[#717A75] line-through">
                    ₹{comparePrice.toLocaleString('en-IN')}
                  </span>
                )}
                <span className="text-[10px] text-[#2F6B45] font-semibold bg-[#EBF5EE] px-1.5 py-0.5 rounded">
                  18% GST Incl.
                </span>
              </div>

              {/* 1st: Performance Metrics: Longevity & Sillage */}
              <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-[#717A75]">
                <div className="flex items-center gap-2 p-2 bg-white border border-[#E6DFD5] rounded shadow-2xs">
                  <Clock className="w-3.5 h-3.5 text-[#886938]" />
                  <div>
                    <span className="text-[9px] block uppercase font-medium">Longevity</span>
                    <span className="text-[#12231A] font-semibold text-[11px]">{selectedProduct.longevity}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white border border-[#E6DFD5] rounded shadow-2xs">
                  <Droplets className="w-3.5 h-3.5 text-[#886938]" />
                  <div>
                    <span className="text-[9px] block uppercase font-medium">Sillage</span>
                    <span className="text-[#12231A] font-semibold text-[11px]">{selectedProduct.sillage} Aura</span>
                  </div>
                </div>
              </div>

              {/* 2nd: Select Size: */}
              <div className="mb-3">
                <span className="text-[9px] tracking-wider uppercase font-bold text-[#12231A] block mb-1.5">
                  Select Size:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {selectedProduct.variants.map((v) => (
                    <button
                      key={v.size}
                      onClick={() => setSelectedSize(v.size)}
                      className={`p-2 text-left border rounded transition-all cursor-pointer ${
                        selectedSize === v.size
                          ? 'border-[#12231A] bg-[#12231A] text-[#96F816] shadow-sm'
                          : 'border-[#E6DFD5] bg-white text-[#12231A] hover:border-[#96F816]'
                      }`}
                    >
                      <span className="block text-xs font-bold">{v.size}</span>
                      <span className="block text-[10px] opacity-80">₹{v.sellingPrice}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3rd: Quantity & Add to Bag (opens checkout popup) */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center border border-[#E6DFD5] bg-white rounded">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-2.5 py-2 text-xs font-bold text-[#12231A] hover:bg-[#FAF8F5] cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3 py-2 text-xs font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-2.5 py-2 text-xs font-bold text-[#12231A] hover:bg-[#FAF8F5] cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className={`flex-1 py-2.5 px-4 text-xs uppercase tracking-[0.18em] font-bold rounded transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                    added ? 'bg-emerald-900 text-[#96F816]' : 'bg-[#12231A] text-[#96F816] hover:bg-black'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4 text-[#96F816]" />
                      <span>Proceeding to Checkout...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Bag • ₹{(price * quantity).toLocaleString('en-IN')}</span>
                    </>
                  )}
                </button>
              </div>

              {/* 4th: Olfactory Pyramid Visualizer (Notes) */}
              <div className="mb-3 p-2.5 bg-[#F4EFE6]/60 border border-[#E6DFD5] rounded space-y-1.5">
                <span className="text-[9px] tracking-[0.2em] uppercase font-bold text-[#12231A] block">
                  Olfactory Pyramid
                </span>
                <div className="text-[11px]">
                  <span className="font-semibold text-[#886938] block text-[10px]">TOP NOTES:</span>
                  <span className="text-[#1B201E]">{selectedProduct.notes.top.join(' • ')}</span>
                </div>
                <div className="text-[11px]">
                  <span className="font-semibold text-[#886938] block text-[10px]">HEART NOTES:</span>
                  <span className="text-[#1B201E]">{selectedProduct.notes.heart.join(' • ')}</span>
                </div>
                <div className="text-[11px]">
                  <span className="font-semibold text-[#886938] block text-[10px]">BASE NOTES:</span>
                  <span className="text-[#1B201E]">{selectedProduct.notes.base.join(' • ')}</span>
                </div>
              </div>

              {/* 5th: Olfactory Story & Description */}
              <p className="text-xs text-[#1B201E]/80 font-light leading-relaxed mb-3">
                {selectedProduct.description}
              </p>

              {/* Delivery PIN Code Checker */}
              <div className="pt-4 border-t border-[#E6DFD5]">
                <span className="text-[10px] tracking-wider uppercase font-semibold text-[#717A75] block mb-2">
                  Check Delivery Time Across India:
                </span>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#717A75]" />
                    <input
                      type="text"
                      maxLength={6}
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      placeholder="Enter 6-digit PIN code (e.g. 400001)"
                      className="w-full pl-8 pr-3 py-2 bg-white border border-[#E6DFD5] text-xs focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>
                  <button
                    onClick={handleCheckPin}
                    className="px-4 py-2 bg-[#FAF8F5] border border-[#12231A] text-[#12231A] text-xs font-medium hover:bg-[#12231A] hover:text-white cursor-pointer"
                  >
                    Check
                  </button>
                </div>
                {pinResult && (
                  <p
                    className={`text-[11px] mt-2 font-medium ${
                      pinResult.serviceable ? 'text-emerald-800' : 'text-red-700'
                    }`}
                  >
                    {pinResult.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
