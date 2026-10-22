import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { HeroCarouselProduct } from '../../types';
import { Plus, Edit2, Trash2, Image as ImageIcon, Save, Check, Layers, Sliders, Sparkles, X, RotateCcw } from 'lucide-react';
import { ImageUploadModal } from './ImageUploadModal';

export const HeroSectionManager: React.FC = () => {
  const { heroSlides, addHeroSlide, updateHeroSlide, deleteHeroSlide, resetHeroSlides, products, addProduct, deleteProduct } = useStore();
  const [activeTab, setActiveTab] = useState<'slides' | 'cards'>('slides');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroCarouselProduct | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  // Form State for Slide
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [headlineFirst, setHeadlineFirst] = useState('Bloom in');
  const [headlineSecond, setHeadlineSecond] = useState('Pure Radiance');
  const [description, setDescription] = useState('');
  const [variantSize, setVariantSize] = useState<'30ml' | '50ml' | '100ml'>('50ml');
  const [volumeLabel, setVolumeLabel] = useState('50ml / 1.7 FL.OZ');
  const [priceINR, setPriceINR] = useState(3499);
  const [cardImage, setCardImage] = useState('');
  const [heroModelImage, setHeroModelImage] = useState('');
  const [statBadge, setStatBadge] = useState('680K +');

  // Image Modal state
  const [imageModalTarget, setImageModalTarget] = useState<'cardImage' | 'heroModelImage' | null>(null);

  const handleResetSlides = async () => {
    if (confirm('Restore default HIFFYY hero carousel slides? This will restore high-res imagery, prices, and copy.')) {
      setIsResetting(true);
      try {
        await resetHeroSlides();
      } finally {
        setIsResetting(false);
      }
    }
  };

  const handleOpenCreate = () => {
    setEditingSlide(null);
    setTitle('New Botanical Elixir');
    setSubtitle('Restorative Dermal Treatment');
    setHeadlineFirst('Bloom in');
    setHeadlineSecond('Absolute Luxury');
    setDescription('Crafted with rare Himalayan botanicals and pure extracted actives for timeless skin radiance.');
    setVariantSize('50ml');
    setVolumeLabel('50ml / 1.7 FL.OZ');
    setPriceINR(3999);
    setCardImage('https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80');
    setHeroModelImage('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80');
    setStatBadge('750K +');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (slide: HeroCarouselProduct) => {
    setEditingSlide(slide);
    setTitle(slide.title || '');
    setSubtitle(slide.subtitle || '');
    setHeadlineFirst(slide.headlineFirst || 'Bloom in');
    setHeadlineSecond(slide.headlineSecond || 'Pure Radiance');
    setDescription(slide.description || '');
    setVariantSize(slide.variantSize || '50ml');
    setVolumeLabel(slide.volumeLabel || '50ml / 1.7 FL.OZ');
    setPriceINR(slide.priceINR ?? (slide as unknown as { price?: number }).price ?? 3499);
    setCardImage(slide.cardImage || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80');
    setHeroModelImage(slide.heroModelImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80');
    setStatBadge(slide.statBadge || '680K +');
    setIsModalOpen(true);
  };

  const handleSaveSlide = (e: React.FormEvent) => {
    e.preventDefault();
    const slideData: HeroCarouselProduct = {
      id: editingSlide ? editingSlide.id : `hero-slide-${Date.now()}`,
      title,
      subtitle,
      headlineFirst,
      headlineSecond,
      description,
      variantSize,
      volumeLabel,
      priceUSD: Math.round(priceINR / 83),
      priceINR,
      cardImage,
      heroModelImage,
      statBadge,
    };

    if (editingSlide) {
      updateHeroSlide(editingSlide.id, slideData);
    } else {
      addHeroSlide(slideData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#12231A]">
            Hero Section & Slide Menu Index
          </h2>
          <p className="text-xs text-[#717A75]">
            Manage hero carousel slides, edit editorial copy, update high-res imagery with image uploader, and manage hero card products.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-[#E6DFD5] p-1 rounded-sm text-xs">
            <button
              onClick={() => setActiveTab('slides')}
              className={`px-3 py-1.5 font-bold rounded-sm transition-colors cursor-pointer ${
                activeTab === 'slides' ? 'bg-[#12231A] text-[#DFCAAB]' : 'text-[#12231A]'
              }`}
            >
              Hero Carousel Slides ({heroSlides.length})
            </button>
            <button
              onClick={() => setActiveTab('cards')}
              className={`px-3 py-1.5 font-bold rounded-sm transition-colors cursor-pointer ${
                activeTab === 'cards' ? 'bg-[#12231A] text-[#DFCAAB]' : 'text-[#12231A]'
              }`}
            >
              Hero Card Products ({products.length})
            </button>
          </div>

          {activeTab === 'slides' && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetSlides}
                disabled={isResetting}
                className="px-3 py-2 bg-[#FAF8F5] border border-[#E6DFD5] text-[#12231A] text-xs font-semibold hover:border-[#12231A] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Restore default brand slides"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                <span>{isResetting ? 'Restoring...' : 'Restore Defaults'}</span>
              </button>

              <button
                onClick={handleOpenCreate}
                className="px-4 py-2 bg-[#12231A] text-[#DFCAAB] text-xs uppercase tracking-wider font-bold hover:bg-[#182F23] flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Hero Slide</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Slides Tab Content */}
      {activeTab === 'slides' && (
        <>
          {heroSlides.length === 0 ? (
            <div className="bg-white border border-[#E6DFD5] rounded-sm p-12 text-center shadow-sm">
              <Sparkles className="w-10 h-10 text-[#C5A880] mx-auto mb-3" />
              <h3 className="text-base font-serif font-bold text-[#12231A]">No Hero Slides Found</h3>
              <p className="text-xs text-[#717A75] max-w-md mx-auto mt-1 mb-6">
                The hero carousel currently has no slides loaded. You can restore the official default brand slides or create a new slide from scratch.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleResetSlides}
                  disabled={isResetting}
                  className="px-5 py-2.5 bg-[#12231A] text-[#DFCAAB] text-xs uppercase tracking-wider font-bold hover:bg-[#182F23] flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
                  <span>{isResetting ? 'Restoring Defaults...' : 'Restore Default Brand Slides'}</span>
                </button>
                <button
                  onClick={handleOpenCreate}
                  className="px-5 py-2.5 bg-white border border-[#12231A] text-[#12231A] text-xs uppercase tracking-wider font-bold hover:bg-[#FAF8F5] flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Custom Slide</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {heroSlides.map((slide, idx) => (
                <div
                  key={slide.id || idx}
                  className="bg-white border border-[#E6DFD5] rounded-sm p-5 shadow-sm hover:border-[#C5A880] transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-full bg-[#12231A] text-[#DFCAAB] text-[10px] font-bold flex items-center justify-center font-mono">
                        #{idx + 1}
                      </span>
                      <span className="px-2 py-0.5 bg-[#FAF8F5] border border-[#E6DFD5] text-[10px] font-mono text-[#717A75]">
                        {slide.statBadge || '500K +'} Users
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative aspect-video rounded-sm overflow-hidden border border-[#E6DFD5] flex items-center justify-center bg-[repeating-conic-gradient(#e5e7eb_0%_25%,_#ffffff_0%_50%)] bg-[length:12px_12px] p-1">
                        <img
                          src={slide.cardImage || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80'}
                          alt={slide.title || 'Slide'}
                          className="max-w-full max-h-full object-contain"
                        />
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/75 text-white text-[9px] rounded-xs font-mono">Packshot</span>
                      </div>
                      <div className="relative aspect-video rounded-sm overflow-hidden border border-[#E6DFD5] flex items-center justify-center bg-[repeating-conic-gradient(#e5e7eb_0%_25%,_#ffffff_0%_50%)] bg-[length:12px_12px] p-1">
                        <img
                          src={slide.heroModelImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'}
                          alt={slide.title || 'Model'}
                          className="max-w-full max-h-full object-contain"
                        />
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/75 text-white text-[9px] rounded-xs font-mono">Model Portrait</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-serif font-bold text-[#12231A]">
                        {slide.headlineFirst || 'Bloom in'} <span className="text-[#C5A880]">{slide.headlineSecond || 'Pure Radiance'}</span>
                      </h3>
                      <h4 className="text-xs font-bold text-[#717A75] mt-0.5">{slide.title || 'Botanical Elixir'}</h4>
                      <p className="text-[11px] text-[#717A75] line-clamp-2 mt-1">{slide.description || ''}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-[#FAF8F5]">
                      <span className="text-[#886938] font-bold">
                        ₹{(slide.priceINR ?? (slide as unknown as { price?: number }).price ?? 3499).toLocaleString()}
                      </span>
                      <span className="text-[#717A75]">{slide.variantSize || '50ml'} ({slide.volumeLabel || '50ml / 1.7 FL.OZ'})</span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#E6DFD5] flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEdit(slide)}
                      className="px-3 py-1.5 bg-[#FAF8F5] border border-[#E6DFD5] text-[#12231A] text-xs font-semibold hover:border-[#12231A] flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Slide & Images</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete slide "${slide.title}"?`)) deleteHeroSlide(slide.id);
                      }}
                      className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold hover:bg-red-100 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Cards / Products Tab Content */}
      {activeTab === 'cards' && (
        <div className="bg-white border border-[#E6DFD5] rounded-sm p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-serif font-bold text-[#12231A] uppercase tracking-wider">
              Hero Card Product Catalog & Quick Add / Delete
            </h3>
            <span className="text-xs text-[#717A75] font-mono">Total Hero Card Products: {products.length}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((prod) => (
              <div key={prod.id} className="border border-[#E6DFD5] p-3 rounded-sm flex items-center justify-between bg-[#FAF8F5]">
                <div className="flex items-center gap-3 truncate">
                  <img src={prod.images[0]} alt="" className="w-10 h-10 object-cover rounded-sm border" />
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-[#12231A] truncate">{prod.title}</h4>
                    <span className="text-[10px] text-[#886938] font-mono">₹{prod.sellingPrice} | {prod.fragranceFamily}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (confirm(`Remove product card "${prod.title}" from hero cards?`)) {
                      deleteProduct(prod.id);
                    }
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-700 hover:bg-red-50 rounded-sm cursor-pointer"
                  title="Delete Product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit / Create Slide Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white p-6 rounded-sm border border-[#E6DFD5] shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-serif font-bold text-[#12231A]">
                {editingSlide ? 'Edit Hero Slide & Images' : 'Create New Hero Slide'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-4 h-4 text-[#717A75]" />
              </button>
            </div>

            <form onSubmit={handleSaveSlide} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#717A75] uppercase mb-1">Slide Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E6DFD5] text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#717A75] uppercase mb-1">Subtitle *</label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    required
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E6DFD5] text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#717A75] uppercase mb-1">Headline Line 1 *</label>
                  <input
                    type="text"
                    value={headlineFirst}
                    onChange={(e) => setHeadlineFirst(e.target.value)}
                    required
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E6DFD5] text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#717A75] uppercase mb-1">Headline Line 2 (Golden) *</label>
                  <input
                    type="text"
                    value={headlineSecond}
                    onChange={(e) => setHeadlineSecond(e.target.value)}
                    required
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E6DFD5] text-xs focus:outline-none font-serif font-bold text-[#C5A880]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#717A75] uppercase mb-1">Description / Editorial Copy *</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#E6DFD5] text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#717A75] uppercase mb-1">Price (INR) *</label>
                  <input
                    type="number"
                    value={priceINR}
                    onChange={(e) => setPriceINR(Number(e.target.value))}
                    required
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E6DFD5] text-xs focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#717A75] uppercase mb-1">Variant Size</label>
                  <select
                    value={variantSize}
                    onChange={(e) => setVariantSize(e.target.value as '30ml' | '50ml' | '100ml')}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E6DFD5] text-xs focus:outline-none"
                  >
                    <option value="30ml">30ml</option>
                    <option value="50ml">50ml</option>
                    <option value="100ml">100ml</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#717A75] uppercase mb-1">Stat Badge</label>
                  <input
                    type="text"
                    value={statBadge}
                    onChange={(e) => setStatBadge(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E6DFD5] text-xs focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Image Upload Integration */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-[#717A75] uppercase">Card Packshot Image (PNG / Transparent)</label>
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-sm border border-[#C5A880] overflow-hidden flex items-center justify-center shrink-0 bg-[repeating-conic-gradient(#e5e7eb_0%_25%,_#ffffff_0%_50%)] bg-[length:10px_10px] p-1 shadow-inner">
                      <img src={cardImage} alt="" className="max-w-full max-h-full object-contain" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setImageModalTarget('cardImage')}
                      className="px-3 py-2 bg-[#FAF8F5] border border-[#12231A] text-[#12231A] text-xs font-semibold hover:bg-[#12231A] hover:text-white transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Upload / Edit PNG</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-[#717A75] uppercase">Hero Model / Centerpiece (PNG / Transparent)</label>
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-sm border border-[#C5A880] overflow-hidden flex items-center justify-center shrink-0 bg-[repeating-conic-gradient(#e5e7eb_0%_25%,_#ffffff_0%_50%)] bg-[length:10px_10px] p-1 shadow-inner">
                      <img src={heroModelImage} alt="" className="max-w-full max-h-full object-contain" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setImageModalTarget('heroModelImage')}
                      className="px-3 py-2 bg-[#FAF8F5] border border-[#12231A] text-[#12231A] text-xs font-semibold hover:bg-[#12231A] hover:text-white transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Upload / Edit PNG</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#E6DFD5]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white border border-[#E6DFD5] text-[#12231A] text-xs font-semibold hover:border-[#12231A] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#12231A] text-[#DFCAAB] text-xs uppercase tracking-wider font-bold hover:bg-[#182F23] flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Slide Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Upload Modal */}
      <ImageUploadModal
        isOpen={imageModalTarget !== null}
        onClose={() => setImageModalTarget(null)}
        currentImage={imageModalTarget === 'cardImage' ? cardImage : heroModelImage}
        onSelectImage={(url) => {
          if (imageModalTarget === 'cardImage') setCardImage(url);
          if (imageModalTarget === 'heroModelImage') setHeroModelImage(url);
          setImageModalTarget(null);
        }}
      />
    </div>
  );
};
