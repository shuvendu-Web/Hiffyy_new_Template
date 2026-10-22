import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Layers, ArrowRightLeft, Plus, AlertCircle, History, Warehouse } from 'lucide-react';

export const InventoryLedgerManager: React.FC = () => {
  const { products, warehouses, recordStockMovement, user, setAdminTab } = useStore();
  const [selectedSku, setSelectedSku] = useState(products[0]?.sku || '');
  const [delta, setDelta] = useState(10);
  const [reason, setReason] = useState('Stocktake adjustment');
  const [selectedWarehouse, setSelectedWarehouse] = useState(warehouses[0]?.name || 'Mumbai Central Hub (HQ)');
  const [actionType, setActionType] = useState<'adjustment' | 'restock' | 'damage'>('adjustment');
  const [feedback, setFeedback] = useState('');

  const handleAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSku || !reason) return;

    const actualDelta = actionType === 'damage' ? -Math.abs(delta) : delta;
    recordStockMovement(
      selectedSku,
      actualDelta,
      actionType === 'damage' ? 'damage' : actionType === 'restock' ? 'restock' : 'adjustment',
      reason,
      selectedWarehouse,
      user?.displayName || 'Administrator'
    );

    setFeedback(`Recorded ${actualDelta > 0 ? `+${actualDelta}` : actualDelta} units for SKU ${selectedSku} at ${selectedWarehouse}`);
    setTimeout(() => setFeedback(''), 4000);
  };

  const totalOnHandUnits = products.reduce((sum, p) => sum + p.stockOnHand, 0);
  const totalValuation = products.reduce((sum, p) => sum + p.stockOnHand * p.costPrice, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#12231A]">Omnichannel Inventory Ledger</h2>
          <p className="text-xs text-[#717A75]">
            Real-time stock ledger across all fulfillment depots with transactional traceability
          </p>
        </div>

        <button
          onClick={() => setAdminTab('movements')}
          className="px-4 py-2 bg-white border border-[#E6DFD5] text-[#12231A] text-xs font-semibold hover:border-[#C5A880] flex items-center gap-1.5 cursor-pointer"
        >
          <History className="w-4 h-4 text-[#C5A880]" />
          <span>Audit Trail History</span>
        </button>
      </div>

      {/* Warehouses Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {warehouses.map((wh) => (
          <div key={wh.id} className="p-4 bg-white border border-[#E6DFD5] rounded-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#12231A]">{wh.name}</span>
              {wh.isPrimary && (
                <span className="px-2 py-0.5 bg-[#12231A] text-[#DFCAAB] text-[9px] uppercase font-bold">
                  Primary
                </span>
              )}
            </div>
            <span className="text-[11px] text-[#717A75] block">Location: {wh.city}</span>
            <span className="text-[11px] text-[#717A75] block">Supervisor: {wh.contactPerson}</span>
            <span className="text-[11px] text-[#886938] font-mono block mt-2">
              Active Stock SKUs: {wh.totalSkus}
            </span>
          </div>
        ))}
      </div>

      {/* Valuation Bar */}
      <div className="p-4 bg-[#12231A] text-[#FAF8F5] rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-[10px] text-[#C5A880] uppercase tracking-wider block">Total Physical Units</span>
            <span className="text-xl font-serif font-bold">{totalOnHandUnits} Flacons</span>
          </div>
          <div>
            <span className="text-[10px] text-[#C5A880] uppercase tracking-wider block">Total Inventory Valuation (At Cost)</span>
            <span className="text-xl font-serif font-bold">₹{totalValuation.toLocaleString('en-IN')}</span>
          </div>
        </div>
        <span className="text-[11px] text-[#DFCAAB]/80">Available = On-Hand - Committed Reserves</span>
      </div>

      {/* Stock Adjustment Form */}
      <div className="bg-white border border-[#E6DFD5] p-6 rounded-sm shadow-sm">
        <h3 className="text-sm font-serif font-bold text-[#12231A] uppercase tracking-wider mb-2">
          Post Stock Adjustment / Receipt
        </h3>
        <p className="text-xs text-[#717A75] mb-4">
          All stock modifications require a mandatory reason and are written immediately to the immutable movement log.
        </p>

        <form onSubmit={handleAdjust} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] text-[#717A75] font-semibold mb-1 uppercase">Select SKU</label>
            <select
              value={selectedSku}
              onChange={(e) => setSelectedSku(e.target.value)}
              className="w-full p-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs focus:outline-none"
            >
              {products.map((p) => (
                <option key={p.id} value={p.sku}>
                  {p.sku} - {p.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-[#717A75] font-semibold mb-1 uppercase">Depot Location</label>
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="w-full p-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs focus:outline-none"
            >
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.name}>
                  {wh.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-[#717A75] font-semibold mb-1 uppercase">Adjustment Type</label>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value as 'adjustment' | 'restock' | 'damage')}
              className="w-full p-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs focus:outline-none"
            >
              <option value="adjustment">Stock Adjustment (Audit Discrepancy)</option>
              <option value="restock">Stock Receipt (New Batch Inward)</option>
              <option value="damage">Damaged / Broken Flacon Quarantine</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-[#717A75] font-semibold mb-1 uppercase">Delta Units</label>
            <input
              type="number"
              required
              value={delta}
              onChange={(e) => setDelta(Number(e.target.value))}
              className="w-full p-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs focus:outline-none font-bold"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-[11px] text-[#717A75] font-semibold mb-1 uppercase">
              Mandatory Audit Reason *
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Received Batch 2026-Q1 from Kannauj distillery"
              className="w-full p-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 px-4 bg-[#12231A] text-[#DFCAAB] text-xs uppercase tracking-wider font-bold hover:bg-[#182F23] cursor-pointer"
            >
              Record in Ledger
            </button>
          </div>
        </form>

        {feedback && (
          <p className="text-xs text-emerald-800 font-medium mt-3 bg-emerald-50 p-2 rounded-sm">
            {feedback}
          </p>
        )}
      </div>

      {/* Stock Levels by SKU */}
      <div className="bg-white border border-[#E6DFD5] rounded-sm shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E6DFD5] flex items-center justify-between">
          <h3 className="text-xs uppercase font-bold text-[#12231A] tracking-wider">
            Live Central Stock Registry by SKU
          </h3>
          <span className="text-[11px] text-[#717A75]">Updated in real-time with customer orders</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF8F5] text-[#717A75] uppercase text-[10px] tracking-wider border-b border-[#E6DFD5]">
              <tr>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Perfume Name</th>
                <th className="py-3 px-4">On-Hand</th>
                <th className="py-3 px-4">Reserved</th>
                <th className="py-3 px-4">Available for Sale</th>
                <th className="py-3 px-4">Reorder Threshold</th>
                <th className="py-3 px-4">Health Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EFE6]">
              {products.map((p) => {
                const isLow = p.stockOnHand <= p.reorderThreshold;
                return (
                  <tr key={p.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#12231A]">{p.sku}</td>
                    <td className="py-3 px-4 font-medium text-[#12231A]">{p.title}</td>
                    <td className="py-3 px-4 font-bold">{p.stockOnHand}</td>
                    <td className="py-3 px-4 text-[#717A75] font-mono">{p.stockReserved}</td>
                    <td className="py-3 px-4 font-bold text-emerald-900">{p.availableStock}</td>
                    <td className="py-3 px-4 text-[#717A75] font-mono">{p.reorderThreshold}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-sm ${
                          isLow ? 'bg-red-50 text-red-800' : 'bg-emerald-50 text-emerald-800'
                        }`}
                      >
                        {isLow ? 'Critical Low Stock' : 'Optimal'}
                      </span>
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
