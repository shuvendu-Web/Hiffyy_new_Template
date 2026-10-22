import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus } from '../../types';
import {
  Search,
  SlidersHorizontal,
  FileText,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Printer,
  X,
  Eye,
} from 'lucide-react';

export const OrderManager: React.FC = () => {
  const { orders, updateOrderStatus } = useStore();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Status transition note
  const [statusNote, setStatusNote] = useState('');
  const [newStatus, setNewStatus] = useState<OrderStatus>('processing');

  const filteredOrders = orders.filter((o) => {
    if (channelFilter !== 'all' && o.channel !== channelFilter) return false;
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.phone.toLowerCase().includes(q) ||
        o.shippingAddress.city.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleUpdateStatus = () => {
    if (!selectedOrder) return;
    updateOrderStatus(selectedOrder.id, newStatus, statusNote || `Status updated to ${newStatus}`);
    setSelectedOrder((prev) =>
      prev
        ? {
            ...prev,
            status: newStatus,
            timeline: [
              ...prev.timeline,
              {
                status: newStatus,
                timestamp: new Date().toISOString(),
                note: statusNote || `Status updated to ${newStatus}`,
              },
            ],
          }
        : null
    );
    setStatusNote('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#12231A]">Unified Order Management</h2>
          <p className="text-xs text-[#717A75]">
            Consolidated processing for online DTC store, physical retail POS, Amazon, Flipkart, and Meesho
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 border border-[#E6DFD5] rounded-sm shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#717A75]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID, Patron Name, Phone or City..."
            className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs focus:outline-none focus:border-[#C5A880]"
          />
        </div>

        {/* Channel Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#717A75]">Channel:</span>
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="p-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs rounded-sm focus:outline-none"
          >
            <option value="all">All Channels</option>
            <option value="website">DTC Website</option>
            <option value="pos">Retail POS Store</option>
            <option value="amazon">Amazon SP-API</option>
            <option value="flipkart">Flipkart Commerce</option>
            <option value="meesho">Meesho Hub</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#717A75]">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs rounded-sm focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending_payment">Pending Payment</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#E6DFD5] rounded-sm shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF8F5] text-[#717A75] uppercase text-[10px] tracking-wider border-b border-[#E6DFD5]">
              <tr>
                <th className="py-3 px-4">Order Number</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Patron Details</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EFE6]">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#12231A]">
                    {order.orderNumber}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-[#F4EFE6] text-[#12231A] font-semibold text-[10px] uppercase rounded-sm">
                      {order.channel}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#717A75]">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-[#12231A]">{order.customer.name}</div>
                    <div className="text-[10px] text-[#717A75] font-mono">{order.customer.phone}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-sm ${
                        order.status === 'delivered'
                          ? 'bg-emerald-50 text-emerald-800'
                          : order.status === 'shipped'
                          ? 'bg-blue-50 text-blue-800'
                          : order.status === 'cancelled'
                          ? 'bg-red-50 text-red-800'
                          : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#717A75]">
                    {order.items.reduce((s, i) => s + i.quantity, 0)} Flacons
                  </td>
                  <td className="py-3 px-4 font-bold text-[#12231A]">
                    ₹{order.total.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setNewStatus(order.status);
                      }}
                      className="px-2.5 py-1 bg-[#FAF8F5] border border-[#12231A] text-[#12231A] hover:bg-[#12231A] hover:text-[#DFCAAB] text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      Inspect / Fulfill
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Inspection Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-[#12231A]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-[#FAF8F5] border border-[#E6DFD5] shadow-2xl rounded-sm p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-[#717A75] hover:text-[#12231A] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E6DFD5] gap-3">
              <div>
                <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#886938] block">
                  Consignment #{selectedOrder.orderNumber}
                </span>
                <h3 className="text-xl font-serif font-bold text-[#12231A]">
                  Order Details & Fulfillment
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-white border border-[#E6DFD5] text-[#12231A] text-xs flex items-center gap-1.5 hover:border-[#C5A880] cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Tax Invoice</span>
                </button>
              </div>
            </div>

            {/* Order Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
              {/* Patron Info */}
              <div className="p-4 bg-white border border-[#E6DFD5] rounded-sm space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#717A75] block">
                  Patron & Shipping Destination
                </span>
                <div className="text-xs font-bold text-[#12231A]">{selectedOrder.customer.name}</div>
                <div className="text-xs text-[#717A75]">
                  {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city},{' '}
                  {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pinCode}
                </div>
                <div className="text-xs text-[#717A75] font-mono">
                  Phone: {selectedOrder.customer.phone}
                </div>
                <div className="text-xs text-[#717A75]">Email: {selectedOrder.customer.email}</div>
              </div>

              {/* Payment & Carrier Info */}
              <div className="p-4 bg-white border border-[#E6DFD5] rounded-sm space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#717A75] block">
                  Logistics & Payment Record
                </span>
                <div className="flex justify-between text-xs">
                  <span className="text-[#717A75]">Channel:</span>
                  <span className="font-semibold uppercase">{selectedOrder.channel}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#717A75]">Payment Method:</span>
                  <span className="font-semibold">{selectedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#717A75]">Payment Status:</span>
                  <span className="font-bold text-emerald-800 uppercase">
                    {selectedOrder.paymentStatus}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#717A75]">AWB / Tracking:</span>
                  <span className="font-mono text-[#886938]">
                    {selectedOrder.trackingNumber || 'Pending Generation'}
                  </span>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="bg-white border border-[#E6DFD5] p-4 rounded-sm mb-6">
              <span className="text-[10px] uppercase font-bold text-[#717A75] block mb-3">
                Ordered Fragrance Line Items
              </span>
              <div className="space-y-3">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-[#F4EFE6] last:border-0">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt="" className="w-10 h-12 object-cover rounded-sm border" />
                      <div>
                        <div className="font-semibold text-[#12231A]">{item.title}</div>
                        <div className="text-[10px] text-[#717A75]">
                          Size: {item.variantSize} • SKU: {item.sku}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[#717A75]">{item.quantity} x ₹{item.unitPrice} = </span>
                      <span className="font-bold text-[#12231A]">₹{item.subtotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Calculation */}
              <div className="mt-4 pt-3 border-t border-[#E6DFD5] flex justify-between items-center text-xs">
                <span className="font-medium text-[#717A75]">
                  Subtotal: ₹{selectedOrder.subtotal} | 18% GST: ₹{selectedOrder.tax}
                </span>
                <span className="text-sm font-bold text-[#12231A]">
                  Grand Total: ₹{selectedOrder.total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Status Transition & Audit Control */}
            <div className="p-4 bg-[#F4EFE6] border border-[#E6DFD5] rounded-sm">
              <span className="text-[10px] uppercase font-bold text-[#12231A] block mb-2">
                Fulfillment Workflow Action
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="p-2 bg-white border border-[#E6DFD5] text-xs font-semibold focus:outline-none"
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="packed">Packed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>

                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Audit reason (e.g. Dispatched via Delhivery)"
                  className="sm:col-span-2 p-2 bg-white border border-[#E6DFD5] text-xs focus:outline-none"
                >
                </input>
              </div>

              <button
                onClick={handleUpdateStatus}
                className="w-full py-2.5 bg-[#12231A] text-[#DFCAAB] text-xs uppercase tracking-wider font-bold hover:bg-[#182F23] cursor-pointer"
              >
                Apply Status Transition & Record in Audit Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
