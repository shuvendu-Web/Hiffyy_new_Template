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
} from 'lucide-react';

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

interface YoupiTransaction {
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
  createdAt: string;
  verifiedAt?: string;
}

export const YoupiGatewayManager: React.FC = () => {
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

  const totalCollected = transactions
    .filter((t) => t.status === 'VERIFIED')
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
                  <th className="p-3">Payee UPI VPA</th>
                  <th className="p-3">12-Digit UTR</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DFD5]">
                {transactions.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-[#FAF8F5]/60 transition-colors">
                    <td className="p-3 font-mono font-bold text-[#12231A]">{tx.orderId}</td>
                    <td className="p-3">
                      <div className="font-semibold text-[#12231A]">{tx.customerName || 'Store Patron'}</div>
                      <div className="text-[10px] text-[#717A75]">{tx.customerPhone || '—'}</div>
                    </td>
                    <td className="p-3 font-bold text-[#12231A]">₹{tx.amount.toLocaleString('en-IN')}</td>
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
                          tx.status === 'VERIFIED' || tx.status === 'PAID'
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
