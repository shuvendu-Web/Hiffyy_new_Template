import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import { CustomerAddressBook } from './CustomerAddressBook';
import {
  User as UserIcon,
  MapPin,
  ShoppingBag,
  Heart,
  ShieldCheck,
  X,
  LogOut,
  ExternalLink,
  Clock,
} from 'lucide-react';

interface CustomerAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'addresses' | 'orders' | 'wishlist';
}

export const CustomerAccountModal: React.FC<CustomerAccountModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'addresses',
}) => {
  const { user, loginWithGoogle, openAuthModal, logout, orders, products, wishlist, toggleWishlist, addToCart } =
    useStore();
  const [activeTab, setActiveTab] = useState<'addresses' | 'orders' | 'wishlist'>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const myOrders = orders.filter((o) => !user || o.customer.email === user.email || true);
  const wishlistProducts = wishlist
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as Product[];

  return (
    <div className="fixed inset-0 z-50 bg-[#12231A]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#FAF8F5] border border-[#E6DFD5] shadow-2xl rounded-xl my-4 overflow-hidden max-h-[85vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="p-3.5 sm:p-4 bg-white border-b border-[#E6DFD5] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#12231A] text-[#96F816] flex items-center justify-center text-xs font-bold font-serif">
              {user?.displayName?.[0] || 'P'}
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-[#12231A]">
                {user?.displayName || 'HIFFYY Patron Account'}
              </h3>
              <p className="text-[10px] text-[#717A75] font-mono">
                {user?.email || 'Guest Session (Sign in to link orders)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!user ? (
              <button
                onClick={openAuthModal}
                className="px-3 py-1 bg-[#12231A] text-[#96F816] text-[11px] font-semibold hover:bg-black rounded cursor-pointer flex items-center gap-1.5"
              >
                <span>Sign In / Login</span>
              </button>
            ) : (
              <button
                onClick={logout}
                className="px-2.5 py-1 border border-[#E6DFD5] text-[11px] text-gray-600 hover:text-black rounded flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-[#717A75] hover:text-[#12231A] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 bg-[#FAF8F5] border-b border-[#E6DFD5] flex gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('addresses')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'addresses'
                ? 'border-[#12231A] text-[#12231A]'
                : 'border-transparent text-[#717A75] hover:text-[#12231A]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Address Book</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'orders'
                ? 'border-[#12231A] text-[#12231A]'
                : 'border-transparent text-[#717A75] hover:text-[#12231A]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Consignments ({myOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'wishlist'
                ? 'border-[#12231A] text-[#12231A]'
                : 'border-transparent text-[#717A75] hover:text-[#12231A]'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Saved Flacons ({wishlist.length})</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'addresses' && (
            <div>
              <CustomerAddressBook />
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-4">
              {myOrders.length === 0 ? (
                <p className="text-xs text-center text-[#717A75] py-12">
                  No previous consignments found.
                </p>
              ) : (
                myOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 bg-white border border-[#E6DFD5] rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-xs text-[#12231A]">
                          #{ord.orderNumber}
                        </span>
                        <span className="px-2 py-0.5 bg-[#F4EFE6] text-[#886938] text-[9px] uppercase font-bold rounded-sm">
                          {ord.status.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#717A75] block">
                        {ord.items.map((i) => `${i.title} (${i.variantSize})`).join(', ')}
                      </span>
                      <span className="text-[10px] text-[#717A75] font-mono mt-1 block">
                        AWB: {ord.trackingNumber || 'Processing dispatch'} • {ord.carrier}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-[#12231A] block">
                        ₹{ord.total.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-emerald-800 font-semibold block">
                        Paid via {ord.paymentMethod}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {wishlistProducts.length === 0 ? (
                <p className="col-span-3 text-xs text-center text-[#717A75] py-12">
                  No flacons saved to your wishlist yet.
                </p>
              ) : (
                wishlistProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-white border border-[#E6DFD5] rounded-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-[3/4] w-full overflow-hidden mb-2 bg-[#FAF8F5]">
                        <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                      </div>
                      <h4 className="text-xs font-serif font-bold text-[#12231A] mb-1">{p.title}</h4>
                      <span className="text-xs font-bold text-[#12231A] block mb-2">
                        ₹{p.sellingPrice.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => addToCart(p, '50ml', 1)}
                        className="flex-1 py-1.5 bg-[#12231A] text-[#DFCAAB] text-[10px] uppercase font-bold hover:bg-[#182F23]"
                      >
                        Add 50ml to Bag
                      </button>
                      <button
                        onClick={() => toggleWishlist(p.id)}
                        className="p-1.5 border border-[#E6DFD5] text-red-700"
                        title="Remove"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
