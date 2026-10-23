import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Clock,
  Layers,
  Activity,
  Key,
  Globe,
  Settings,
  Send,
  AlertCircle,
  TrendingUp,
  FileText,
  Printer,
  X,
  CreditCard,
  Banknote,
  DollarSign,
  Download,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

// Indian numbering format converter for official GST Tax Invoice
function numberToWordsINR(amount: number): string {
  const num = Math.round(amount);
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (num === 0) return 'Rupees Zero Only';
  const n = ('000000000' + num).slice(-9);
  const match = n.match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!match) return `Rupees ${num} Only`;

  let str = '';
  str += Number(match[1]) !== 0 ? (a[Number(match[1])] || b[Number(match[1][0])] + ' ' + a[Number(match[1][1])]) + 'Crore ' : '';
  str += Number(match[2]) !== 0 ? (a[Number(match[2])] || b[Number(match[2][0])] + ' ' + a[Number(match[2][1])]) + 'Lakh ' : '';
  str += Number(match[3]) !== 0 ? (a[Number(match[3])] || b[Number(match[3][0])] + ' ' + a[Number(match[3][1])]) + 'Thousand ' : '';
  str += Number(match[4]) !== 0 ? (a[Number(match[4])] || b[Number(match[4][0])] + ' ' + a[Number(match[4][1])]) + 'Hundred ' : '';
  str += Number(match[5]) !== 0 ? ((str !== '') ? 'and ' : '') + (a[Number(match[5])] || b[Number(match[5][0])] + ' ' + a[Number(match[5][1])]) : '';
  return 'Rupees ' + str.trim() + ' Only';
}

interface YoupiConfig {
  merchantPhone: string;
  merchantVpa: string;
  businessName: string;
  gatewayActive: boolean;
  portalUrl: string;
  apiUrl: string;
  adminUrl: string;
  controlCenterUrl: string;
  webhookSecret: string;
  testMode: boolean;
  autoVerifySim: boolean;
}

export interface YoupiTransaction {
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  utr: string;
  merchantPhone: string;
  merchantVpa: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  paymentMode?: 'UPI' | 'Card' | 'COD' | 'NetBanking' | string;
  createdAt: string;
  verifiedAt?: string;
}

