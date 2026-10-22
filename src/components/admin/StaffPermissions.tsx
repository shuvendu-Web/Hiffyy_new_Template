import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Users, Shield, ShieldAlert, Plus, Check, Trash2, Key } from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'catalog_manager' | 'pos_cashier' | 'support_agent';
  permissions: string[];
}

export const StaffPermissions: React.FC = () => {
  const { user } = useStore();

  const [staffList, setStaffList] = useState<StaffMember[]>([
    {
      id: 'staff-1',
      name: 'Shuvendu Dhenki',
      email: 'shuvendu.dhenki@gmail.com',
      role: 'super_admin',
      permissions: ['ALL_PERMISSIONS', 'FINANCIAL_AUDIT', 'STOCK_ADJUSTMENT', 'PRICE_OVERRIDE'],
    },
    {
      id: 'staff-2',
      name: 'Aarav Varma',
      email: 'aarav.v@hiffyy.com',
      role: 'catalog_manager',
      permissions: ['PRODUCTS_WRITE', 'CMS_WRITE', 'MEDIA_WRITE'],
    },
    {
      id: 'staff-3',
      name: 'Simran Kaur',
      email: 'simran.k@hiffyy.com',
      role: 'pos_cashier',
      permissions: ['POS_TENDER', 'RECEIPT_PRINT'],
    },
    {
      id: 'staff-4',
      name: 'Rohan Deshmukh',
      email: 'rohan.d@hiffyy.com',
      role: 'support_agent',
      permissions: ['ORDER_VIEW', 'RAG_KB_VIEW'],
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<StaffMember['role']>('catalog_manager');

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const newStaff: StaffMember = {
      id: `staff-${Date.now()}`,
      name,
      email,
      role,
      permissions:
        role === 'admin'
          ? ['PRODUCTS_WRITE', 'ORDERS_WRITE', 'STOCK_ADJUSTMENT']
          : role === 'pos_cashier'
          ? ['POS_TENDER', 'RECEIPT_PRINT']
          : ['PRODUCTS_WRITE', 'CMS_WRITE'],
    };

    setStaffList((prev) => [...prev, newStaff]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#12231A]">
            Staff Accounts & Role-Based Access Control (RBAC)
          </h2>
          <p className="text-xs text-[#717A75]">
            Grant granular permissions to store staff, inventory clerks, POS cashiers, and content managers
          </p>
        </div>

        <button
          onClick={() => {
            setName('');
            setEmail('');
            setRole('catalog_manager');
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-[#12231A] text-[#DFCAAB] text-xs uppercase tracking-wider font-bold hover:bg-[#182F23] flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Invite Staff Member</span>
        </button>
      </div>

      {/* Staff Table */}
      <div className="bg-white border border-[#E6DFD5] rounded-sm shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF8F5] text-[#717A75] uppercase text-[10px] tracking-wider border-b border-[#E6DFD5]">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Granular Permissions</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EFE6]">
              {staffList.map((member) => (
                <tr key={member.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-[#12231A]">{member.name}</td>
                  <td className="py-3 px-4 font-mono text-[#717A75]">{member.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-sm ${
                        member.role === 'super_admin'
                          ? 'bg-purple-50 text-purple-800 border border-purple-200'
                          : member.role === 'admin'
                          ? 'bg-blue-50 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {member.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {member.permissions.map((p) => (
                        <span
                          key={p}
                          className="px-1.5 py-0.5 bg-[#FAF8F5] border border-[#E6DFD5] text-[9px] font-mono"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {member.role !== 'super_admin' && (
                      <button
                        onClick={() => {
                          if (confirm(`Remove staff member ${member.name}?`)) {
                            setStaffList((prev) => prev.filter((m) => m.id !== member.id));
                          }
                        }}
                        className="text-red-700 hover:text-red-900 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white p-6 rounded-sm border border-[#E6DFD5] shadow-2xl">
            <h3 className="text-base font-serif font-bold text-[#12231A] mb-3">
              Invite Staff Account
            </h3>

            <form onSubmit={handleAddStaff} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#717A75] uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#717A75] uppercase mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#717A75] uppercase mb-1">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as StaffMember['role'])}
                  className="w-full p-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs"
                >
                  <option value="admin">Administrator (Orders, Catalog, Stock)</option>
                  <option value="catalog_manager">Catalog & CMS Manager</option>
                  <option value="pos_cashier">Retail Store Cashier (POS)</option>
                  <option value="support_agent">Customer Support Concierge</option>
                </select>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border text-xs">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#12231A] text-[#DFCAAB] text-xs font-bold uppercase tracking-wider"
                >
                  Create Staff Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
