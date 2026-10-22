import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Download,
  Calendar,
  Layers,
  Percent,
} from 'lucide-react';

export const AnalyticsProfitability: React.FC = () => {
  const { orders, products, salesChannels } = useStore();
  const [dateRange, setDateRange] = useState<'30d' | '90d' | 'all'>('30d');

  // Math
  const grossSales = orders.reduce((sum, o) => sum + o.total, 0);
  const totalTax = orders.reduce((sum, o) => sum + o.tax, 0);
  const totalDiscounts = orders.reduce((sum, o) => sum + o.discount, 0);
  const netSales = grossSales - totalTax;

  const totalCogs = orders.reduce((sum, o) => {
    return (
      sum +
      o.items.reduce((itemSum, item) => {
        const prod = products.find((p) => p.id === item.productId);
        const cost = prod ? prod.costPrice : item.unitPrice * 0.3;
        return itemSum + cost * item.quantity;
      }, 0)
    );
  }, 0);

  const totalMarketplaceFees = salesChannels.reduce((sum, ch) => {
    const chOrders = orders.filter((o) => o.channel === ch.type);
    const chTotal = chOrders.reduce((s, o) => s + o.total, 0);
    return sum + (chTotal * ch.commissionRate) / 100;
  }, 0);

  const totalAdSpend = salesChannels.reduce((sum, ch) => sum + ch.adSpend, 0);
  const grossProfit = netSales - totalCogs;
  const contributionMargin = grossProfit - totalMarketplaceFees - totalAdSpend;
  const contributionMarginPercent = netSales > 0 ? Math.round((contributionMargin / netSales) * 100) : 0;

  const inventoryValuation = products.reduce((sum, p) => sum + p.stockOnHand * p.costPrice, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#12231A]">
            Financials, Channel Profitability & Unit Economics
          </h2>
          <p className="text-xs text-[#717A75]">
            Granular breakdown distinguishing Gross Sales, Cash Collected, COGS, and Contribution Margin
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white border border-[#E6DFD5] p-1 rounded-sm text-xs">
            <Calendar className="w-3.5 h-3.5 text-[#717A75]" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as '30d' | '90d' | 'all')}
              className="bg-transparent text-xs focus:outline-none"
            >
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="all">Year-to-Date (All-Time)</option>
            </select>
          </div>

          <button
            onClick={() => {
              const csvContent = `Channel,Gross GMV,Orders,Commission Rate\n${salesChannels
                .map((c) => `${c.name},${c.totalGrossSales},${c.totalOrders},${c.commissionRate}%`)
                .join('\n')}`;
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `hiffyy_profitability_audit.csv`;
              a.click();
            }}
            className="px-4 py-2 bg-white border border-[#E6DFD5] text-[#12231A] text-xs font-semibold hover:border-[#12231A] flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Financial Flow Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 border border-[#E6DFD5] rounded-sm shadow-sm">
          <span className="text-[10px] uppercase font-bold text-[#717A75] block mb-1">
            Gross Sales (Tendered)
          </span>
          <div className="text-2xl font-serif font-bold text-[#12231A]">
            ₹{grossSales.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-[#717A75] block mt-1">Includes 18% GST collected</span>
        </div>

        <div className="bg-white p-5 border border-[#E6DFD5] rounded-sm shadow-sm">
          <span className="text-[10px] uppercase font-bold text-[#717A75] block mb-1">
            Product Cost of Goods (COGS)
          </span>
          <div className="text-2xl font-serif font-bold text-red-800">
            ₹{totalCogs.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-[#717A75] block mt-1">
            Raw botanicals, flacons, packaging
          </span>
        </div>

        <div className="bg-white p-5 border border-[#E6DFD5] rounded-sm shadow-sm">
          <span className="text-[10px] uppercase font-bold text-[#717A75] block mb-1">
            Marketplace Fees & Gateway
          </span>
          <div className="text-2xl font-serif font-bold text-amber-800">
            ₹{Math.round(totalMarketplaceFees).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-[#717A75] block mt-1">Amazon/Flipkart commissions</span>
        </div>

        <div className="bg-white p-5 border border-[#E6DFD5] rounded-sm shadow-sm">
          <span className="text-[10px] uppercase font-bold text-[#717A75] block mb-1">
            Est. Contribution Margin
          </span>
          <div className="text-2xl font-serif font-bold text-emerald-800">
            ₹{Math.round(contributionMargin).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-800 font-bold block mt-1">
            {contributionMarginPercent}% Net Contribution
          </span>
        </div>
      </div>

      {/* Waterfall & Channel Profitability Breakdown */}
      <div className="bg-white border border-[#E6DFD5] rounded-sm shadow-sm p-6">
        <h3 className="text-sm font-serif font-bold text-[#12231A] uppercase tracking-wider mb-4">
          Omnichannel Channel Profitability Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF8F5] text-[#717A75] uppercase text-[10px] tracking-wider border-b border-[#E6DFD5]">
              <tr>
                <th className="py-3 px-4">Sales Channel</th>
                <th className="py-3 px-4">Orders</th>
                <th className="py-3 px-4">Gross Revenue</th>
                <th className="py-3 px-4">Commission %</th>
                <th className="py-3 px-4">Estimated Fees</th>
                <th className="py-3 px-4">Attributed Ad Spend</th>
                <th className="py-3 px-4">Net Contribution Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EFE6]">
              {salesChannels.map((ch) => {
                const chOrders = orders.filter((o) => o.channel === ch.type);
                const chGross = chOrders.reduce((s, o) => s + o.total, 0);
                const fees = (chGross * ch.commissionRate) / 100;
                const estCogs = chGross * 0.3; // 30% average COGS
                const adSpend = ch.adSpend ?? 0;
                const netMargin = chGross - fees - adSpend - estCogs;
                return (
                  <tr key={ch.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-[#12231A]">{ch.name}</td>
                    <td className="py-3 px-4 font-mono">{chOrders.length}</td>
                    <td className="py-3 px-4 font-bold">₹{chGross.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 font-mono text-[#886938]">{ch.commissionRate}%</td>
                    <td className="py-3 px-4 font-mono text-red-700">₹{Math.round(fees).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 font-mono text-[#717A75]">₹{adSpend.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 font-bold text-emerald-800">
                      ₹{Math.round(netMargin).toLocaleString('en-IN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