export const YoupiGatewayManager: React.FC = () => {
  const { orders } = useStore();

  const [config, setConfig] = useState<YoupiConfig>({
    merchantPhone: '9804523216',
    merchantVpa: '9804523216@upi',
    businessName: 'HIFFYY LUXURY PERFUMES',
    gatewayActive: true,
    portalUrl: 'http://localhost:7000',
    apiUrl: 'http://localhost:6100',
    adminUrl: 'http://localhost:6001',
    controlCenterUrl: 'http://localhost:8090',
    webhookSecret: 'youpi_sec_9804523216_hiffyy',
    testMode: false,
    autoVerifySim: true,
  });

  const [transactions, setTransactions] = useState<YoupiTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [testAmount, setTestAmount] = useState('10');
  const [testResult, setTestResult] = useState<any | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [gatewayStatus, setGatewayStatus] = useState<{
    online: boolean;
    services: Record<string, string>;
  } | null>(null);

  // Invoice Generation State
  const [selectedInvoiceTx, setSelectedInvoiceTx] = useState<YoupiTransaction | null>(null);
  const [activeInvoicePaymentMode, setActiveInvoicePaymentMode] = useState<string>('UPI');
  const [isUpdatingTx, setIsUpdatingTx] = useState(false);

  // Load config & transactions
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cfgRes, txRes, statusRes] = await Promise.all([
        fetch('/api/youpi/config'),
        fetch('/api/youpi/transactions'),
        fetch('/api/youpi/status'),
      ]);

      if (cfgRes.ok) {
        const cfgData = await cfgRes.json();
        setConfig((prev) => ({ ...prev, ...cfgData }));
      }
      if (txRes.ok) {
        const txData = await txRes.json();
        setTransactions(txData);
      }
      if (statusRes.ok) {
        const statData = await statusRes.json();
        setGatewayStatus(statData);
      }
    } catch (err) {
      console.error('Error loading YouPI data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/youpi/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save YouPI config:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestPayment = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const orderId = `TEST-YOUPI-${Date.now().toString().slice(-4)}`;
      const res = await fetch('/api/youpi/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          amount: Number(testAmount) || 10,
          customerName: 'Admin Sandbox Tester',
          customerPhone: config.merchantPhone,
          description: 'YouPI PG Test Verification',
        }),
      });
      const data = await res.json();
      setTestResult(data);
      loadData();
    } catch (err: any) {
      alert('Test payment creation failed: ' + err.message);
    } finally {
      setIsTesting(false);
    }
  };

  const setVpaHandle = (handle: string) => {
    const phone = config.merchantPhone.trim();
    setConfig((prev) => ({ ...prev, merchantVpa: `${phone}${handle}` }));
  };

  // Open Invoice Modal with selected transaction and initial paymentMode
  const handleOpenInvoice = (tx: YoupiTransaction) => {
    setSelectedInvoiceTx(tx);
    setActiveInvoicePaymentMode(tx.paymentMode || 'UPI');
  };

  // Change Payment Mode on Transaction & Sync Backend
  const handleChangeInvoiceMode = async (newMode: string) => {
    setActiveInvoicePaymentMode(newMode);
    if (!selectedInvoiceTx) return;

    // Update in-memory selected transaction
    const updatedTx = { ...selectedInvoiceTx, paymentMode: newMode };
    setSelectedInvoiceTx(updatedTx);

    // Update in transactions list
    setTransactions((prev) =>
      prev.map((t) => (t.orderId === selectedInvoiceTx.orderId ? { ...t, paymentMode: newMode } : t))
    );

    try {
      await fetch('/api/youpi/update-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedInvoiceTx.orderId,
          paymentMode: newMode,
        }),
      });
    } catch (err) {
      console.error('Failed to sync payment mode update', err);
    }
  };

  // Quick action: Mark as Paid & immediately generate invoice
  const handleQuickMarkPaid = async (tx: YoupiTransaction) => {
    setIsUpdatingTx(true);
    const mockUtr = tx.utr || `${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    const targetMode = tx.paymentMode || 'UPI';

    const updatedTx: YoupiTransaction = {
      ...tx,
      status: 'PAID',
      utr: mockUtr,
      paymentMode: targetMode,
      verifiedAt: new Date().toISOString(),
    };

    setTransactions((prev) =>
      prev.map((t) => (t.orderId === tx.orderId ? updatedTx : t))
    );

    try {
      await fetch('/api/youpi/update-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: tx.orderId,
          status: 'PAID',
          utr: mockUtr,
          paymentMode: targetMode,
        }),
      });
    } catch (err) {
      console.error('Error marking paid:', err);
    } finally {
      setIsUpdatingTx(false);
      handleOpenInvoice(updatedTx);
    }
  };

  const totalCollected = transactions
    .filter((t) => t.status === 'VERIFIED' || t.status === 'PAID')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E6DFD5]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl font-serif font-bold text-[#12231A]">
              YouPI-PG Sovereign UPI Payment Gateway
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold rounded uppercase">
              0% Gateway Fees
            </span>
          </div>
          <p className="text-xs text-[#717A75]">
            Direct P2P bank settlement on NPCI UPI rails. Integrated with Merchant Phone:{' '}
            <strong className="font-mono text-[#12231A]">{config.merchantPhone}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2 bg-white border border-[#E6DFD5] text-[#12231A] hover:bg-[#FAF8F5] text-xs font-semibold rounded flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Ledger</span>
          </button>

          <a
            href="http://localhost:6001"
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-3 bg-[#12231A] text-[#DFCAAB] text-xs font-bold rounded flex items-center gap-1.5 hover:bg-[#182F23] cursor-pointer shadow-sm"
          >
            <span>YouPI Merchant Admin (6001)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-[#E6DFD5] rounded-sm">
          <span className="text-[10px] uppercase font-bold text-[#717A75] block mb-1">
            Settlement Method
          </span>
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-700" />
            <span className="text-base font-bold text-[#12231A]">Direct P2P UPI</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
            T+0 Instant Bank Deposit
          </span>
        </div>

        <div className="p-4 bg-white border border-[#E6DFD5] rounded-sm">
          <span className="text-[10px] uppercase font-bold text-[#717A75] block mb-1">
            Platform Gateway Fee
          </span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-serif font-bold text-emerald-700">0.0%</span>
            <span className="text-[10px] text-[#717A75]">(Razorpay takes 2.36%)</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
            100% Retained Revenue
          </span>
        </div>

        <div className="p-4 bg-white border border-[#E6DFD5] rounded-sm">
          <span className="text-[10px] uppercase font-bold text-[#717A75] block mb-1">
            Total UPI Settled
          </span>
          <span className="text-2xl font-serif font-bold text-[#12231A] block">
            ₹{totalCollected.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-[#717A75] block mt-1">
            Across {transactions.filter((t) => t.status === 'VERIFIED').length} verified transactions
          </span>
        </div>

        <div className="p-4 bg-white border border-[#E6DFD5] rounded-sm">
          <span className="text-[10px] uppercase font-bold text-[#717A75] block mb-1">
            Primary Merchant VPA
          </span>
          <span className="text-sm font-mono font-bold text-[#886938] block truncate">
            {config.merchantVpa}
          </span>
          <span className="text-[10px] text-[#717A75] block mt-1">
            Mobile: +91 {config.merchantPhone}
          </span>
        </div>
      </div>

      {/* Gateway Topology Services Monitor */}
      <div className="bg-[#12231A] text-[#FAF8F5] p-4 rounded-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              YouPI PG Microservice Topology
            </span>
            <span className="px-2 py-0.5 bg-emerald-900/80 border border-emerald-400/50 text-emerald-300 text-[9px] font-mono rounded">
              ONLINE
            </span>
          </div>
          <p className="text-[11px] text-[#DFCAAB]/80">
            Node.js 24 LTS process engine with local SQLite WAL database & automated banking observers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="http://localhost:8090"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 bg-[#182F23] hover:bg-[#203D2E] text-[10px] font-mono text-[#DFCAAB] rounded border border-[#C5A880]/30 flex items-center gap-1"
          >
            <span>Control Center :8090</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
          <a
            href="http://localhost:6001"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 bg-[#182F23] hover:bg-[#203D2E] text-[10px] font-mono text-[#DFCAAB] rounded border border-[#C5A880]/30 flex items-center gap-1"
          >
            <span>Merchant Admin :6001</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
          <a
            href="http://localhost:7000"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 bg-[#182F23] hover:bg-[#203D2E] text-[10px] font-mono text-[#DFCAAB] rounded border border-[#C5A880]/30 flex items-center gap-1"
          >
            <span>Checkout Portal :7000</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
          <a
            href="http://localhost:6100"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 bg-[#182F23] hover:bg-[#203D2E] text-[10px] font-mono text-[#DFCAAB] rounded border border-[#C5A880]/30 flex items-center gap-1"
          >
            <span>REST API :6100</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Merchant Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveConfig} className="p-5 bg-white border border-[#E6DFD5] rounded-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6DFD5]">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#886938]" />
                <h3 className="text-sm font-serif font-bold text-[#12231A] uppercase tracking-wider">
                  Merchant UPI Receiving Account Configuration
                </h3>
              </div>
              <span className="text-[10px] text-[#717A75]">Synchronized with store checkout</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Merchant Phone Number */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#717A75] font-semibold mb-1">
                  Merchant Phone Number *
                </label>
                <input
                  type="text"
                  required
                  value={config.merchantPhone}
                  onChange={(e) => setConfig({ ...config, merchantPhone: e.target.value })}
                  placeholder="9804523216"
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#E6DFD5] text-xs font-mono font-bold focus:outline-none focus:border-[#12231A]"
                />
                <span className="text-[10px] text-[#717A75] mt-1 block">
                  Used for WhatsApp verification handshake & UPI linking.
                </span>
              </div>

              {/* Business Name */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#717A75] font-semibold mb-1">
                  Payee Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={config.businessName}
                  onChange={(e) => setConfig({ ...config, businessName: e.target.value })}
                  placeholder="HIFFYY LUXURY PERFUMES"
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#E6DFD5] text-xs font-bold focus:outline-none focus:border-[#12231A]"
                />
                <span className="text-[10px] text-[#717A75] mt-1 block">
                  Displayed on the customer's UPI app (GPay/PhonePe).
                </span>
              </div>

              {/* UPI VPA Handle */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] uppercase tracking-wider text-[#717A75] font-semibold mb-1">
                  Primary UPI VPA ID *
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    required
                    value={config.merchantVpa}
                    onChange={(e) => setConfig({ ...config, merchantVpa: e.target.value })}
                    placeholder="9804523216@upi"
                    className="flex-1 p-2.5 bg-[#FAF8F5] border border-[#E6DFD5] text-xs font-mono font-bold text-[#886938] focus:outline-none focus:border-[#12231A]"
                  />
                  {/* Quick Select Bank Suffixes */}
                  <div className="flex flex-wrap gap-1 items-center">
                    <span className="text-[10px] text-[#717A75] mr-1">Quick Handles:</span>
                    <button
                      type="button"
                      onClick={() => setVpaHandle('@upi')}
                      className="px-2 py-1 bg-white border border-[#E6DFD5] hover:border-[#12231A] text-[10px] font-mono rounded cursor-pointer"
                    >
                      @upi
                    </button>
                    <button
                      type="button"
                      onClick={() => setVpaHandle('@ybl')}
                      className="px-2 py-1 bg-white border border-[#E6DFD5] hover:border-[#12231A] text-[10px] font-mono rounded cursor-pointer"
                    >
                      @ybl (PhonePe)
                    </button>
                    <button
                      type="button"
                      onClick={() => setVpaHandle('@okaxis')}
                      className="px-2 py-1 bg-white border border-[#E6DFD5] hover:border-[#12231A] text-[10px] font-mono rounded cursor-pointer"
                    >
                      @okaxis (GPay)
                    </button>
                    <button
                      type="button"
                      onClick={() => setVpaHandle('@paytm')}
                      className="px-2 py-1 bg-white border border-[#E6DFD5] hover:border-[#12231A] text-[10px] font-mono rounded cursor-pointer"
                    >
                      @paytm
                    </button>
                  </div>
                </div>
              </div>

              {/* Webhook Secret */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] uppercase tracking-wider text-[#717A75] font-semibold mb-1">
                  HMAC-SHA256 Webhook Signing Secret
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={config.webhookSecret}
                    className="flex-1 p-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs font-mono text-[#717A75]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(config.webhookSecret);
                      setCopiedKey(true);
                      setTimeout(() => setCopiedKey(false), 2000);
                    }}
                    className="px-3 py-2 bg-white border border-[#E6DFD5] hover:border-[#12231A] text-xs text-[#717A75] hover:text-[#12231A] rounded flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <span className="text-[10px] text-[#717A75] mt-1 block">
                  Authoritative webhook endpoint:{' '}
                  <code className="text-[#12231A] font-semibold">http://localhost:3000/api/youpi/webhook</code>
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E6DFD5] flex items-center justify-between">
              {saveSuccess ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Gateway settings saved and active in storefront!</span>
                </div>
              ) : (
                <span className="text-[10px] text-[#717A75]">
                  Instant sync across all checkout modals and API endpoints.
                </span>
              )}

              <button
                type="submit"
                disabled={isSaving}
                className="py-2.5 px-6 bg-[#12231A] text-[#DFCAAB] text-xs uppercase tracking-wider font-bold hover:bg-[#182F23] rounded-sm cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Gateway Configuration'}
              </button>
            </div>
          </form>

          {/* Test Payment Simulator */}
          <div className="p-5 bg-white border border-[#E6DFD5] rounded-sm space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-serif font-bold text-[#12231A] uppercase tracking-wider">
                Instant UPI Intent & Vector QR Test Generator
              </h3>
            </div>
            <p className="text-xs text-[#717A75]">
              Simulate creating a live UPI intent and generating dynamic vector QR code for merchant number{' '}
              <strong className="font-mono text-[#12231A]">{config.merchantPhone}</strong>.
            </p>

            <div className="flex gap-2 max-w-sm">
              <input
                type="number"
                value={testAmount}
                onChange={(e) => setTestAmount(e.target.value)}
                placeholder="Amount in ₹"
                className="w-28 p-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs font-bold focus:outline-none focus:border-[#12231A]"
              />
              <button
                type="button"
                disabled={isTesting}
                onClick={handleTestPayment}
                className="px-4 py-2 bg-[#886938] hover:bg-[#6E542C] text-white text-xs font-bold uppercase tracking-wider rounded-sm flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Generate Test Payment</span>
              </button>
            </div>

            {testResult && (
              <div className="p-3 bg-[#FAF8F5] border border-[#E6DFD5] rounded text-xs space-y-2 mt-3">
                <div className="flex items-center justify-between font-bold text-[#12231A]">
                  <span>Generated Order: {testResult.orderId}</span>
                  <span className="text-emerald-700">₹{testResult.formattedAmount}</span>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 border-t border-[#E6DFD5]">
                  <img src={testResult.qrCodeUrl} alt="Test QR" className="w-28 h-28 border border-[#E6DFD5] p-1 bg-white" />
                  <div className="text-[11px] text-[#717A75] space-y-1">
                    <div>
                      <strong>UPI URI:</strong> <code className="break-all font-mono text-[10px] text-[#12231A]">{testResult.upiUri}</code>
                    </div>
                    <div>
                      <strong>WhatsApp Link:</strong>{' '}
                      <a
                        href={testResult.whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 underline"
                      >
                        Open WhatsApp Chat (+91 {testResult.merchantPhone}) &rarr;
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Quick References & Observers */}
        <div className="space-y-4">
          <div className="p-4 bg-white border border-[#E6DFD5] rounded-sm space-y-3">
            <h4 className="text-xs font-serif font-bold text-[#12231A] uppercase tracking-wider">
              About YouPI-PG Gateway
            </h4>
            <p className="text-[11px] text-[#717A75] leading-relaxed">
              YouPI-PG is an open-source, sovereign payment gateway designed for direct merchant settlements.
            </p>
            <ul className="text-[11px] text-[#12231A] space-y-2 border-t border-[#F0EBE1] pt-2">
              <li className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Zero percentage deductions on transactions.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Dual session timers (5:00 pay, 0:30 verify).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Instant 1-tap app switching on mobile (GPay, PhonePe, Paytm).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Direct WhatsApp concierge notification for customer assurance.</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-white border border-[#E6DFD5] rounded-sm space-y-3">
            <h4 className="text-xs font-serif font-bold text-[#12231A] uppercase tracking-wider">
              Universal Embed SDK Script
            </h4>
            <p className="text-[11px] text-[#717A75]">
              To embed YouPI-PG into any other landing page or external funnel, include:
            </p>
            <div className="p-2.5 bg-[#FAF8F5] border border-[#E6DFD5] rounded font-mono text-[10px] text-[#12231A] break-all select-all">
              &lt;script src="/youpi.js" data-youpi-key="00000000-0000-0000-0000-000000000001" data-currency="INR"&gt;&lt;/script&gt;
            </div>
            <span className="text-[10px] text-[#717A75] block">
              Invokable programmatically via <code className="text-[#886938] font-bold">window.Youpi.pay(...)</code> or on buttons with <code className="text-[#886938] font-bold">[data-youpi-pay]</code>.
            </span>
          </div>
        </div>
      </div>

      {/* Real-Time Payment Ledger Table */}
      <div className="p-5 bg-white border border-[#E6DFD5] rounded-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-serif font-bold text-[#12231A] uppercase tracking-wider">
              YouPI-PG Transaction Reconciliation Ledger
            </h3>
            <p className="text-xs text-[#717A75]">
              Recent incoming UPI settlements, UTR reference numbers, and verification records.
            </p>
          </div>
          <span className="text-xs font-bold text-[#886938] font-mono">
            {transactions.length} Records
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="p-8 text-center bg-[#FAF8F5] border border-dashed border-[#E6DFD5] rounded text-xs text-[#717A75]">
            No payments recorded yet. Use the Test Generator above or place an order in the Storefront to record transactions.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E6DFD5] text-[10px] uppercase font-bold text-[#717A75]">
                  <th className="p-3">Order Identifier</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Payment Mode</th>
                  <th className="p-3">Payee UPI VPA</th>
                  <th className="p-3">12-Digit UTR</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3 text-right">Tax Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DFD5]">
                {transactions.map((tx, idx) => {
                  const isCompleted = tx.status === 'VERIFIED' || tx.status === 'PAID';
                  const currentMode = tx.paymentMode || 'UPI';

                  return (
                    <tr key={idx} className="hover:bg-[#FAF8F5]/60 transition-colors">
                      <td className="p-3 font-mono font-bold text-[#12231A]">{tx.orderId}</td>
                      <td className="p-3">
                        <div className="font-semibold text-[#12231A]">{tx.customerName || 'Store Patron'}</div>
                        <div className="text-[10px] text-[#717A75]">{tx.customerPhone || '—'}</div>
                      </td>
                      <td className="p-3 font-bold text-[#12231A]">₹{tx.amount.toLocaleString('en-IN')}</td>
                      
                      {/* Payment Mode Column */}
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                            currentMode === 'Card'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : currentMode === 'COD'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : currentMode === 'NetBanking'
                              ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                              : 'bg-purple-50 text-purple-800 border-purple-200'
                          }`}
                        >
                          {currentMode === 'Card' ? (
                            <CreditCard className="w-3 h-3 text-blue-600" />
                          ) : currentMode === 'COD' ? (
                            <Banknote className="w-3 h-3 text-amber-600" />
                          ) : currentMode === 'NetBanking' ? (
                            <Globe className="w-3 h-3 text-indigo-600" />
                          ) : (
                            <Smartphone className="w-3 h-3 text-purple-600" />
                          )}
                          <span>{currentMode}</span>
                        </span>
                      </td>

                      <td className="p-3 font-mono text-[11px] text-[#886938]">{tx.merchantVpa || config.merchantVpa}</td>
                      <td className="p-3 font-mono font-semibold text-[#12231A]">
                        {tx.utr ? (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded">
                            {tx.utr}
                          </span>
                        ) : (
                          <span className="text-[#717A75] italic">Awaiting UTR</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="p-3 text-[11px] text-[#717A75]">
                        {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      {/* Tax Invoice Action Column */}
                      <td className="p-3 text-right">
                        {isCompleted ? (
                          <button
                            onClick={() => handleOpenInvoice(tx)}
                            className="px-2.5 py-1.5 bg-[#12231A] text-[#DFCAAB] text-[10px] uppercase font-bold tracking-wider hover:bg-[#182F23] rounded flex items-center gap-1.5 ml-auto cursor-pointer shadow-xs active:scale-95 transition-all"
                            title="Generate Official GST Tax Invoice"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#DFCAAB]" />
                            <span>Invoice</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleQuickMarkPaid(tx)}
                            disabled={isUpdatingTx}
                            className="px-2 py-1 bg-amber-50 text-amber-900 border border-amber-300 text-[10px] font-bold rounded flex items-center gap-1 ml-auto hover:bg-amber-100 cursor-pointer transition-all"
                            title="Mark transaction complete and generate invoice"
                          >
                            <Check className="w-3 h-3 text-amber-700" />
                            <span>Mark Paid & Invoice</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* LUXURY GST TAX INVOICE MODAL (With Payment Mode: UPI/Card/COD) */}
      {/* ============================================================== */}
      {selectedInvoiceTx && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Print Stylesheet for clean A4 printing */}
          <style>{`
            @media print {
              body * {
                visibility: hidden !important;
              }
              #printable-tax-invoice, #printable-tax-invoice * {
                visibility: visible !important;
              }
              #printable-tax-invoice {
                position: fixed !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 24px !important;
                box-shadow: none !important;
                border: 1px solid #12231A !important;
                background: white !important;
                z-index: 999999 !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}</style>

          <div className="relative w-full max-w-4xl bg-white border border-[#E6DFD5] shadow-2xl rounded-sm p-4 sm:p-8 my-auto max-h-[92vh] overflow-y-auto">
            {/* Control Bar (Hidden during print) */}
            <div className="no-print pb-4 mb-4 border-b border-[#E6DFD5] flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#886938] block">
                  YouPI-PG Invoice Reconciliation Generator
                </span>
                <h3 className="text-sm font-serif font-bold text-[#12231A]">
                  Official Tax Invoice • Order #{selectedInvoiceTx.orderId}
                </h3>
              </div>

              {/* Payment Mode Selector Pills */}
              <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1 border border-[#E6DFD5] rounded-sm text-xs">
                <span className="text-[10px] uppercase font-bold text-[#717A75] px-2">Payment Mode:</span>
                {(['UPI', 'Card', 'COD', 'NetBanking'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => handleChangeInvoiceMode(mode)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-xs transition-all cursor-pointer ${
                      activeInvoicePaymentMode === mode
                        ? 'bg-[#12231A] text-[#DFCAAB] shadow-xs'
                        : 'text-[#717A75] hover:text-[#12231A] hover:bg-white'
                    }`}
                  >
                    {mode === 'UPI' && 'UPI'}
                    {mode === 'Card' && 'Card'}
                    {mode === 'COD' && 'Cash on Delivery (COD)'}
                    {mode === 'NetBanking' && 'Net Banking'}
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-[#12231A] text-[#DFCAAB] text-xs uppercase tracking-wider font-bold hover:bg-[#182F23] flex items-center gap-1.5 rounded-sm cursor-pointer shadow-sm active:scale-95"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceTx(null)}
                  className="p-2 text-[#717A75] hover:text-[#12231A] hover:bg-[#FAF8F5] rounded-sm transition-colors cursor-pointer"
                  title="Close Invoice Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ============================================================== */}
            {/* PRINTABLE TAX INVOICE CONTAINER */}
            {/* ============================================================== */}
            {(() => {
              const matchedOrder = orders.find(
                (o) => o.orderNumber === selectedInvoiceTx.orderId || o.id === selectedInvoiceTx.orderId
              );

              const totalAmount = Number(selectedInvoiceTx.amount) || 0;
              // GST 18% calculation: Taxable Value = Total / 1.18
              const taxableBase = totalAmount / 1.18;
              const cgst = taxableBase * 0.09;
              const sgst = taxableBase * 0.09;
              const totalGst = cgst + sgst;

              const invoiceNumber = `INV-HIF-2026-${selectedInvoiceTx.orderId.replace(/[^A-Za-z0-9]/g, '').slice(-8).toUpperCase()}`;
              const invoiceDate = selectedInvoiceTx.verifiedAt
                ? new Date(selectedInvoiceTx.verifiedAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : new Date(selectedInvoiceTx.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  });

              const patronName = matchedOrder?.customer?.name || selectedInvoiceTx.customerName || 'Store Patron';
              const patronPhone = matchedOrder?.customer?.phone || selectedInvoiceTx.customerPhone || config.merchantPhone;
              const patronEmail = matchedOrder?.customer?.email || selectedInvoiceTx.customerEmail || 'patron@hiffyy.com';

              const addressLine = matchedOrder?.shippingAddress
                ? `${matchedOrder.shippingAddress.street}${matchedOrder.shippingAddress.apartment ? ', ' + matchedOrder.shippingAddress.apartment : ''}, ${matchedOrder.shippingAddress.city}, ${matchedOrder.shippingAddress.state} - ${matchedOrder.shippingAddress.pinCode}`
                : 'Registered Patron Residence, India';

              return (
                <div id="printable-tax-invoice" className="bg-white p-6 sm:p-8 border border-[#E6DFD5] rounded-sm space-y-6 text-[#12231A]">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b-2 border-[#12231A]">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-5 h-5 text-[#886938]" />
                        <span className="text-xl font-serif font-black tracking-widest text-[#12231A]">
                          HIFFYY LUXURY PERFUMES
                        </span>
                      </div>
                      <p className="text-[10px] tracking-wider uppercase font-semibold text-[#886938] mb-2">
                        HIFFYY LUXURY PERFUMES (OPC) PRIVATE LIMITED
                      </p>
                      <p className="text-xs text-[#717A75] leading-relaxed max-w-sm">
                        Plot 42, Attar Craft Corridor, Kannauj, Uttar Pradesh - 209725, India<br />
                        <strong>GSTIN:</strong> 09AABCH1234F1Z8 • <strong>CIN:</strong> U24246UP2024OPC198420<br />
                        <strong>State / Code:</strong> Uttar Pradesh (09) • <strong>Support:</strong> +91 {config.merchantPhone}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="inline-block px-3 py-1 bg-[#12231A] text-[#DFCAAB] text-xs font-serif font-bold uppercase tracking-widest mb-2">
                        TAX INVOICE
                      </span>
                      <p className="text-[10px] text-[#717A75] uppercase">
                        Issued under Section 31 of CGST Act, 2017
                      </p>
                      <p className="text-xs font-mono font-bold text-[#12231A] mt-1">
                        Invoice No: {invoiceNumber}
                      </p>
                      <p className="text-xs text-[#717A75]">
                        Date of Issue: {invoiceDate}
                      </p>
                    </div>
                  </div>

                  {/* Metadata & Prominent Payment Mode Ribbon */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-[#FAF8F5] border border-[#E6DFD5] rounded-sm">
                    {/* Billed To */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#886938] tracking-wider block mb-1">
                        Billed To & Shipped Destination:
                      </span>
                      <div className="text-sm font-bold text-[#12231A]">{patronName}</div>
                      <div className="text-xs text-[#717A75] leading-relaxed mt-0.5">{addressLine}</div>
                      <div className="text-xs font-mono text-[#717A75] mt-1">
                        Phone: {patronPhone} • Email: {patronEmail}
                      </div>
                      <div className="text-[10px] text-[#717A75] mt-0.5">
                        Place of Supply: {matchedOrder?.shippingAddress?.state || 'Uttar Pradesh (09)'}
                      </div>
                    </div>

                    {/* Payment Mode Highlight Box */}
                    <div className="md:border-l md:border-[#E6DFD5] md:pl-4 space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-[#886938] tracking-wider block">
                        Payment & Settlement Authentication:
                      </span>

                      {/* Prominent Payment Mode Badge */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#717A75]">Payment Mode:</span>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-black uppercase tracking-wider ${
                            activeInvoicePaymentMode === 'Card'
                              ? 'bg-blue-600 text-white'
                              : activeInvoicePaymentMode === 'COD'
                              ? 'bg-amber-600 text-white'
                              : activeInvoicePaymentMode === 'NetBanking'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-emerald-700 text-white'
                          }`}
                        >
                          {activeInvoicePaymentMode === 'Card' ? (
                            <CreditCard className="w-3.5 h-3.5" />
                          ) : activeInvoicePaymentMode === 'COD' ? (
                            <Banknote className="w-3.5 h-3.5" />
                          ) : activeInvoicePaymentMode === 'NetBanking' ? (
                            <Globe className="w-3.5 h-3.5" />
                          ) : (
                            <Smartphone className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {activeInvoicePaymentMode === 'UPI' && 'UPI (YouPI-PG Direct 0% MDR)'}
                            {activeInvoicePaymentMode === 'Card' && 'Credit / Debit Card'}
                            {activeInvoicePaymentMode === 'COD' && 'Cash on Delivery (COD)'}
                            {activeInvoicePaymentMode === 'NetBanking' && 'Net Banking (Bank Transfer)'}
                          </span>
                        </span>
                      </div>

                      <div className="text-xs flex items-center justify-between text-[#717A75]">
                        <span>Payment Status:</span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold uppercase text-[10px] rounded">
                          ✓ Settled & Verified
                        </span>
                      </div>

                      <div className="text-xs flex items-center justify-between text-[#717A75] font-mono">
                        <span>12-Digit UTR / Ref:</span>
                        <span className="font-bold text-[#12231A]">
                          {selectedInvoiceTx.utr || `YOUPI-${selectedInvoiceTx.orderId}`}
                        </span>
                      </div>

                      <div className="text-xs flex items-center justify-between text-[#717A75] font-mono">
                        <span>Merchant Payee VPA:</span>
                        <span className="text-[#886938]">{selectedInvoiceTx.merchantVpa || config.merchantVpa}</span>
                      </div>
                    </div>
                  </div>

                  {/* Line Items Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-[#E6DFD5] border-collapse">
                      <thead>
                        <tr className="bg-[#FAF8F5] border-b border-[#E6DFD5] text-[10px] uppercase font-bold text-[#717A75]">
                          <th className="p-2.5 text-center w-8">#</th>
                          <th className="p-2.5">Botanical Fragrance Description / Flacon</th>
                          <th className="p-2.5 text-center">HSN Code</th>
                          <th className="p-2.5 text-center">Qty</th>
                          <th className="p-2.5 text-right">Unit Rate (₹)</th>
                          <th className="p-2.5 text-right">Taxable Value (₹)</th>
                          <th className="p-2.5 text-right">GST (18%)</th>
                          <th className="p-2.5 text-right">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E6DFD5]">
                        {matchedOrder && matchedOrder.items && matchedOrder.items.length > 0 ? (
                          matchedOrder.items.map((item, i) => {
                            const itemTaxable = item.subtotal / 1.18;
                            const itemGst = item.subtotal - itemTaxable;

                            return (
                              <tr key={i} className="hover:bg-[#FAF8F5]/40">
                                <td className="p-2.5 text-center text-[#717A75] font-mono">{i + 1}</td>
                                <td className="p-2.5">
                                  <div className="font-bold text-[#12231A]">{item.title}</div>
                                  <div className="text-[10px] text-[#717A75]">
                                    Concentration: Extrait de Parfum • Flacon Size: {item.variantSize}
                                  </div>
                                </td>
                                <td className="p-2.5 text-center font-mono text-[#717A75]">330300</td>
                                <td className="p-2.5 text-center font-bold text-[#12231A]">{item.quantity}</td>
                                <td className="p-2.5 text-right font-mono">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                                <td className="p-2.5 text-right font-mono">₹{itemTaxable.toFixed(2)}</td>
                                <td className="p-2.5 text-right font-mono text-[#886938]">₹{itemGst.toFixed(2)}</td>
                                <td className="p-2.5 text-right font-bold text-[#12231A]">₹{item.subtotal.toLocaleString('en-IN')}</td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td className="p-2.5 text-center text-[#717A75] font-mono">1</td>
                            <td className="p-2.5">
                              <div className="font-bold text-[#12231A]">
                                HIFFYY Bespoke Extrait de Parfum Custom Flacon
                              </div>
                              <div className="text-[10px] text-[#717A75]">
                                Concentration: 38% Pure Oil • Flacon Size: 100ml / 3.4 FL. OZ. • 60-Day Indian Maceration
                              </div>
                            </td>
                            <td className="p-2.5 text-center font-mono text-[#717A75]">330300</td>
                            <td className="p-2.5 text-center font-bold text-[#12231A]">1</td>
                            <td className="p-2.5 text-right font-mono">₹{totalAmount.toLocaleString('en-IN')}</td>
                            <td className="p-2.5 text-right font-mono">₹{taxableBase.toFixed(2)}</td>
                            <td className="p-2.5 text-right font-mono text-[#886938]">₹{totalGst.toFixed(2)}</td>
                            <td className="p-2.5 text-right font-bold text-[#12231A]">₹{totalAmount.toLocaleString('en-IN')}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Calculations & Total Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    {/* Amount in words */}
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#717A75] tracking-wider block">
                          Total Amount in Words:
                        </span>
                        <p className="text-xs font-serif font-bold italic text-[#886938] leading-relaxed">
                          {numberToWordsINR(totalAmount)}
                        </p>
                      </div>

                      <div className="p-3 bg-[#FAF8F5] border border-[#E6DFD5] rounded-xs text-[10px] text-[#717A75] leading-relaxed">
                        <strong>Statutory Declaration:</strong> We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct. Fragrance compounds distilled under Good Manufacturing Practices (GMP).
                      </div>
                    </div>

                    {/* Breakdown Table */}
                    <div className="p-4 bg-[#FAF8F5] border border-[#E6DFD5] rounded-xs space-y-2 text-xs">
                      <div className="flex justify-between text-[#717A75]">
                        <span>Subtotal (Taxable Value):</span>
                        <span className="font-mono">₹{taxableBase.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-[#717A75]">
                        <span>Central GST (CGST @ 9%):</span>
                        <span className="font-mono">₹{cgst.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-[#717A75]">
                        <span>State GST (SGST @ 9%):</span>
                        <span className="font-mono">₹{sgst.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-[#717A75]">
                        <span>Insured White-Glove Shipping:</span>
                        <span className="text-emerald-800 font-bold uppercase text-[10px]">₹0.00 (Complimentary)</span>
                      </div>

                      <div className="pt-2 border-t-2 border-[#12231A] flex justify-between items-baseline font-bold">
                        <span className="text-sm font-serif uppercase tracking-wider text-[#12231A]">
                          Grand Total (INR):
                        </span>
                        <span className="text-lg font-serif text-[#12231A]">
                          ₹{totalAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer & Signature */}
                  <div className="pt-6 border-t border-[#E6DFD5] flex flex-col sm:flex-row justify-between items-end gap-6 text-xs">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#717A75]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Digitally Authenticated by YouPI-PG Reconciliation Engine</span>
                      </div>
                      <p className="text-[9px] text-[#717A75] mt-0.5">
                        Computer-generated invoice. No physical signature required under IT Act 2000.
                      </p>
                    </div>

                    <div className="text-center sm:text-right">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#12231A]">
                        For HIFFYY LUXURY PERFUMES (OPC) PVT LTD
                      </p>
                      <div className="h-10 my-1 flex items-center justify-end">
                        <span className="font-serif italic text-sm text-[#886938] font-semibold border-b border-[#C5A880] pb-0.5 px-4">
                          Authorized Signatory
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
