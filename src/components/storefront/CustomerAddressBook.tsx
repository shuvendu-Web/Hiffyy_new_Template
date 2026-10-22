import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { CustomerAddress } from '../../types';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Home,
  Briefcase,
  Navigation,
  ShieldCheck,
  X,
  Check,
  Star,
} from 'lucide-react';

interface CustomerAddressBookProps {
  onSelectAddressForCheckout?: (addr: CustomerAddress) => void;
  selectedAddressId?: string;
  isCompact?: boolean;
}

const INDIAN_STATES = [
  'Maharashtra',
  'Delhi',
  'Karnataka',
  'Tamil Nadu',
  'West Bengal',
  'Telangana',
  'Gujarat',
  'Rajasthan',
  'Uttar Pradesh',
  'Kerala',
  'Haryana',
  'Punjab',
  'Madhya Pradesh',
  'Goa',
];

export const CustomerAddressBook: React.FC<CustomerAddressBookProps> = ({
  onSelectAddressForCheckout,
  selectedAddressId,
  isCompact = false,
}) => {
  const { addresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [street, setStreet] = useState('');
  const [apartment, setApartment] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [pinCode, setPinCode] = useState('');
  const [addressType, setAddressType] = useState<'home' | 'work' | 'other'>('home');
  const [isDefault, setIsDefault] = useState(false);
  const [formError, setFormError] = useState('');

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setFullName('');
    setPhone('+91 ');
    setStreet('');
    setApartment('');
    setLandmark('');
    setCity('');
    setState('Maharashtra');
    setPinCode('');
    setAddressType('home');
    setIsDefault(addresses.length === 0);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addr: CustomerAddress) => {
    setEditingAddress(addr);
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setStreet(addr.street);
    setApartment(addr.apartment || '');
    setLandmark(addr.landmark || '');
    setCity(addr.city);
    setState(addr.state);
    setPinCode(addr.pinCode);
    setAddressType(addr.addressType || 'home');
    setIsDefault(!!addr.isDefault);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pinCode.trim();
    if (!/^\d{6}$/.test(cleanPin)) {
      setFormError('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    if (editingAddress && editingAddress.id) {
      updateAddress(editingAddress.id, {
        fullName,
        phone,
        street,
        apartment,
        landmark,
        city,
        state,
        pinCode: cleanPin,
        addressType,
        isDefault,
      });
    } else {
      addAddress({
        fullName,
        phone,
        street,
        apartment,
        landmark,
        city,
        state,
        pinCode: cleanPin,
        addressType,
        isDefault,
      });
    }

    setIsModalOpen(false);
  };

  const getTypeIcon = (type?: 'home' | 'work' | 'other') => {
    switch (type) {
      case 'work':
        return <Briefcase className="w-3.5 h-3.5 text-[#886938]" />;
      case 'home':
        return <Home className="w-3.5 h-3.5 text-[#886938]" />;
      default:
        return <Navigation className="w-3.5 h-3.5 text-[#886938]" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E6DFD5]">
        <div>
          <h3 className="text-sm font-serif font-bold text-[#12231A] uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#C5A880]" />
            <span>Saved Patron Addresses ({addresses.length})</span>
          </h3>
          <p className="text-[11px] text-[#717A75]">
            Save delivery addresses for accelerated 1-click checkout across India
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-3 py-1.5 bg-[#12231A] text-[#DFCAAB] text-[11px] uppercase tracking-wider font-bold hover:bg-[#182F23] flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Address</span>
        </button>
      </div>

      {/* Address cards list */}
      {addresses.length === 0 ? (
        <div className="p-8 text-center bg-white border border-[#E6DFD5] rounded-sm">
          <MapPin className="w-8 h-8 text-[#C5A880] mx-auto mb-2 opacity-60" />
          <p className="text-xs font-serif font-semibold text-[#12231A]">No addresses saved yet</p>
          <p className="text-[11px] text-[#717A75] mt-1 mb-4">
            Add your primary residence or office address for expedited flacon dispatch.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#12231A] text-[#DFCAAB] text-xs uppercase tracking-wider font-bold"
          >
            Add First Address
          </button>
        </div>
      ) : (
        <div className={`grid gap-4 ${isCompact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
          {addresses.map((addr) => {
            const isSelected = selectedAddressId === addr.id;
            return (
              <div
                key={addr.id}
                className={`p-4 bg-white border rounded-sm transition-all relative flex flex-col justify-between ${
                  addr.isDefault
                    ? 'border-[#C5A880] ring-1 ring-[#C5A880]/40 shadow-sm'
                    : 'border-[#E6DFD5] hover:border-[#C5A880]/60'
                } ${isSelected ? 'bg-[#FAF8F5] border-[#12231A]' : ''}`}
              >
                <div>
                  {/* Top badges */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="p-1 bg-[#FAF8F5] border border-[#E6DFD5] rounded-sm">
                        {getTypeIcon(addr.addressType)}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-[#886938] tracking-wider">
                        {addr.addressType || 'home'}
                      </span>
                    </div>

                    {addr.isDefault && (
                      <span className="px-2 py-0.5 bg-[#12231A] text-[#DFCAAB] text-[9px] font-bold uppercase tracking-wider rounded-sm flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-[#DFCAAB]" />
                        <span>Default Destination</span>
                      </span>
                    )}
                  </div>

                  {/* Recipient info */}
                  <h4 className="text-xs font-bold text-[#12231A] mb-1">{addr.fullName}</h4>
                  <p className="text-xs text-[#424945] leading-relaxed">
                    {addr.apartment && <span className="block">{addr.apartment}</span>}
                    <span className="block">{addr.street}</span>
                    {addr.landmark && (
                      <span className="block text-[11px] text-[#717A75] italic">
                        Landmark: {addr.landmark}
                      </span>
                    )}
                    <span className="block font-semibold mt-0.5 text-[#12231A]">
                      {addr.city}, {addr.state} — {addr.pinCode}
                    </span>
                  </p>

                  <p className="text-[11px] text-[#717A75] font-mono mt-2">
                    Phone: {addr.phone}
                  </p>
                </div>

                {/* Bottom action controls */}
                <div className="pt-3 mt-3 border-t border-[#F4EFE6] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {!addr.isDefault && addr.id && (
                      <button
                        onClick={() => setDefaultAddress(addr.id!)}
                        className="text-[10px] uppercase tracking-wider font-semibold text-[#886938] hover:text-[#12231A] transition-colors cursor-pointer"
                      >
                        Set as Default
                      </button>
                    )}
                    {onSelectAddressForCheckout && (
                      <button
                        onClick={() => onSelectAddressForCheckout(addr)}
                        className="px-2.5 py-1 bg-[#12231A] text-[#DFCAAB] text-[10px] uppercase font-bold tracking-wider hover:bg-[#182F23] cursor-pointer"
                      >
                        {isSelected ? 'Selected' : 'Deliver Here'}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(addr)}
                      className="p-1.5 text-[#717A75] hover:text-[#12231A] rounded-sm hover:bg-[#FAF8F5] cursor-pointer"
                      title="Edit address"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {addresses.length > 1 && addr.id && (
                      <button
                        onClick={() => {
                          if (confirm(`Remove address for ${addr.fullName}?`)) {
                            deleteAddress(addr.id!);
                          }
                        }}
                        className="p-1.5 text-[#717A75] hover:text-red-700 rounded-sm hover:bg-[#FAF8F5] cursor-pointer"
                        title="Delete address"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Address Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#12231A]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#FAF8F5] border border-[#E6DFD5] shadow-2xl rounded-sm p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-[#717A75] hover:text-[#12231A] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#886938] block mb-1">
              Destination Protocol
            </span>
            <h3 className="text-xl font-serif font-bold text-[#12231A] mb-4">
              {editingAddress ? 'Modify Shipping Destination' : 'Add New Shipping Destination'}
            </h3>

            {formError && (
              <p className="text-xs text-red-700 bg-red-50 p-2.5 rounded-sm border border-red-200 mb-4">
                {formError}
              </p>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Type pill selector */}
              <div>
                <label className="block text-[11px] uppercase font-bold text-[#717A75] mb-1.5">
                  Address Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'home', label: 'Home Residence', icon: Home },
                    { id: 'work', label: 'Office / Corporate', icon: Briefcase },
                    { id: 'other', label: 'Other Retreat', icon: Navigation },
                  ].map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setAddressType(t.id as 'home' | 'work' | 'other')}
                        className={`p-2 border text-center transition-all cursor-pointer rounded-sm flex items-center justify-center gap-1.5 ${
                          addressType === t.id
                            ? 'border-[#12231A] bg-[#12231A] text-[#DFCAAB] font-bold'
                            : 'border-[#E6DFD5] bg-white text-[#12231A] hover:border-[#C5A880]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="text-[10px]">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recipient details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase font-bold text-[#717A75] mb-1">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Vikramaditya Singhania"
                    className="w-full p-2.5 bg-white border border-[#E6DFD5] text-xs focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold text-[#717A75] mb-1">
                    Contact Mobile (+91) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98200 12345"
                    className="w-full p-2.5 bg-white border border-[#E6DFD5] text-xs focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              {/* Street & Apartment */}
              <div>
                <label className="block text-[11px] uppercase font-bold text-[#717A75] mb-1">
                  Street Address / House / Building *
                </label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. Sea Green Heights, Worli Sea Face"
                  className="w-full p-2.5 bg-white border border-[#E6DFD5] text-xs focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase font-bold text-[#717A75] mb-1">
                    Apartment / Suite / Floor (Optional)
                  </label>
                  <input
                    type="text"
                    value={apartment}
                    onChange={(e) => setApartment(e.target.value)}
                    placeholder="e.g. Flat 14B, Floor 14"
                    className="w-full p-2.5 bg-white border border-[#E6DFD5] text-xs focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold text-[#717A75] mb-1">
                    Nearby Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Opposite Worli Dairy"
                    className="w-full p-2.5 bg-white border border-[#E6DFD5] text-xs focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              {/* City, State, PIN */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] uppercase font-bold text-[#717A75] mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Mumbai"
                    className="w-full p-2.5 bg-white border border-[#E6DFD5] text-xs focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold text-[#717A75] mb-1">
                    State *
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#E6DFD5] text-xs focus:outline-none focus:border-[#C5A880]"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold text-[#717A75] mb-1">
                    PIN Code (6 Digits) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder="400030"
                    className="w-full p-2.5 bg-white border border-[#E6DFD5] text-xs font-mono font-bold focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              {/* Default checkbox */}
              <div className="pt-2">
                <label className="flex items-center gap-2.5 text-xs text-[#12231A] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="rounded border-[#E6DFD5] text-[#12231A] focus:ring-[#C5A880]"
                  />
                  <span>Set as my default shipping address for faster 1-click checkout</span>
                </label>
              </div>

              {/* Form buttons */}
              <div className="pt-4 border-t border-[#E6DFD5] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#E6DFD5] text-xs text-[#717A75] hover:text-[#12231A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#12231A] text-[#DFCAAB] text-xs uppercase tracking-wider font-bold hover:bg-[#182F23] cursor-pointer shadow-sm"
                >
                  {editingAddress ? 'Update Address' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
