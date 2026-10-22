import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { History, Search, ArrowDownRight, ArrowUpRight, ShieldCheck } from 'lucide-react';

export const StockMovementsManager: React.FC = () => {
  const { stockMovements } = useStore();
  const [search, setSearch] = useState('');

  const filtered = stockMovements.filter(
    (m) =>
      m.sku.toLowerCase().includes(search.toLowerCase()) ||
      m.productTitle.toLowerCase().includes(search.toLowerCase()) ||
      m.reason.toLowerCase().includes(search.toLowerCase()) ||
      m.performedBy.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#12231A]">
            Immutable Stock Movement Log
          </h2>
          <p className="text-xs text-[#717A75]">
            Append-only audit trail guaranteeing end-to-end traceability of every flacon across warehouses
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 border border-emerald-200 rounded-sm">
          <ShieldCheck className="w-4 h-4" />
          <span>Tamper-evident Audit Ledger Active</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 border border-[#E6DFD5] rounded-sm flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#717A75]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by SKU, product name, staff or reason..."
            className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs focus:outline-none focus:border-[#C5A880]"
          />
        </div>
        <span className="text-xs text-[#717A75] font-mono">{filtered.length} Audit Entries</span>
      </div>

      {/* Movements Table */}
      <div className="bg-white border border-[#E6DFD5] rounded-sm shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF8F5] text-[#717A75] uppercase text-[10px] tracking-wider border-b border-[#E6DFD5]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">SKU / Product</th>
                <th className="py-3 px-4">Delta Units</th>
                <th className="py-3 px-4">Warehouse</th>
                <th className="py-3 px-4">Reason / Reference</th>
                <th className="py-3 px-4">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EFE6]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                  <td className="py-3 px-4 font-mono text-[#717A75]">
                    {new Date(item.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-sm ${
                        item.type === 'restock'
                          ? 'bg-emerald-50 text-emerald-800'
                          : item.type === 'sale'
                          ? 'bg-blue-50 text-blue-800'
                          : item.type === 'damage'
                          ? 'bg-red-50 text-red-800'
                          : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-[#12231A] block">{item.sku}</span>
                    <span className="text-[10px] text-[#717A75]">{item.productTitle}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-mono font-bold flex items-center gap-1 ${
                        item.delta > 0 ? 'text-emerald-700' : 'text-red-700'
                      }`}
                    >
                      {item.delta > 0 ? (
                        <>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span>+{item.delta}</span>
                        </>
                      ) : (
                        <>
                          <ArrowDownRight className="w-3.5 h-3.5" />
                          <span>{item.delta}</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#717A75]">{item.warehouseId}</td>
                  <td className="py-3 px-4">
                    <span className="text-[#12231A]">{item.reason}</span>
                    {item.referenceId && (
                      <span className="block font-mono text-[10px] text-[#886938]">
                        Ref: {item.referenceId}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-medium text-[#717A75]">{item.performedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
