import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  Globe2,
  Package,
  Layers,
  Sparkles,
} from 'lucide-react';

export const OverviewDashboard: React.FC = () => {
  const { orders, products, salesChannels, setAdminTab } = useStore();

  const totalGrossSales = orders.reduce((sum, o) => sum + o.total, 0);
  const totalTax = orders.reduce((sum, o) => sum + o.tax, 0);
  const totalDiscounts = orders.reduce((sum, o) => sum + o.discount, 0);
  const netSales = totalGrossSales - totalTax;

  // Estimated COGS (Cost of goods sold)
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

  const estimatedGrossProfit = netSales - totalCogs;
  const grossMarginPercent = netSales > 0 ? Math.round((estimatedGrossProfit / netSales) * 100) : 0;

  const lowStockProducts = products.filter((p) => p.stockOnHand <= p.reorderThreshold);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-[#12231A] text-[#FAF8F5] p-6 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#182F23]">
        <div>
          <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-[#C5A880] block mb-1">
            HIFFYY COMMERCE OS • REAL-TIME AUDIT
          </span>
          <h2 className="text-2xl font-serif font-light text-white">
            Omnichannel Fragrance Performance
          </h2>
          <p className="text-xs text-[#DFCAAB]/80 mt-1">
            Consolidated data across DTC Website, Mumbai Flagship POS, Amazon SP-API, and Flipkart Commerce.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAdminTab('ai-studio')}
            className="px-4 py-2 bg-[#C5A880] text-[#12231A] text-xs font-bold uppercase tracking-wider hover:bg-[#DFCAAB] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Image Studio</span>
          </button>
          <button
            onClick={() => setAdminTab('orders')}
            className="px-4 py-2 bg-[#182F23] border border-[#C5A880]/50 text-[#DFCAAB] text-xs font-bold uppercase tracking-wider hover:bg-[#12231A] cursor-pointer"
          >
            Manage Orders
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 border border-[#E6DFD5] rounded-sm shadow-sm">
          <div className="flex items-center justify-between text-[#717A75] mb-2">
            <span className="text-xs uppercase font-medium">Gross Revenue (Consolidated)</span>
            <DollarSign className="w-4 h-4 text-[#886938]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#12231A]">
            ₹{totalGrossSales.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-800 flex items-center gap-1 mt-1 font-medium">
            <TrendingUp className="w-3 h-3" />
            +18.4% vs previous 30 days
          </span>
        </div>

        <div className="bg-white p-5 border border-[#E6DFD5] rounded-sm shadow-sm">
          <div className="flex items-center justify-between text-[#717A75] mb-2">
            <span className="text-xs uppercase font-medium">Net Sales (Excl. 18% GST)</span>
            <Package className="w-4 h-4 text-[#886938]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#12231A]">
            ₹{netSales.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-[#717A75] mt-1 block">
            GST Collected: ₹{totalTax.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="bg-white p-5 border border-[#E6DFD5] rounded-sm shadow-sm">
          <div className="flex items-center justify-between text-[#717A75] mb-2">
            <span className="text-xs uppercase font-medium">Estimated Gross Margin</span>
            <TrendingUp className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-serif font-bold text-emerald-800">
            {grossMarginPercent}%
          </div>
          <span className="text-[11px] text-[#717A75] mt-1 block">
            COGS: ₹{totalCogs.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="bg-white p-5 border border-[#E6DFD5] rounded-sm shadow-sm">
          <div className="flex items-center justify-between text-[#717A75] mb-2">
            <span className="text-xs uppercase font-medium">Total Orders Fulfilled</span>
            <ShoppingBag className="w-4 h-4 text-[#886938]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#12231A]">
            {orders.length}
          </div>
          <span className="text-[11px] text-[#717A75] mt-1 block">
            Avg Order Value: ₹{Math.round(totalGrossSales / (orders.length || 1)).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Channel Breakdown & Low Stock Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Channel Breakdown */}
        <div className="lg:col-span-2 bg-white border border-[#E6DFD5] p-6 rounded-sm shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-serif font-bold text-[#12231A]">
                Omnichannel Sales Breakdown
              </h3>
              <p className="text-xs text-[#717A75]">Real-time synchronized sales channels</p>
            </div>
            <button
              onClick={() => setAdminTab('channels')}
              className="text-xs text-[#886938] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <span>Manage Channels</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {salesChannels.map((channel) => {
              const channelOrders = orders.filter((o) => o.channel === channel.type);
              const channelRevenue = channelOrders.reduce((sum, o) => sum + o.total, 0);
              return (
                <div
                  key={channel.id}
                  className="p-4 bg-[#FAF8F5] border border-[#E6DFD5] rounded-sm flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#12231A] text-[#DFCAAB] flex items-center justify-center font-bold text-xs uppercase">
                      {channel.name[0]}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#12231A]">{channel.name}</h4>
                      <p className="text-[11px] text-[#717A75]">
                        Warehouse: {channel.warehouseMapping} • Status:{' '}
                        <span
                          className={`font-semibold ${
                            channel.status === 'active' ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {channel.status}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-bold text-[#12231A]">
                      ₹{channelRevenue.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-[#717A75] block">
                      {channelOrders.length} Orders
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white border border-[#E6DFD5] p-6 rounded-sm shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-serif font-bold text-[#12231A] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Inventory Alerts</span>
              </h3>
              <span className="px-2 py-0.5 bg-amber-50 text-amber-800 text-[10px] font-bold rounded-full">
                {lowStockProducts.length} Needs Restock
              </span>
            </div>

            <p className="text-xs text-[#717A75] mb-4">
              Flacons approaching reorder threshold across storage locations.
            </p>

            <div className="space-y-3">
              {lowStockProducts.length === 0 ? (
                <p className="text-xs text-emerald-800 bg-emerald-50 p-3 rounded-sm">
                  All fragrance SKUs are healthy above threshold!
                </p>
              ) : (
                lowStockProducts.map((p) => (
                  <div key={p.id} className="p-3 bg-amber-50/50 border border-amber-200 rounded-sm">
                    <div className="flex justify-between text-xs font-bold text-[#12231A]">
                      <span>{p.title}</span>
                      <span className="text-red-700">{p.stockOnHand} Units Left</span>
                    </div>
                    <span className="text-[10px] text-[#717A75] block mt-1">
                      Threshold: {p.reorderThreshold} Units • SKU: {p.sku}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => setAdminTab('inventory')}
            className="w-full mt-6 py-2.5 px-4 bg-[#12231A] text-[#DFCAAB] text-xs uppercase tracking-wider font-semibold hover:bg-[#182F23] cursor-pointer"
          >
            Open Multi-Warehouse Ledger
          </button>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white border border-[#E6DFD5] p-6 rounded-sm shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-serif font-bold text-[#12231A]">Recent Consolidated Orders</h3>
            <p className="text-xs text-[#717A75]">Latest transactions across online store, POS and marketplaces</p>
          </div>
          <button
            onClick={() => setAdminTab('orders')}
            className="text-xs text-[#886938] hover:underline font-semibold cursor-pointer"
          >
            View All Orders &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF8F5] text-[#717A75] uppercase text-[10px] tracking-wider border-b border-[#E6DFD5]">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Patron</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EFE6]">
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#12231A]">{order.orderNumber}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-[#F4EFE6] text-[#12231A] uppercase font-semibold text-[10px] rounded-sm">
                      {order.channel}
                    </span>
                  </td>
                  <td className="py-3 px-4">{order.customer.name}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded-sm ${
                        order.status === 'delivered'
                          ? 'bg-emerald-50 text-emerald-800'
                          : order.status === 'shipped'
                          ? 'bg-blue-50 text-blue-800'
                          : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-[#717A75]">{order.paymentMethod}</span>
                  </td>
                  <td className="py-3 px-4 font-bold text-[#12231A]">
                    ₹{order.total.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
