import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { MediaItem } from '../../types';
import { Film, Plus, Edit2, Trash2, Youtube, Instagram, Check, X } from 'lucide-react';

export const MediaCarouselManager: React.FC = () => {
  const { mediaItems, addMediaItem, updateMediaItem, deleteMediaItem } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);

  // Form State
  const [type, setType] = useState<'youtube' | 'instagram' | 'image_banner' | 'video'>('youtube');
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [ctaLabel, setCtaLabel] = useState('Shop Flacon');
  const [ctaLink, setCtaLink] = useState('/products/oud-royal-rajasthan');
  const [isActive, setIsActive] = useState(true);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setType('video');
    setTitle('');
    setCaption('');
    setMediaUrl('');
    setVideoUrl('');
    setThumbnailUrl('https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80');
    setCtaLabel('Shop Creation');
    setCtaLink('/products/oud-royal-rajasthan');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: MediaItem) => {
    setEditingItem(item);
    setType(item.type);
    setTitle(item.title);
    setCaption(item.caption);
    setMediaUrl(item.mediaUrl);
    setVideoUrl(item.videoUrl || '');
    setThumbnailUrl(item.thumbnailUrl);
    setCtaLabel(item.ctaLabel || 'Shop Flacon');
    setCtaLink(item.ctaLink || '/products/oud-royal-rajasthan');
    setIsActive(item.isActive);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    let embedId = 'dQw4w9WgXcQ';
    if (type === 'youtube' && mediaUrl.includes('v=')) {
      embedId = mediaUrl.split('v=')[1]?.split('&')[0] || 'dQw4w9WgXcQ';
    }

    if (editingItem) {
      updateMediaItem(editingItem.id, {
        type,
        title,
        caption,
        mediaUrl,
        videoUrl: videoUrl || undefined,
        embedId,
        thumbnailUrl,
        ctaLabel,
        ctaLink,
        isActive,
      });
    } else {
      addMediaItem({
        type,
        title,
        caption,
        mediaUrl,
        videoUrl: videoUrl || undefined,
        embedId,
        thumbnailUrl,
        ctaLabel,
        ctaLink,
        displayOrder: mediaItems.length + 1,
        isActive,
        placement: 'homepage_carousel',
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#12231A]">
            Media & Social Video Manager
          </h2>
          <p className="text-xs text-[#717A75]">
            Curate YouTube short films, Instagram Reels, and promotional micro-films featured immediately below the hero banner
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-[#12231A] text-[#DFCAAB] text-xs uppercase tracking-wider font-bold hover:bg-[#182F23] flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Media Slide</span>
        </button>
      </div>

      {/* Grid of Media Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mediaItems.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-[#E6DFD5] rounded-sm overflow-hidden flex flex-col justify-between shadow-sm hover:border-[#C5A880] transition-colors"
          >
            <div>
              <div className="relative aspect-video w-full overflow-hidden bg-[#182F23]">
                <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#12231A]/80 text-white text-[9px] uppercase font-bold rounded-sm flex items-center gap-1">
                  {item.type === 'youtube' ? (
                    <Youtube className="w-3 h-3 text-red-500" />
                  ) : item.type === 'instagram' ? (
                    <Instagram className="w-3 h-3 text-pink-400" />
                  ) : (
                    <Film className="w-3 h-3 text-[#DFCAAB]" />
                  )}
                  <span>{item.type}</span>
                </div>
                {item.videoUrl && (
                  <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/75 backdrop-blur-sm text-[#DFCAAB] text-[8px] uppercase tracking-wider font-mono rounded">
                    MP4 Autoplay
                  </div>
                )}
                <div className="absolute top-2 right-2 px-2 py-0.5 text-[9px] uppercase font-bold rounded-sm bg-white/90 text-[#12231A]">
                  {item.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>

              <div className="p-4">
                <h4 className="text-xs font-serif font-bold text-[#12231A] mb-1">{item.title}</h4>
                <p className="text-[11px] text-[#717A75] line-clamp-2 leading-relaxed mb-3">
                  {item.caption}
                </p>
                <div className="text-[10px] text-[#886938] font-mono">CTA: {item.ctaLabel} &rarr; {item.ctaLink}</div>
              </div>
            </div>

            <div className="p-3 border-t border-[#F4EFE6] flex items-center justify-between">
              <span className="text-[10px] text-[#717A75] font-mono">Order: #{item.displayOrder}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-1 text-[#717A75] hover:text-[#12231A] cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete media item?')) deleteMediaItem(item.id);
                  }}
                  className="p-1 text-[#717A75] hover:text-red-700 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white p-6 rounded-sm border border-[#E6DFD5] shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-serif font-bold text-[#12231A]">
                {editingItem ? 'Edit Media Item' : 'New Homepage Carousel Item'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-4 h-4 text-[#717A75]" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#717A75] uppercase mb-1">
                    Platform Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as 'youtube' | 'instagram' | 'image_banner' | 'video')}
                    className="w-full p-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs focus:outline-none"
                  >
                    <option value="video">Direct Video Stream (MP4/WebM - Autoplay & Popup Sound)</option>
                    <option value="youtube">YouTube Short / Video</option>
                    <option value="instagram">Instagram Reel</option>
                    <option value="image_banner">Promotional Video Banner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#717A75] uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={isActive ? 'yes' : 'no'}
                    onChange={(e) => setIsActive(e.target.value === 'yes')}
                    className="w-full p-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs focus:outline-none"
                  >
                    <option value="yes">Active (Visible)</option>
                    <option value="no">Inactive (Draft)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#717A75] uppercase mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. The Art of 60-Day Indian Maceration"
                  className="w-full p-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#717A75] uppercase mb-1 flex items-center justify-between">
                  <span>Direct MP4 / WebM Video URL</span>
                  <span className="text-[10px] text-[#C5A880] lowercase font-normal">(required for silent card autoplay + sound popup)</span>
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://.../video.mp4"
                  className="w-full p-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs font-mono"
                />
                <p className="text-[10px] text-[#717A75] mt-1">
                  Autoplays silently in the carousel card, and plays with audio when clicked in the luxury popup.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#717A75] uppercase mb-1">
                  External Media URL / Reel URL (Optional fallback)
                </label>
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or https://www.instagram.com/reel/..."
                  className="w-full p-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#717A75] uppercase mb-1">
                  Cover Thumbnail Image URL *
                </label>
                <input
                  type="url"
                  required
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#717A75] uppercase mb-1">
                  Caption / Narrative
                </label>
                <textarea
                  rows={2}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Short sensory description..."
                  className="w-full p-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#717A75] uppercase mb-1">
                    Call to Action Label
                  </label>
                  <input
                    type="text"
                    value={ctaLabel}
                    onChange={(e) => setCtaLabel(e.target.value)}
                    placeholder="Shop Flacon"
                    className="w-full p-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#717A75] uppercase mb-1">
                    CTA Destination Link
                  </label>
                  <input
                    type="text"
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    placeholder="/products/oud-royal-rajasthan"
                    className="w-full p-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#12231A] text-[#DFCAAB] text-xs font-bold uppercase tracking-wider"
                >
                  Save Media Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
