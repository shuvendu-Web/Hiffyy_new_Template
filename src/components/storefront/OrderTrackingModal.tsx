import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Search, Package, CheckCircle, Clock, Truck, MapPin } from 'lucide-react';
import { Order } from '../../types';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ isOpen, onClose }) => {
  const { orders } = useStore();
  const [searchId, setSearchId] = useState('');
  const [foundOrder, setFoundOrder] = useState<Order | null>(orders[0] || null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchId.trim().toUpperCase();
    if (!query) return;

    const matched = orders.find(
      (o) =>
        o.orderNumber.toUpperCase() === query ||
        o.trackingNumber?.toUpperCase() === query ||
        o.id.toUpperCase() === query ||
        o.customer.phone.includes(query)
    );

    if (matched) {
      setFoundOrder(matched);
      setError('');
    } else {
      setError(`No order found matching "${searchId}". Try "HIF-IN-9821".`);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return 'text-emerald-800 bg-emerald-50 border-emerald-200';
      case 'shipped':
        return 'text-blue-800 bg-blue-50 border-blue-200';
      case 'packed':
      case 'processing':
        return 'text-amber-800 bg-amber-50 border-amber-200';
      default:
        return 'text-gray-800 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#12231A]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#FAF8F5] border border-[#E6DFD5] shadow-2xl rounded-xl p-4 sm:p-5">
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 text-[#717A75] hover:text-[#12231A] cursor-pointer p-1"
        >
          <X className="w-4 h-4" />
        </button>

        <span className="text-[9px] tracking-[0.2em] uppercase font-bold text-[#886938] block mb-0.5">
          Live Dispatch & Transit System
        </span>
        <h3 className="text-lg font-serif font-bold text-[#12231A] mb-3">
          Track Your HIFFYY Consignment
        </h3>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#717A75]" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter Order ID (e.g. HIF-IN-9821) or Tracking No."
              className="w-full pl-8 pr-3 py-2 bg-white border border-[#E6DFD5] text-xs uppercase rounded focus:outline-none focus:border-[#96F816]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#12231A] text-[#96F816] text-xs font-semibold hover:bg-black cursor-pointer uppercase tracking-wider rounded"
          >
            Locate
          </button>
        </form>

        {error && <p className="text-xs text-red-700 mb-3">{error}</p>}

        {foundOrder && (
          <div className="bg-white border border-[#E6DFD5] p-3.5 rounded-lg space-y-4 text-xs">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F4EFE6] gap-2">
              <div>
                <span className="text-[10px] text-[#717A75] uppercase font-mono block">
                  Consignment #{foundOrder.orderNumber}
                </span>
                <h4 className="text-sm font-bold text-[#12231A]">{foundOrder.customer.name}</h4>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 text-xs uppercase tracking-wider font-semibold border rounded-sm ${getStatusColor(
                    foundOrder.status
                  )}`}
                >
                  {foundOrder.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Courier details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#FAF8F5] p-3 border border-[#E6DFD5]">
              <div>
                <span className="text-[10px] text-[#717A75] block uppercase">Courier</span>
                <span className="font-semibold text-[#12231A]">{foundOrder.carrier || 'Delhivery Express'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#717A75] block uppercase">AWB Number</span>
                <span className="font-mono text-[#886938]">{foundOrder.trackingNumber || 'Pending'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#717A75] block uppercase">City Destination</span>
                <span className="font-semibold text-[#12231A]">
                  {foundOrder.shippingAddress.city} ({foundOrder.shippingAddress.pinCode})
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#717A75] block uppercase">Channel</span>
                <span className="font-semibold uppercase text-[#12231A]">{foundOrder.channel}</span>
              </div>
            </div>

            {/* Items */}
            <div>
              <span className="text-[11px] font-semibold text-[#12231A] block mb-2">Flacons in Package:</span>
              <div className="space-y-2">
                {foundOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-[#F4EFE6] last:border-0">
                    <span className="text-[#12231A]">
                      {item.title} ({item.variantSize}) x {item.quantity}
                    </span>
                    <span className="font-mono text-[#717A75]">₹{item.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <span className="text-[11px] font-semibold text-[#12231A] block mb-3">Transit Milestones:</span>
              <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-[#E6DFD5]">
                {foundOrder.timeline.map((step, idx) => (
                  <div key={idx} className="relative flex items-start gap-4 pl-8">
                    <span className="absolute left-1.5 top-1 w-3.5 h-3.5 rounded-full bg-[#12231A] border-2 border-white" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase text-[#12231A]">{step.status}</span>
                        <span className="text-[10px] text-[#717A75] font-mono">
                          {new Date(step.timestamp).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-[#717A75] mt-0.5">{step.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
