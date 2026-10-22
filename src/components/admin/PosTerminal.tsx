import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import {
  Store,
  Search,
  Plus,
  Trash2,
  Printer,
  Smartphone,
  CreditCard,
  Banknote,
  CheckCircle,
  Clock,
  X,
  Lock,
  DollarSign,
} from 'lucide-react';

export const PosTerminal: React.FC = () => {
  const { products, posSession, openPosSession, closePosSession, completePosSale } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [posCart, setPosCart] = useState<
    { product: Product; variantSize: '30ml' | '50ml' | '100ml'; quantity: number; unitPrice: number }[]
  >([]);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card'>('UPI');
  const [patronName, setPatronName] = useState('Walk-in Patron');
  const [patronPhone, setPatronPhone] = useState('+91 ');
  const [completedReceipt, setCompletedReceipt] = useState<{
    orderNumber: string;
    total: number;
    items: typeof posCart;
    date: string;
  } | null>(null);

  // Cash Drawer Modal
  const [showDrawerModal, setShowDrawerModal] = useState(false);
  const [actualCashInput, setActualCashInput] = useState(posSession.openingCash);

  // Filtering products
  const searchResults = products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.variants.some((v) => v.barcode.includes(searchQuery))
  );

  const handleAddToCart = (product: Product, size: '30ml' | '50ml' | '100ml') => {
    const variant = product.variants.find((v) => v.size === size) || product.variants[0];
    const price = variant ? variant.sellingPrice : product.sellingPrice;

    setPosCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id && i.variantSize === size);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id && i.variantSize === size
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product, variantSize: size, quantity: 1, unitPrice: price }];
    });
  };

  const handleRemoveFromCart = (productId: string, size: string) => {
    setPosCart((prev) => prev.filter((i) => !(i.product.id === productId && i.variantSize === size)));
  };

  const subtotal = posCart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;

  const handleCheckout = async () => {
    if (posCart.length === 0) return;
    const order = await completePosSale(posCart, paymentMethod, {
      name: patronName,
      phone: patronPhone,
    });
    setCompletedReceipt({
      orderNumber: order.orderNumber,
      total: order.total,
      items: [...posCart],
      date: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    });
    setPosCart([]);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Session Bar */}
      <div className="bg-[#12231A] text-[#FAF8F5] p-4 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-[#182F23]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#182F23] border border-[#C5A880]/50 flex items-center justify-center">
            <Store className="w-5 h-5 text-[#C5A880]" />
          </div>
          <div>
            <h3 className="text-sm font-serif font-bold text-white">{posSession.storeName}</h3>
            <p className="text-[11px] text-[#DFCAAB]/80 font-mono">
              Cashier: {posSession.cashierName} • Drawer Status: {posSession.status.toUpperCase()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-[10px] text-[#C5A880] block">Shift Cash: ₹{posSession.cashSales}</span>
            <span className="text-[10px] text-[#DFCAAB] block">UPI / Card: ₹{posSession.upiSales + posSession.cardSales}</span>
          </div>
          <button
            onClick={() => setShowDrawerModal(true)}
            className="px-3 py-1.5 bg-[#182F23] hover:bg-[#203D2E] text-[#DFCAAB] border border-[#C5A880]/40 text-xs font-semibold rounded-sm cursor-pointer"
          >
            Cash Drawer
          </button>
        </div>
      </div>

      {/* POS Grid: Catalog on Left, Register on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Product Search & Quick Add */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-4 border border-[#E6DFD5] rounded-sm flex items-center gap-3">
            <Search className="w-4 h-4 text-[#717A75]" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search fragrance by name, SKU, or scan barcode..."
              className="flex-1 bg-transparent text-xs focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[550px] overflow-y-auto">
            {searchResults.map((product) => (
              <div
                key={product.id}
                className="bg-white p-3 border border-[#E6DFD5] hover:border-[#C5A880] rounded-sm transition-all flex flex-col justify-between"
              >
                <div className="flex gap-3 mb-2">
                  <img
                    src={product.images[0]}
                    alt=""
                    className="w-14 h-16 object-cover rounded-sm border shrink-0"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-[#12231A] line-clamp-1">{product.title}</h4>
                    <span className="text-[10px] text-[#886938] uppercase font-semibold block">
                      {product.fragranceFamily}
                    </span>
                    <span className="text-[10px] text-[#717A75] font-mono block">
                      In Stock: {product.stockOnHand}
                    </span>
                  </div>
                </div>

                {/* Quick Add Pills by Variant */}
                <div className="grid grid-cols-3 gap-1 pt-2 border-t border-[#F4EFE6]">
                  {product.variants.map((v) => (
                    <button
                      key={v.size}
                      onClick={() => handleAddToCart(product, v.size)}
                      className="py-1 px-1 bg-[#FAF8F5] hover:bg-[#12231A] hover:text-[#DFCAAB] text-[#12231A] border border-[#E6DFD5] text-[10px] font-semibold transition-colors text-center cursor-pointer"
                    >
                      <span className="block">{v.size}</span>
                      <span className="block font-mono text-[9px]">₹{v.sellingPrice}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: POS Cart & Instant Payment */}
        <div className="lg:col-span-5 bg-white border border-[#E6DFD5] rounded-sm p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E6DFD5] mb-3">
              <span className="text-xs uppercase font-bold text-[#12231A] tracking-wider">
                Current Register Register
              </span>
              <span className="text-xs font-mono font-bold text-[#886938]">{posCart.length} Items</span>
            </div>

            {/* Patron Input */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <input
                type="text"
                value={patronName}
                onChange={(e) => setPatronName(e.target.value)}
                placeholder="Patron Name"
                className="p-1.5 bg-[#FAF8F5] border border-[#E6DFD5] text-xs focus:outline-none"
              />
              <input
                type="text"
                value={patronPhone}
                onChange={(e) => setPatronPhone(e.target.value)}
                placeholder="Phone (For SMS Invoice)"
                className="p-1.5 bg-[#FAF8F5] border border-[#E6DFD5] text-xs focus:outline-none"
              />
            </div>

            {/* Cart Items List */}
            <div className="space-y-2 max-h-56 overflow-y-auto mb-4">
              {posCart.length === 0 ? (
                <p className="text-xs text-center text-[#717A75] py-8">
                  Register is clear. Select a perfume variant to ring up.
                </p>
              ) : (
                posCart.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-[#F4EFE6]">
                    <div>
                      <span className="font-semibold text-[#12231A] block">{item.product.title}</span>
                      <span className="text-[10px] text-[#717A75]">
                        {item.variantSize} x {item.quantity}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#12231A]">
                        ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                      </span>
                      <button
                        onClick={() => handleRemoveFromCart(item.product.id, item.variantSize)}
                        className="text-red-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="mb-4">
              <span className="text-[10px] uppercase font-bold text-[#717A75] block mb-1">
                Tender Method
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'UPI', label: 'BHIM UPI QR', icon: Smartphone },
                  { id: 'Card', label: 'POS Card', icon: CreditCard },
                  { id: 'Cash', label: 'Cash Drawer', icon: Banknote },
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id as 'Cash' | 'UPI' | 'Card')}
                      className={`p-2 border text-center transition-all cursor-pointer rounded-sm ${
                        paymentMethod === m.id
                          ? 'border-[#12231A] bg-[#12231A] text-[#DFCAAB]'
                          : 'border-[#E6DFD5] bg-[#FAF8F5] text-[#12231A]'
                      }`}
                    >
                      <Icon className="w-4 h-4 mx-auto mb-1" />
                      <span className="block text-[10px] font-bold">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Pricing Totals & Checkout Button */}
          <div className="pt-3 border-t border-[#E6DFD5] space-y-2">
            <div className="flex justify-between text-xs text-[#717A75]">
              <span>Subtotal:</span>
              <span className="font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-xs text-[#717A75]">
              <span>18% GST:</span>
              <span className="font-mono">₹{tax.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-[#12231A] pt-1 border-t border-[#F4EFE6]">
              <span>Tender Total:</span>
              <span className="text-base">₹{total.toLocaleString('en-IN')}</span>
            </div>

            <button
              disabled={posCart.length === 0}
              onClick={handleCheckout}
              className="w-full py-3 bg-[#12231A] text-[#DFCAAB] text-xs uppercase tracking-[0.2em] font-bold hover:bg-[#182F23] disabled:opacity-40 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md mt-2"
            >
              <span>Ring Sale & Dispense Flacon</span>
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Completed Receipt Modal */}
      {completedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-white border border-[#E6DFD5] shadow-2xl p-6 font-mono text-xs text-[#12231A]">
            <button
              onClick={() => setCompletedReceipt(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center pb-3 border-b border-dashed border-gray-400">
              <span className="text-base font-serif font-bold tracking-widest block">HIFFYY</span>
              <span className="text-[10px] block">FLAGSHIP STORE, BANDRA WEST</span>
              <span className="text-[9px] text-gray-500 block">GSTIN: 27AAACH1234F1Z5</span>
              <span className="text-[10px] font-bold mt-1 block">TAX INVOICE #{completedReceipt.orderNumber}</span>
              <span className="text-[9px] text-gray-500 block">{completedReceipt.date}</span>
            </div>

            <div className="py-3 border-b border-dashed border-gray-400 space-y-1.5">
              {completedReceipt.items.map((i, idx) => (
                <div key={idx} className="flex justify-between text-[11px]">
                  <span>{i.product.title.slice(0, 18)} ({i.variantSize}) x{i.quantity}</span>
                  <span>₹{i.unitPrice * i.quantity}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 pb-4 border-b border-dashed border-gray-400 space-y-1 text-right text-[11px]">
              <div>TOTAL AMOUNT: ₹{completedReceipt.total}</div>
              <div className="text-[9px] text-gray-500">PAID VIA: {paymentMethod.toUpperCase()}</div>
            </div>

            <div className="text-center pt-3 text-[10px] text-gray-600">
              <p>Thank you for shopping at HIFFYY.</p>
              <p>May your presence linger like royalty.</p>
            </div>

            <button
              onClick={() => {
                window.print();
                setCompletedReceipt(null);
              }}
              className="w-full mt-4 py-2 bg-[#12231A] text-[#DFCAAB] text-[11px] font-bold uppercase tracking-wider cursor-pointer"
            >
              Print Receipt
            </button>
          </div>
        </div>
      )}

      {/* Cash Drawer Reconciliation Modal */}
      {showDrawerModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white p-6 rounded-sm border border-[#E6DFD5] shadow-2xl">
            <h3 className="text-sm font-serif font-bold text-[#12231A] mb-3">
              Cash Drawer Reconciliation & Shift End
            </h3>
            <div className="space-y-2 text-xs mb-4">
              <div className="flex justify-between">
                <span className="text-[#717A75]">Opening Cash Float:</span>
                <span className="font-bold">₹{posSession.openingCash}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#717A75]">Recorded Cash Sales:</span>
                <span className="font-bold">₹{posSession.cashSales}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#717A75]">Expected Drawer Total:</span>
                <span className="font-bold text-emerald-800">
                  ₹{posSession.openingCash + posSession.cashSales}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#717A75] mb-1 uppercase">
                Actual Physical Cash Counted (₹)
              </label>
              <input
                type="number"
                value={actualCashInput}
                onChange={(e) => setActualCashInput(Number(e.target.value))}
                className="w-full p-2 bg-[#FAF8F5] border border-[#E6DFD5] text-sm font-bold focus:outline-none"
              />
            </div>

            <div className="pt-4 mt-4 border-t flex justify-end gap-2">
              <button
                onClick={() => setShowDrawerModal(false)}
                className="px-4 py-2 border text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  closePosSession(actualCashInput);
                  setShowDrawerModal(false);
                  alert('Shift drawer closed and reconciliation report saved.');
                }}
                className="px-4 py-2 bg-[#12231A] text-[#DFCAAB] text-xs font-bold uppercase"
              >
                Close Register Shift
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
