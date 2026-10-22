import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { SalesChannel } from '../../types';
import {
  Globe2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Key,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Percent,
} from 'lucide-react';

export const OmnichannelMarketplaces: React.FC = () => {
  const { salesChannels, updateSalesChannel, triggerChannelSync, warehouses } = useStore();
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<SalesChannel | null>(null);

  const handleSync = async (id: string) => {
    setSyncingId(id);
    await triggerChannelSync(id);
    setSyncingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#12231A]">
            Omnichannel Marketplace Directory
          </h2>
          <p className="text-xs text-[#717A75]">
            Unified order import, stock synchronization, and fee attribution for Amazon, Flipkart, Meesho, and DTC
          </p>
        </div>
      </div>

      {/* Grid of Channels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {salesChannels.map((channel) => {
          const isSyncing = syncingId === channel.id;
          return (
            <div
              key={channel.id}
              className="bg-white border border-[#E6DFD5] p-5 rounded-sm shadow-sm flex flex-col justify-between hover:border-[#C5A880] transition-colors"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#12231A] text-[#DFCAAB] flex items-center justify-center font-bold text-xs uppercase">
                      {channel.name[0]}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#12231A] leading-tight">
                        {channel.name}
                      </h4>
                      <span className="text-[10px] text-[#717A75] font-mono">
                        Seller ID: {channel.sellerId}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-sm ${
                      channel.status === 'active'
                        ? 'bg-emerald-50 text-emerald-800'
                        : channel.status === 'pending_setup'
                        ? 'bg-amber-50 text-amber-800'
                        : 'bg-red-50 text-red-800'
                    }`}
                  >
                    {channel.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 my-4 p-3 bg-[#FAF8F5] border border-[#E6DFD5] rounded-sm text-xs">
                  <div>
                    <span className="text-[10px] text-[#717A75] block uppercase font-medium">Gross GMV</span>
                    <span className="font-bold text-[#12231A]">
                      ₹{(channel.totalGrossSales ?? 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#717A75] block uppercase font-medium">Orders</span>
                    <span className="font-bold text-[#12231A]">{channel.totalOrders ?? 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#717A75] block uppercase font-medium">Commission Rate</span>
                    <span className="font-mono text-[#886938] font-semibold">{channel.commissionRate ?? 0}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#717A75] block uppercase font-medium">Ad Spend</span>
                    <span className="font-mono text-[#717A75]">₹{(channel.adSpend ?? 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Status info */}
                <div className="space-y-1 text-xs text-[#717A75] mb-4">
                  <div className="flex justify-between text-[11px]">
                    <span>Depot Mapping:</span>
                    <span className="font-semibold text-[#12231A]">{channel.warehouseMapping}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Last Sync:</span>
                    <span className="font-mono text-[#12231A]">{channel.lastSyncAt || 'Never'}</span>
                  </div>
                  {channel.lastError && (
                    <p className="text-[10px] text-amber-700 bg-amber-50 p-1.5 rounded-sm mt-1">
                      {channel.lastError}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-[#F4EFE6] flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedChannel(channel)}
                  className="px-3 py-1.5 bg-[#FAF8F5] border border-[#E6DFD5] text-[#12231A] hover:border-[#12231A] text-xs font-semibold rounded-sm cursor-pointer"
                >
                  Configure Adapter
                </button>

                <button
                  disabled={isSyncing || channel.status === 'pending_setup'}
                  onClick={() => handleSync(channel.id)}
                  className="px-3 py-1.5 bg-[#12231A] text-[#DFCAAB] text-xs font-semibold rounded-sm hover:bg-[#182F23] disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Stock'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Configuration Modal */}
      {selectedChannel && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white p-6 rounded-sm border border-[#E6DFD5] shadow-2xl">
            <h3 className="text-base font-serif font-bold text-[#12231A] mb-1">
              Configure {selectedChannel.name} Adapter
            </h3>
            <p className="text-xs text-[#717A75] mb-4">
              Manage API credentials, inventory reservation rules, and commission schedules.
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#717A75] uppercase mb-1">
                  Seller Merchant Identifier
                </label>
                <input
                  type="text"
                  value={selectedChannel.sellerId}
                  onChange={(e) =>
                    setSelectedChannel({ ...selectedChannel, sellerId: e.target.value })
                  }
                  className="w-full p-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#717A75] uppercase mb-1">
                  Default Warehouse Stock Depletion Mapping
                </label>
                <select
                  value={selectedChannel.warehouseMapping}
                  onChange={(e) =>
                    setSelectedChannel({ ...selectedChannel, warehouseMapping: e.target.value })
                  }
                  className="w-full p-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs"
                >
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.name}>
                      {wh.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#717A75] uppercase mb-1">
                  Marketplace Category Commission Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={selectedChannel.commissionRate}
                  onChange={(e) =>
                    setSelectedChannel({ ...selectedChannel, commissionRate: Number(e.target.value) })
                  }
                  className="w-full p-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs font-mono"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-[#E6DFD5]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedChannel.syncInventory}
                    onChange={(e) =>
                      setSelectedChannel({ ...selectedChannel, syncInventory: e.target.checked })
                    }
                  />
                  <span>Automatically broadcast available inventory to channel every 15 minutes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedChannel.syncOrders}
                    onChange={(e) =>
                      setSelectedChannel({ ...selectedChannel, syncOrders: e.target.checked })
                    }
                  />
                  <span>Automatically import marketplace orders into central fulfillment ledger</span>
                </label>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t flex justify-end gap-2">
              <button onClick={() => setSelectedChannel(null)} className="px-4 py-2 border text-xs">
                Cancel
              </button>
              <button
                onClick={() => {
                  updateSalesChannel(selectedChannel.id, selectedChannel);
                  setSelectedChannel(null);
                }}
                className="px-4 py-2 bg-[#12231A] text-[#DFCAAB] text-xs font-bold uppercase"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
