import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  CheckCircle,
  ShieldCheck,
  CreditCard,
  QrCode,
  Smartphone,
  Truck,
  ArrowRight,
  Package,
  Copy,
  Check,
  ExternalLink,
  Clock,
  Sparkles,
  MessageCircle,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Order } from '../../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface YoupiPaymentData {
  orderId: string;
  amount: number;
  formattedAmount: string;
  merchantPhone: string;
  merchantVpa: string;
  payeeName: string;
  upiUri: string;
  qrCodeUrl: string;
  whatsappLink: string;
  intents: {
    gpay: string;
    phonepe: string;
    paytm: string;
    cred: string;
    bhim: string;
    generic: string;
  };
  expiresInSeconds: number;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const {
    cart,
    cartSubtotal,
    cartDiscount,
    cartTax,
    cartShipping,
    cartTotal,
    createOrder,
    user,
    addresses,
    defaultAddress,
  } = useStore();

  const [step, setStep] = useState<'details' | 'payment' | 'confirmation'>('details');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill from default address if available
  const initialAddr = defaultAddress || addresses[0];
  const [fullName, setFullName] = useState(initialAddr?.fullName || user?.displayName || '');
  const [email, setEmail] = useState(user?.email || 'patron@example.com');
  const [phone, setPhone] = useState(initialAddr?.phone || '+91 ');
  const [street, setStreet] = useState(
    initialAddr
      ? `${initialAddr.apartment ? `${initialAddr.apartment}, ` : ''}${initialAddr.street}`
      : ''
  );
  const [city, setCity] = useState(initialAddr?.city || 'Mumbai');
  const [state, setState] = useState(initialAddr?.state || 'Maharashtra');
  const [pinCode, setPinCode] = useState(initialAddr?.pinCode || '400030');
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>(initialAddr?.id);

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'COD'>('UPI');

  // YouPI-PG Gateway Integration State (Merchant: 9804523216)
  const [youpiData, setYoupiData] = useState<YoupiPaymentData | null>(null);
  const [isLoadingYoupi, setIsLoadingYoupi] = useState(false);
  const [utrInput, setUtrInput] = useState('');
  const [isVerifyingUtr, setIsVerifyingUtr] = useState(false);
  const [utrVerified, setUtrVerified] = useState(false);
  const [utrError, setUtrError] = useState<string | null>(null);
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [countdown, setCountdown] = useState(300);
  const [youpiTab, setYoupiTab] = useState<'qr' | 'apps' | 'whatsapp'>('qr');
  const tempOrderId = useMemo(() => `HF-${Math.floor(100000 + Math.random() * 900000)}`, [isOpen]);

  // Fetch or initialize YouPI payment data when moving to payment step
  useEffect(() => {
    if (step === 'payment' && paymentMethod === 'UPI' && !youpiData) {
      setIsLoadingYoupi(true);
      fetch('/api/youpi/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: tempOrderId,
          amount: cartTotal,
          customerName: fullName,
          customerPhone: phone,
          customerEmail: email,
          description: `HIFFYY Luxury Perfume Flacons Order #${tempOrderId}`,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setYoupiData(data);
            setCountdown(data.expiresInSeconds || 300);
          }
        })
        .catch((err) => console.error('YouPI initialization error:', err))
        .finally(() => setIsLoadingYoupi(false));
    }
  }, [step, paymentMethod, youpiData, tempOrderId, cartTotal, fullName, phone, email]);

  // 5-minute countdown timer
  useEffect(() => {
    if (step !== 'payment' || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [step, countdown]);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = (text: string, type: 'vpa' | 'amount') => {
    navigator.clipboard.writeText(text);
    if (type === 'vpa') {
      setCopiedVpa(true);
      setTimeout(() => setCopiedVpa(false), 2000);
    } else {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    }
  };

  const handleVerifyUtr = async () => {
    if (!utrInput.trim()) {
      setUtrError('Please enter the 12-digit UPI UTR / Reference Number');
      return;
    }
    setUtrError(null);
    setIsVerifyingUtr(true);
    try {
      const res = await fetch('/api/youpi/verify-utr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: youpiData?.orderId || tempOrderId,
          utr: utrInput.trim(),
          amount: cartTotal,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUtrVerified(true);
      } else {
        setUtrError(data.error || 'Verification failed. Please check the reference number.');
      }
    } catch (err: any) {
      setUtrError(err.message || 'Unable to connect to verification engine.');
    } finally {
      setIsVerifyingUtr(false);
    }
  };

  const handleLaunchYoupiEmbed = () => {
    if (typeof (window as any).Youpi?.pay === 'function') {
      (window as any).Youpi.pay({
        order_id: youpiData?.orderId || tempOrderId,
        amount: cartTotal,
        currency: 'INR',
        name: 'HIFFYY LUXURY PERFUMES',
        description: 'Order #' + (youpiData?.orderId || tempOrderId),
        customer: {
          name: fullName,
          email,
          phone,
        },
        handler: (response: any) => {
          if (response && response.utr) {
            setUtrInput(response.utr);
            setUtrVerified(true);
          }
        },
      });
    } else {
      alert('YouPI PG SDK script is loaded. Using direct UPI interface below.');
    }
  };

  if (!isOpen) return null;

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !street || !city || !pinCode) {
      alert('Please provide complete delivery and contact information.');
      return;
    }
    setStep('payment');
  };

  const handleCompleteOrder = async () => {
    setIsSubmitting(true);
    try {
      const orderItems = cart.map((i) => ({
        productId: i.product.id,
        title: i.product.title,
        variantSize: i.variantSize,
        sku: i.product.variants.find((v) => v.size === i.variantSize)?.sku || i.product.sku,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        subtotal: i.unitPrice * i.quantity,
        image: i.product.images[0],
      }));

      const newOrder = await createOrder({
        channel: 'website',
        customer: {
          uid: user?.uid,
          name: fullName,
          email,
          phone,
        },
        items: orderItems,
        subtotal: cartSubtotal,
        discount: cartDiscount,
        tax: cartTax,
        shippingFee: cartShipping,
        total: cartTotal,
        paymentMethod: paymentMethod === 'COD' ? 'Cash' : paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'pending' : (utrVerified || paymentMethod === 'UPI' ? 'paid' : 'paid'),
        notes: utrInput ? `Paid via YouPI PG (Merchant: 9804523216). UTR: ${utrInput}` : (paymentMethod === 'UPI' ? 'Paid via YouPI PG (Merchant: 9804523216)' : undefined),
        shippingAddress: {
          fullName,
          street,
          city,
          state,
          pinCode,
          phone,
        },
      });

      setCreatedOrder(newOrder);
      setStep('confirmation');
    } catch (err) {
      console.error('Order creation error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 bg-[#12231A]/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-3 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#FAF8F5] border border-[#E6DFD5] shadow-2xl rounded-lg my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Compact Header */}
        <div className="px-4 py-2.5 bg-white border-b border-[#E6DFD5] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-serif font-bold text-[#12231A] tracking-wider uppercase">
              HIFFYY Royal Checkout
            </span>
            <span className="px-1.5 py-0.5 bg-[#F4EFE6] text-[#886938] text-[8px] font-mono tracking-wider uppercase font-semibold rounded">
              256-Bit SSL
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Step Indicators */}
            <div className="hidden sm:flex items-center gap-1.5 text-[9px] uppercase font-bold text-[#717A75]">
              <span className={step === 'details' ? 'text-[#12231A]' : 'opacity-50'}>1. Delivery</span>
              <span>&rsaquo;</span>
              <span className={step === 'payment' ? 'text-[#12231A]' : 'opacity-50'}>2. Payment</span>
              <span>&rsaquo;</span>
              <span className={step === 'confirmation' ? 'text-[#12231A]' : 'opacity-50'}>3. Sealed</span>
            </div>
            <button onClick={onClose} className="text-[#717A75] hover:text-[#12231A] cursor-pointer p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step 1: Customer & Delivery Details */}
        {step === 'details' && (
          <form onSubmit={handleDetailsSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-3.5 sm:p-4 overflow-y-auto space-y-3 flex-1 text-xs">
              {/* Saved Addresses Pill Selector */}
              {addresses.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                  <span className="text-[10px] uppercase font-bold text-[#717A75] shrink-0">Quick Fill:</span>
                  {addresses.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => {
                        setSelectedAddressId(a.id);
                        setFullName(a.fullName);
                        setPhone(a.phone);
                        setStreet(`${a.apartment ? `${a.apartment}, ` : ''}${a.street}`);
                        setCity(a.city);
                        setState(a.state);
                        setPinCode(a.pinCode);
                      }}
                      className={`px-2.5 py-1 rounded border text-[10px] font-semibold whitespace-nowrap cursor-pointer transition-all ${
                        selectedAddressId === a.id
                          ? 'border-[#12231A] bg-[#12231A] text-[#DFCAAB]'
                          : 'border-[#E6DFD5] bg-white text-[#12231A] hover:border-[#886938]'
                      }`}
                    >
                      {a.fullName} ({a.addressType || 'home'})
                    </button>
                  ))}
                </div>
              )}

              {/* Contact Row: Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#717A75] font-semibold mb-0.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Vikramaditya Singhania"
                    className="w-full py-1.5 px-2.5 bg-white border border-[#E6DFD5] text-xs focus:outline-none focus:border-[#12231A] rounded-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#717A75] font-semibold mb-0.5">
                    Mobile Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98200 12345"
                    className="w-full py-1.5 px-2.5 bg-white border border-[#E6DFD5] text-xs focus:outline-none focus:border-[#12231A] rounded-sm"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#717A75] font-semibold mb-0.5">
                  Email Address (For Invoice) *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patron@domain.com"
                  className="w-full py-1.5 px-2.5 bg-white border border-[#E6DFD5] text-xs focus:outline-none focus:border-[#12231A] rounded-sm"
                />
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#717A75] font-semibold mb-0.5">
                  Delivery Address (Flat / House / Street) *
                </label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. Penthouse 18, Worli Sea Face"
                  className="w-full py-1.5 px-2.5 bg-white border border-[#E6DFD5] text-xs focus:outline-none focus:border-[#12231A] rounded-sm"
                />
              </div>

              {/* City + State + PIN code inline row */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#717A75] font-semibold mb-0.5">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Mumbai"
                    className="w-full py-1.5 px-2.5 bg-white border border-[#E6DFD5] text-xs focus:outline-none focus:border-[#12231A] rounded-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#717A75] font-semibold mb-0.5">
                    State *
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full py-1.5 px-2 bg-white border border-[#E6DFD5] text-xs focus:outline-none focus:border-[#12231A] rounded-sm"
                  >
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Delhi">Delhi NCR</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#717A75] font-semibold mb-0.5">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder="400030"
                    className="w-full py-1.5 px-2.5 bg-white border border-[#E6DFD5] text-xs font-mono focus:outline-none focus:border-[#12231A] rounded-sm"
                  />
                </div>
              </div>
            </div>

            {/* Step 1 Compact Sticky Footer */}
            <div className="px-4 py-2.5 bg-white border-t border-[#E6DFD5] flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] text-[#717A75] block leading-none">Payable Amount:</span>
                <span className="text-base font-serif font-bold text-[#12231A]">
                  ₹{cartTotal.toLocaleString('en-IN')}
                </span>
              </div>
              <button
                type="submit"
                className="py-2 px-5 bg-[#12231A] text-[#DFCAAB] text-xs uppercase tracking-wider font-bold hover:bg-[#182F23] flex items-center gap-1.5 rounded-sm cursor-pointer shadow"
              >
                <span>Continue to Pay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Compact Payment & YouPI-PG Gateway */}
        {step === 'payment' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="p-3 sm:p-3.5 overflow-y-auto space-y-2.5 flex-1 text-xs">
              {/* Payment Method Segmented Tabs (34px height) */}
              <div className="grid grid-cols-3 gap-1 bg-[#EBE5DA] p-1 rounded-md">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`py-1.5 px-2 text-[11px] font-bold rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    paymentMethod === 'UPI'
                      ? 'bg-[#12231A] text-[#DFCAAB] shadow-sm'
                      : 'text-[#12231A] hover:bg-white/60'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Instant UPI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Card')}
                  className={`py-1.5 px-2 text-[11px] font-bold rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    paymentMethod === 'Card'
                      ? 'bg-[#12231A] text-[#DFCAAB] shadow-sm'
                      : 'text-[#12231A] hover:bg-white/60'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`py-1.5 px-2 text-[11px] font-bold rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    paymentMethod === 'COD'
                      ? 'bg-[#12231A] text-[#DFCAAB] shadow-sm'
                      : 'text-[#12231A] hover:bg-white/60'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>COD</span>
                </button>
              </div>

              {/* YouPI Gateway Compact Card */}
              {paymentMethod === 'UPI' && (
                <div className="bg-white border border-[#E6DFD5] rounded-lg p-2.5 space-y-2.5 shadow-xs">
                  {/* Compact Header Bar */}
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-bold text-[#12231A] uppercase tracking-wider text-[10px]">
                        YouPI-PG (0% Fee)
                      </span>
                      <span className="text-[#717A75] text-[10px]">•</span>
                      <span className="font-mono text-[10px] text-[#886938] font-bold">
                        {youpiData?.merchantVpa || '9804523216@upi'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-900 font-mono text-[10px] font-bold rounded">
                      <Clock className="w-3 h-3 text-amber-700" />
                      <span>{formatTimer(countdown)}</span>
                    </div>
                  </div>

                  {/* Compact QR + Payment Meta Side-by-Side */}
                  <div className="flex items-center gap-3 bg-[#FAF8F5] p-2 rounded border border-[#E6DFD5]">
                    {/* Compact QR (96x96 px) */}
                    <div className="relative p-1 bg-white border border-[#12231A] rounded shrink-0 shadow-xs">
                      {isLoadingYoupi ? (
                        <div className="w-24 h-24 flex items-center justify-center">
                          <RefreshCw className="w-5 h-5 animate-spin text-[#886938]" />
                        </div>
                      ) : (
                        <img
                          src={
                            youpiData?.qrCodeUrl ||
                            `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent('upi://pay?pa=9804523216@upi&pn=HIFFYY%20LUXURY&am=' + cartTotal)}`
                          }
                          alt="QR"
                          className="w-24 h-24 object-contain"
                        />
                      )}
                    </div>

                    {/* Meta & Quick Actions */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[10px] text-[#717A75]">Payee:</span>
                        <span className="text-[11px] font-bold text-[#12231A] truncate">HIFFYY (+91 9804523216)</span>
                      </div>

                      <div className="flex items-center justify-between gap-1 text-[11px]">
                        <span className="text-[10px] text-[#717A75]">VPA:</span>
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-bold text-[10px] text-[#886938] truncate max-w-[130px]">
                            {youpiData?.merchantVpa || '9804523216@upi'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(youpiData?.merchantVpa || '9804523216@upi', 'vpa')}
                            className="p-0.5 text-[#717A75] hover:text-[#12231A] cursor-pointer"
                            title="Copy VPA"
                          >
                            {copiedVpa ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-1 text-[11px]">
                        <span className="text-[10px] text-[#717A75]">Total:</span>
                        <div className="flex items-center gap-1 font-bold text-xs text-[#12231A]">
                          <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(String(cartTotal), 'amount')}
                            className="p-0.5 text-[#717A75] hover:text-[#12231A] cursor-pointer"
                            title="Copy Amount"
                          >
                            {copiedAmount ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                      {/* 1-Tap UPI Apps Pills Row */}
                      <div className="flex items-center gap-1 pt-0.5 overflow-x-auto">
                        <a
                          href={youpiData?.intents.gpay || `tez://upi/pay?pa=9804523216@upi&pn=HIFFYY&am=${cartTotal}&cu=INR`}
                          className="px-1.5 py-0.5 bg-white border border-[#E6DFD5] hover:border-[#12231A] text-[9px] font-bold text-[#12231A] rounded whitespace-nowrap"
                        >
                          GPay
                        </a>
                        <a
                          href={youpiData?.intents.phonepe || `phonepe://pay?pa=9804523216@upi&pn=HIFFYY&am=${cartTotal}&cu=INR`}
                          className="px-1.5 py-0.5 bg-white border border-[#E6DFD5] hover:border-[#12231A] text-[9px] font-bold text-purple-800 rounded whitespace-nowrap"
                        >
                          PhonePe
                        </a>
                        <a
                          href={youpiData?.intents.paytm || `paytmmp://pay?pa=9804523216@upi&pn=HIFFYY&am=${cartTotal}&cu=INR`}
                          className="px-1.5 py-0.5 bg-white border border-[#E6DFD5] hover:border-[#12231A] text-[9px] font-bold text-sky-800 rounded whitespace-nowrap"
                        >
                          Paytm
                        </a>
                        <a
                          href={youpiData?.intents.cred || `credpay://pay?pa=9804523216@upi&pn=HIFFYY&am=${cartTotal}&cu=INR`}
                          className="px-1.5 py-0.5 bg-white border border-[#E6DFD5] hover:border-[#12231A] text-[9px] font-bold text-[#12231A] rounded whitespace-nowrap"
                        >
                          CRED
                        </a>
                        <a
                          href={youpiData?.whatsappLink || `https://wa.me/919804523216`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-1.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[9px] font-bold rounded flex items-center gap-0.5 whitespace-nowrap"
                          title="WhatsApp Handshake"
                        >
                          <MessageCircle className="w-2.5 h-2.5 text-emerald-700" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Inline 12-Digit UTR Entry */}
                  <div className="space-y-1 pt-0.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#12231A] font-bold uppercase tracking-wider">
                        12-Digit UPI UTR Reference:
                      </span>
                      <span className="text-[#717A75]">(From UPI app after paying)</span>
                    </div>

                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={utrInput}
                        onChange={(e) => {
                          setUtrInput(e.target.value.replace(/[^0-9a-zA-Z]/g, ''));
                          if (utrError) setUtrError(null);
                        }}
                        placeholder="e.g. 429188472910"
                        maxLength={16}
                        className="flex-1 py-1 px-2.5 bg-[#FAF8F5] border border-[#E6DFD5] text-xs font-mono font-bold tracking-wider focus:outline-none focus:border-[#12231A] rounded-sm"
                      />
                      <button
                        type="button"
                        disabled={isVerifyingUtr || utrVerified}
                        onClick={handleVerifyUtr}
                        className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer shrink-0 ${
                          utrVerified
                            ? 'bg-emerald-600 text-white cursor-default'
                            : 'bg-[#12231A] hover:bg-[#182F23] text-[#DFCAAB]'
                        }`}
                      >
                        {isVerifyingUtr ? (
                          <RefreshCw className="w-3 h-3 animate-spin mx-auto" />
                        ) : utrVerified ? (
                          <span className="flex items-center gap-1">
                            <Check className="w-3 h-3" /> Linked
                          </span>
                        ) : (
                          'Verify UTR'
                        )}
                      </button>
                    </div>

                    {utrError && (
                      <div className="text-[10px] text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{utrError}</span>
                      </div>
                    )}

                    {utrVerified && (
                      <div className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>UTR {utrInput} authenticated for merchant 9804523216!</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Card Fallback Info */}
              {paymentMethod === 'Card' && (
                <div className="p-3 bg-white border border-[#E6DFD5] rounded text-center space-y-1 text-xs">
                  <CreditCard className="w-5 h-5 text-[#886938] mx-auto" />
                  <span className="font-bold text-[#12231A] block text-xs">Encrypted Card Terminal</span>
                  <p className="text-[11px] text-[#717A75]">
                    Accepting Visa, Mastercard & RuPay. 3D Secure OTP verification triggers on submission.
                  </p>
                </div>
              )}

              {/* COD Fallback Info */}
              {paymentMethod === 'COD' && (
                <div className="p-3 bg-white border border-[#E6DFD5] rounded text-center space-y-1 text-xs">
                  <Truck className="w-5 h-5 text-[#886938] mx-auto" />
                  <span className="font-bold text-[#12231A] block text-xs">Cash on Delivery</span>
                  <p className="text-[11px] text-[#717A75]">
                    Pay ₹{cartTotal.toLocaleString('en-IN')} in cash or UPI upon parcel delivery.
                  </p>
                </div>
              )}
            </div>

            {/* Step 2 Compact Sticky Footer */}
            <div className="px-4 py-2.5 bg-white border-t border-[#E6DFD5] flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setStep('details')}
                className="text-xs text-[#717A75] hover:text-[#12231A] underline cursor-pointer"
              >
                &larr; Back
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleCompleteOrder}
                className="py-2 px-5 bg-[#12231A] text-[#DFCAAB] text-xs uppercase tracking-wider font-bold hover:bg-[#182F23] flex items-center gap-1.5 rounded-sm cursor-pointer shadow-md disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Allocating...</span>
                ) : (
                  <>
                    <span>Confirm Order • ₹{cartTotal.toLocaleString('en-IN')}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Compact Confirmation */}
        {step === 'confirmation' && createdOrder && (
          <div className="p-5 text-center space-y-3.5 bg-white overflow-y-auto">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-800 mx-auto flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>

            <div>
              <span className="text-[9px] tracking-widest uppercase font-bold text-[#886938] block mb-0.5">
                Order Confirmed & Sealed
              </span>
              <h2 className="text-lg font-serif font-bold text-[#12231A]">
                Thank You, {createdOrder.customer.name}
              </h2>
              <p className="text-[11px] text-[#717A75] mt-0.5">
                Dispatched from Mumbai Central Hub. Receipt sent to {createdOrder.customer.phone}.
              </p>
            </div>

            {/* Compact Order Details */}
            <div className="p-3 bg-[#FAF8F5] border border-[#E6DFD5] text-left rounded space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-[#717A75]">Order ID:</span>
                <span className="font-mono font-bold text-[#12231A]">{createdOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#717A75]">Tracking:</span>
                <span className="font-mono font-semibold text-[#886938]">{createdOrder.trackingNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#717A75]">Courier:</span>
                <span className="text-[#12231A]">{createdOrder.carrier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#717A75]">Destination:</span>
                <span className="text-[#12231A]">
                  {createdOrder.shippingAddress.city}, {createdOrder.shippingAddress.pinCode}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#E6DFD5] font-bold text-[#12231A]">
                <span>Total Settled:</span>
                <span className="text-emerald-700">₹{createdOrder.total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2 px-5 bg-[#12231A] text-[#DFCAAB] text-xs uppercase tracking-wider font-bold hover:bg-[#182F23] rounded-sm cursor-pointer shadow"
            >
              Continue Exploring HIFFYY
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

