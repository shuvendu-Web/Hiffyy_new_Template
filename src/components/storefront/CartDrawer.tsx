import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Trash2, ArrowRight, ShieldCheck, Tag, Truck, ChevronDown, ChevronUp, Heart } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onCheckout }) => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    cartSubtotal,
    cartDiscount,
    appliedCoupon,
    applyCoupon,
    cartTax,
    cartShipping,
    cartTotal,
    wishlist,
    toggleWishlist,
  } = useStore();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isSummaryCollapsed, setIsSummaryCollapsed] = useState(true);

  if (!isOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const ok = applyCoupon(couponCode);
    if (!ok) {
      setCouponError('Invalid coupon code. Try FIRSTHIFFYY or ROYAL10.');
    } else {
      setCouponError('');
    }
  };

  const freeShippingThreshold = 1999;
  const progressToFreeShipping = Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF8F5] border-l border-[#E6DFD5] shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-6 border-b border-[#E6DFD5] bg-white flex items-center justify-between">
            <div>
              <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#886938] block">
                HIFFYY Shopping Bag
              </span>
              <h3 className="text-xl font-serif font-bold text-[#12231A]">
                {cart.length} {cart.length === 1 ? 'Item' : 'Items'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#717A75] hover:text-[#12231A] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="px-6 py-3 bg-[#12231A] text-[#DFCAAB] text-xs">
            <div className="flex items-center justify-between mb-1 text-[11px] font-medium">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#C5A880]" />
                {cartSubtotal >= freeShippingThreshold ? (
                  <span>Unlocked Complimentary All-India Express Shipping!</span>
                ) : (
                  <span>Add ₹{(freeShippingThreshold - cartSubtotal).toLocaleString('en-IN')} for Free Express Shipping</span>
                )}
              </span>
              <span>{progressToFreeShipping}%</span>
            </div>
            <div className="w-full h-1 bg-[#182F23] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#C5A880] transition-all duration-300"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 text-[#717A75]">
                <span className="text-sm font-serif italic mb-2">Your shopping bag is empty</span>
                <p className="text-xs max-w-xs mb-6">
                  Explore our Haute Parfumerie collection of Assam Oud, Pampore Saffron and Kannauj Petrichor.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-[#12231A] text-[#DFCAAB] text-xs uppercase tracking-wider font-semibold"
                >
                  Discover Fragrances
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={`${item.product.id}-${item.variantSize}`}
                  className="flex gap-4 p-4 bg-white border border-[#E6DFD5] rounded-sm"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.title}
                    className="w-16 h-20 object-cover rounded-sm border border-[#E6DFD5]"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <h4 className="text-xs font-serif font-bold text-[#12231A] line-clamp-1">
                          {item.product.title}
                        </h4>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleWishlist(item.product.id)}
                            className={`p-1 rounded transition-colors ${
                              wishlist.includes(item.product.id)
                                ? 'text-[#96F816] bg-[#12231A]'
                                : 'text-[#717A75] hover:text-[#12231A]'
                            }`}
                            title="Save to Wishlist"
                          >
                            <Heart className={`w-3.5 h-3.5 ${wishlist.includes(item.product.id) ? 'fill-[#96F816]' : ''}`} />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.product.id, item.variantSize)}
                            className="text-[#717A75] hover:text-red-700 p-1"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <span className="text-[11px] text-[#886938] font-medium block">
                        Flacon Size: {item.variantSize}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-[#E6DFD5]">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.variantSize, item.quantity - 1)}
                          className="px-2 py-0.5 text-xs text-[#12231A]"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.variantSize, item.quantity + 1)}
                          className="px-2 py-0.5 text-xs text-[#12231A]"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs font-bold text-[#12231A]">
                        ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {cart.length > 0 && (
            <div className="p-6 bg-white border-t border-[#E6DFD5]">
              {/* Expand/Collapse Toggle */}
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={() => setIsSummaryCollapsed(!isSummaryCollapsed)}
                  className="text-[11px] font-serif font-bold uppercase tracking-wider text-[#12231A] hover:text-[#886938] flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{isSummaryCollapsed ? 'View Order Summary & Breakdown' : 'Hide Order Summary'}</span>
                  {isSummaryCollapsed ? (
                    <ChevronDown className="w-3.5 h-3.5 text-[#886938]" />
                  ) : (
                    <ChevronUp className="w-3.5 h-3.5 text-[#886938]" />
                  )}
                </button>
                <span className="text-xs font-extrabold text-[#12231A]">
                  ₹{cartTotal.toLocaleString('en-IN')}
                </span>
              </div>

              {!isSummaryCollapsed && (
                <div className="pt-2 pb-3 border-t border-[#E6DFD5] mb-2">
                  {/* Coupon Form */}
                  <form onSubmit={handleApplyCoupon} className="mb-4">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#717A75]" />
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Coupon (e.g. FIRSTHIFFYY)"
                          className="w-full pl-8 pr-3 py-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs uppercase focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#12231A] text-[#DFCAAB] text-xs font-semibold hover:bg-[#182F23] cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                    {appliedCoupon && (
                      <span className="text-[10px] text-emerald-800 font-medium block mt-1">
                        Coupon {appliedCoupon} applied successfully!
                      </span>
                    )}
                    {couponError && (
                      <span className="text-[10px] text-red-700 font-medium block mt-1">{couponError}</span>
                    )}
                  </form>

                  {/* Price Breakdown */}
                  <div className="space-y-1.5 text-xs text-[#717A75] pb-3 border-b border-[#E6DFD5]">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="text-[#12231A] font-medium">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                    </div>
                    {cartDiscount > 0 && (
                      <div className="flex justify-between text-emerald-800">
                        <span>Privilege Discount ({appliedCoupon})</span>
                        <span>-₹{cartDiscount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>GST (18% Indian Fragrance Standard)</span>
                      <span className="text-[#12231A] font-medium">₹{cartTax.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Express Insured Shipping</span>
                      <span className="text-[#12231A] font-medium">
                        {cartShipping === 0 ? <span className="text-emerald-800 font-semibold">FREE</span> : `₹${cartShipping}`}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Security info */}
              <div className="flex items-center gap-2 text-[10px] text-[#717A75] py-2">
                <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
                <span>Includes 2ml sample vial & 100% tamper-evident security seal</span>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  onClose();
                  onCheckout();
                }}
                className="w-full mt-2 py-3.5 px-6 bg-[#12231A] text-[#DFCAAB] hover:bg-[#182F23] hover:text-white text-xs uppercase tracking-[0.2em] font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <span>Proceed to Secure Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
