import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, FragranceFamily } from '../../types';
import { Plus, Edit2, Trash2, Search, Sparkles, Layers, Image as ImageIcon, X } from 'lucide-react';

export const ProductCatalogManager: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, setAdminTab } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [sku, setSku] = useState('');
  const [fragranceFamily, setFragranceFamily] = useState<FragranceFamily>('Oriental Woody');
  const [concentration, setConcentration] = useState<'Extrait de Parfum' | 'Eau de Parfum'>('Extrait de Parfum');
  const [sellingPrice, setSellingPrice] = useState(3999);
  const [costPrice, setCostPrice] = useState(1200);
  const [stockOnHand, setStockOnHand] = useState(100);
  const [topNotes, setTopNotes] = useState('Bergamot, Saffron');
  const [heartNotes, setHeartNotes] = useState('Rose, Cardamom');
  const [baseNotes, setBaseNotes] = useState('Oud, Sandalwood');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const filtered = products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.fragranceFamily.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setTitle(p.title);
    setSku(p.sku);
    setFragranceFamily(p.fragranceFamily);
    setConcentration(p.concentration as 'Extrait de Parfum' | 'Eau de Parfum');
    setSellingPrice(p.sellingPrice);
    setCostPrice(p.costPrice);
    setStockOnHand(p.stockOnHand);
    setTopNotes(p.notes.top.join(', '));
    setHeartNotes(p.notes.heart.join(', '));
    setBaseNotes(p.notes.base.join(', '));
    setDescription(p.description);
    setImageUrl(p.images[0] || '');
    setIsCreating(false);
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setTitle('');
    setSku(`HIF-NEW-${Math.floor(100 + Math.random() * 900)}`);
    setFragranceFamily('Oriental Woody');
    setConcentration('Extrait de Parfum');
    setSellingPrice(3999);
    setCostPrice(1200);
    setStockOnHand(80);
    setTopNotes('Assam Oud, Bergamot');
    setHeartNotes('Rose Absolute, Cardamom');
    setBaseNotes('Mysore Sandalwood, Amber');
    setDescription('A rare artisanal perfume hand-distilled with natural botanical absolutes.');
    setImageUrl('https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=80');
    setIsCreating(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const notes = {
      top: topNotes.split(',').map((s) => s.trim()).filter(Boolean),
      heart: heartNotes.split(',').map((s) => s.trim()).filter(Boolean),
      base: baseNotes.split(',').map((s) => s.trim()).filter(Boolean),
    };

    const variants = [
      { size: '30ml' as const, sku: `${sku}-30`, barcode: `8901${Math.floor(100000000 + Math.random() * 900000000)}`, sellingPrice: Math.round(sellingPrice * 0.65), compareAtPrice: Math.round(sellingPrice * 0.8), costPrice: Math.round(costPrice * 0.6), stock: Math.round(stockOnHand * 0.3) },
      { size: '50ml' as const, sku: `${sku}-50`, barcode: `8901${Math.floor(100000000 + Math.random() * 900000000)}`, sellingPrice: Math.round(sellingPrice * 0.8), compareAtPrice: Math.round(sellingPrice * 0.95), costPrice: Math.round(costPrice * 0.8), stock: Math.round(stockOnHand * 0.4) },
      { size: '100ml' as const, sku: `${sku}-100`, barcode: `8901${Math.floor(100000000 + Math.random() * 900000000)}`, sellingPrice, compareAtPrice: Math.round(sellingPrice * 1.2), costPrice, stock: Math.round(stockOnHand * 0.3) },
    ];

    if (isCreating) {
      addProduct({
        title,
        slug,
        sku,
        fragranceFamily,
        concentration,
        notes,
        description,
        olfactoryStory: 'A timeless symphony conceived for longevity and presence.',
        longevity: '14+ Hours on Skin',
        sillage: 'Imperial',
        status: 'active',
        sellingPrice,
        compareAtPrice: Math.round(sellingPrice * 1.2),
        costPrice,
        stockOnHand,
        stockReserved: 0,
        availableStock: stockOnHand,
        reorderThreshold: 20,
        images: [imageUrl],
        variants,
        isBestseller: false,
        isNewArrival: true,
        rating: 5.0,
        reviewCount: 1,
        bottleColor: '#12231A',
      });
      setIsCreating(false);
    } else if (editingProduct) {
      updateProduct(editingProduct.id, {
        title,
        sku,
        fragranceFamily,
        concentration,
        notes,
        description,
        sellingPrice,
        costPrice,
        stockOnHand,
        availableStock: stockOnHand - editingProduct.stockReserved,
        images: [imageUrl, ...(editingProduct.images.slice(1))],
      });
      setEditingProduct(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#12231A]">Fragrance Catalog</h2>
          <p className="text-xs text-[#717A75]">
            Manage master perfume definitions, olfactory notes, packaging variants, and prices
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAdminTab('ai-studio')}
            className="px-4 py-2 bg-[#FAF8F5] border border-[#C5A880] text-[#12231A] text-xs font-semibold hover:bg-[#F4EFE6] flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Generate Bottle Photo</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-[#12231A] text-[#DFCAAB] text-xs uppercase tracking-wider font-bold hover:bg-[#182F23] flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Flacon</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 border border-[#E6DFD5] rounded-sm flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#717A75]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search catalog by perfume title, SKU, or fragrance family..."
            className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs focus:outline-none focus:border-[#C5A880]"
          />
        </div>
        <span className="text-xs text-[#717A75] font-mono">{filtered.length} SKUs Listed</span>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-[#E6DFD5] rounded-sm shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF8F5] text-[#717A75] uppercase text-[10px] tracking-wider border-b border-[#E6DFD5]">
              <tr>
                <th className="py-3 px-4">Flacon</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Olfactory Family</th>
                <th className="py-3 px-4">Selling Price</th>
                <th className="py-3 px-4">Cost Price</th>
                <th className="py-3 px-4">Stock on Hand</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EFE6]">
              {filtered.map((prod) => (
                <tr key={prod.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img src={prod.images[0]} alt="" className="w-10 h-12 object-cover rounded-sm border" />
                      <div>
                        <div className="font-serif font-bold text-sm text-[#12231A]">{prod.title}</div>
                        <div className="text-[10px] text-[#717A75]">{prod.concentration}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[#717A75]">{prod.sku}</td>
                  <td className="py-3 px-4 font-medium text-[#12231A]">{prod.fragranceFamily}</td>
                  <td className="py-3 px-4 font-bold text-[#12231A]">₹{prod.sellingPrice}</td>
                  <td className="py-3 px-4 text-[#717A75]">₹{prod.costPrice}</td>
                  <td className="py-3 px-4 font-semibold">
                    <span className={prod.stockOnHand <= prod.reorderThreshold ? 'text-red-700' : 'text-[#12231A]'}>
                      {prod.stockOnHand} Units
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase rounded-sm">
                      {prod.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(prod)}
                        className="p-1 text-[#717A75] hover:text-[#12231A] cursor-pointer"
                        title="Edit product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Archive ${prod.title}?`)) deleteProduct(prod.id);
                        }}
                        className="p-1 text-[#717A75] hover:text-red-700 cursor-pointer"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Create/Edit Modal */}
      {(isCreating || editingProduct) && (
        <div className="fixed inset-0 z-50 bg-[#12231A]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#FAF8F5] border border-[#E6DFD5] shadow-2xl rounded-sm p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsCreating(false);
                setEditingProduct(null);
              }}
              className="absolute top-4 right-4 text-[#717A75] hover:text-[#12231A] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-serif font-bold text-[#12231A] mb-4">
              {isCreating ? 'Create New Perfume Creation' : `Edit: ${editingProduct?.title}`}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase font-bold text-[#717A75] mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 bg-white border border-[#E6DFD5] text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase font-bold text-[#717A75] mb-1">SKU *</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full p-2 bg-white border border-[#E6DFD5] text-xs font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase font-bold text-[#717A75] mb-1">Fragrance Family</label>
                  <select
                    value={fragranceFamily}
                    onChange={(e) => setFragranceFamily(e.target.value as FragranceFamily)}
                    className="w-full p-2 bg-white border border-[#E6DFD5] text-xs focus:outline-none"
                  >
                    <option value="Oriental Woody">Oriental Woody</option>
                    <option value="Fresh Citrus">Fresh Citrus</option>
                    <option value="Amber Gourmand">Amber Gourmand</option>
                    <option value="Floral Attar">Floral Attar</option>
                    <option value="Smoky Leather">Smoky Leather</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] uppercase font-bold text-[#717A75] mb-1">Concentration</label>
                  <select
                    value={concentration}
                    onChange={(e) => setConcentration(e.target.value as 'Extrait de Parfum' | 'Eau de Parfum')}
                    className="w-full p-2 bg-white border border-[#E6DFD5] text-xs focus:outline-none"
                  >
                    <option value="Extrait de Parfum">Extrait de Parfum (35%)</option>
                    <option value="Eau de Parfum">Eau de Parfum (20%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] uppercase font-bold text-[#717A75] mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-[#E6DFD5] text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase font-bold text-[#717A75] mb-1">Cost of Goods (COGS ₹)</label>
                  <input
                    type="number"
                    required
                    value={costPrice}
                    onChange={(e) => setCostPrice(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-[#E6DFD5] text-xs focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] uppercase font-bold text-[#717A75] mb-1">Initial Stock on Hand</label>
                  <input
                    type="number"
                    required
                    value={stockOnHand}
                    onChange={(e) => setStockOnHand(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-[#E6DFD5] text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="p-4 bg-white border border-[#E6DFD5] rounded-sm space-y-3">
                <span className="text-[10px] uppercase font-bold text-[#886938] block">Fragrance Pyramid Notes</span>
                <div>
                  <label className="block text-[10px] text-[#717A75]">Top Notes (Comma separated)</label>
                  <input
                    type="text"
                    value={topNotes}
                    onChange={(e) => setTopNotes(e.target.value)}
                    className="w-full p-1.5 bg-[#FAF8F5] border border-[#E6DFD5] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#717A75]">Heart Notes (Comma separated)</label>
                  <input
                    type="text"
                    value={heartNotes}
                    onChange={(e) => setHeartNotes(e.target.value)}
                    className="w-full p-1.5 bg-[#FAF8F5] border border-[#E6DFD5] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#717A75]">Base Notes (Comma separated)</label>
                  <input
                    type="text"
                    value={baseNotes}
                    onChange={(e) => setBaseNotes(e.target.value)}
                    className="w-full p-1.5 bg-[#FAF8F5] border border-[#E6DFD5] text-xs"
                  />
                </div>
              </div>

              {/* Image & Description */}
              <div>
                <label className="block text-[11px] uppercase font-bold text-[#717A75] mb-1">Flacon Image URL</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2 bg-white border border-[#E6DFD5] text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase font-bold text-[#717A75] mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 bg-white border border-[#E6DFD5] text-xs focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-[#E6DFD5] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 border text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#12231A] text-[#DFCAAB] text-xs uppercase tracking-wider font-bold hover:bg-[#182F23]"
                >
                  Save Product to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
