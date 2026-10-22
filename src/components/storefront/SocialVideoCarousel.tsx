import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { Play, Pause, ChevronLeft, ChevronRight, ExternalLink, Instagram, Youtube, Sparkles, X, Volume2 } from 'lucide-react';
import { MediaItem } from '../../types';

export const SocialVideoCarousel: React.FC = () => {
  const { mediaItems, setSelectedProduct, products } = useStore();
  const activeItems = mediaItems.filter((item) => item.isActive);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<MediaItem | null>(null);
  const videoTrackRef = useRef<HTMLDivElement>(null);

  // Autoplay with pause-on-hover / user pause
  useEffect(() => {
    if (!isPlaying || activeItems.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeItems.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPlaying, activeItems.length]);

  // Responsive no-wrap carousel: keep current item centered in track without scrolling the window/webpage
  useEffect(() => {
    const track = videoTrackRef.current;
    if (track) {
      const activeCard = track.children[currentIndex] as HTMLElement;
      if (activeCard) {
        const cardLeft = activeCard.offsetLeft;
        const cardWidth = activeCard.offsetWidth;
        const trackWidth = track.clientWidth;
        const targetScrollLeft = cardLeft - trackWidth / 2 + cardWidth / 2;
        track.scrollTo({
          left: Math.max(0, targetScrollLeft),
          behavior: 'smooth',
        });
      }
    }
  }, [currentIndex]);

  if (activeItems.length === 0) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeItems.length) % activeItems.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeItems.length);
  };

  const handleCtaClick = (ctaLink?: string) => {
    if (!ctaLink) return;
    if (ctaLink.startsWith('/products/')) {
      const slug = ctaLink.replace('/products/', '');
      const prod = products.find((p) => p.slug === slug);
      if (prod) setSelectedProduct(prod);
    } else {
      window.open(ctaLink, '_blank');
    }
  };

  return (
    <section className="bg-[#EBF2EC] border-b border-[#A0B7A3]/40 py-12 lg:py-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase font-bold text-[#12231A] mb-1.5 px-3 py-1 bg-white/60 rounded-full border border-[#A0B7A3]/40">
              <Sparkles className="w-3.5 h-3.5 text-[#96F816] fill-[#96F816]" />
              <span>Behind The Flacon & Scent Films</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#12231A] font-extrabold">
              Artisan Chronicles & Master Class
            </h2>
          </div>

          {/* Carousel Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 border border-[#A0B7A3]/60 bg-white text-[#12231A] hover:bg-[#96F816] text-xs flex items-center gap-1.5 px-3 cursor-pointer rounded-full transition-colors"
              title={isPlaying ? 'Pause auto-sliding' : 'Resume auto-sliding'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="text-[10px] tracking-wider uppercase font-bold">{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            <button
              onClick={handlePrev}
              className="p-2 border border-[#A0B7A3]/60 bg-white text-[#12231A] hover:bg-[#96F816] cursor-pointer rounded-full transition-colors"
              aria-label="Previous story"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 border border-[#A0B7A3]/60 bg-white text-[#12231A] hover:bg-[#96F816] cursor-pointer rounded-full transition-colors"
              aria-label="Next story"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Cards Responsive No-Wrap Carousel: Desktop 4, Tablet 3, Mobile 2 */}
        <div className="overflow-hidden relative">
          <div
            ref={videoTrackRef}
            className="flex flex-nowrap overflow-x-auto scroll-smooth scrollbar-none gap-4 sm:gap-6 pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {activeItems.map((item, index) => {
              const isFeatured = index === currentIndex;
              return (
                <div
                  key={item.id}
                  className={`group relative bg-white border transition-all duration-300 rounded-sm overflow-hidden flex flex-col shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] ${
                    isFeatured ? 'border-[#96F816] ring-2 ring-[#96F816]/50 shadow-xl shadow-[#96F816]/15 -translate-y-1' : 'border-[#A0B7A3]/40 hover:border-[#96F816]'
                  }`}
                >
                {/* Media Thumbnail Container with Autoplay Muted preview */}
                <div 
                  onClick={() => setSelectedVideo(item)}
                  className="relative aspect-[9/12] w-full overflow-hidden bg-[#182F23] cursor-pointer"
                >
                  {item.type === 'youtube' ? (
                    <div className="relative w-full h-full pointer-events-none">
                      <iframe
                        src={`https://www.youtube.com/embed/${item.embedId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${item.embedId}&disablekb=1&modestbranding=1`}
                        title={item.title}
                        className="w-full h-full object-cover scale-125 opacity-90 group-hover:opacity-100"
                        allow="autoplay"
                      />
                      <div className="absolute inset-0 bg-black/10" />
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-black/10" />
                    </div>
                  )}

                  {/* Badges: YouTube or Instagram */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-[#12231A]/80 backdrop-blur-sm text-white text-[10px] uppercase tracking-wider font-semibold rounded-sm">
                    {item.type === 'youtube' ? (
                      <>
                        <Youtube className="w-3.5 h-3.5 text-[#96F816]" />
                        <span>Autoplay Mute</span>
                      </>
                    ) : item.type === 'instagram' ? (
                      <>
                        <Instagram className="w-3.5 h-3.5 text-pink-400" />
                        <span>Reel Mute</span>
                      </>
                    ) : (
                      <span>Campaign</span>
                    )}
                  </div>

                  {item.duration && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 bg-black/60 text-white text-[9px] font-mono rounded-sm">
                      {item.duration}
                    </div>
                  )}

                  {/* Play with Sound Onclick Indicator Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-[#DFCAAB] text-[#12231A] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Volume2 className="w-5 h-5 text-[#12231A]" />
                    </div>
                  </div>
                </div>

                {/* Text & Action */}
                <div className="p-4 flex-1 flex flex-col justify-between bg-[#FAF8F5]">
                  <div>
                    <h3 className="text-sm font-serif font-bold text-[#12231A] line-clamp-1 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#717A75] font-light line-clamp-2 leading-relaxed mb-3">
                      {item.caption}
                    </p>
                  </div>

                  {item.ctaLabel && (
                    <button
                      onClick={() => handleCtaClick(item.ctaLink)}
                      className="w-full py-2 px-3 border border-[#12231A] text-[#12231A] hover:bg-[#12231A] hover:text-[#DFCAAB] text-[10px] tracking-wider uppercase font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>{item.ctaLabel}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </div>

      {/* Video Modal Player with Sound */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-[#12231A] border border-[#C5A880]/50 rounded-sm overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-[#182F23] text-white">
              <div className="flex items-center gap-2">
                {selectedVideo.type === 'youtube' ? (
                  <Youtube className="w-4 h-4 text-[#96F816]" />
                ) : (
                  <Instagram className="w-4 h-4 text-pink-400" />
                )}
                <span className="text-xs font-serif font-semibold">{selectedVideo.title} (Playing with Sound)</span>
              </div>
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-gray-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Embedded Player with Sound Enabled on Click */}
            <div className="relative aspect-video w-full bg-black">
              {selectedVideo.type === 'youtube' ? (
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.embedId}?autoplay=1&mute=0&rel=0`}
                  title={selectedVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 bg-gradient-to-b from-[#182F23] to-[#12231A]">
                  <Instagram className="w-12 h-12 text-[#DFCAAB] mb-4 animate-bounce" />
                  <h4 className="text-base font-serif text-white mb-2">{selectedVideo.title}</h4>
                  <p className="text-xs text-[#DFCAAB]/80 max-w-md mb-6">{selectedVideo.caption}</p>
                  <a
                    href={selectedVideo.mediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#C5A880] text-[#12231A] text-xs uppercase tracking-wider font-bold hover:bg-[#DFCAAB] transition-colors"
                  >
                    <span>Watch Reel with Audio on Instagram</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            <div className="p-4 bg-[#182F23] flex items-center justify-between">
              <span className="text-xs text-[#DFCAAB]">{selectedVideo.caption}</span>
              {selectedVideo.ctaLink && (
                <button
                  onClick={() => {
                    handleCtaClick(selectedVideo.ctaLink);
                    setSelectedVideo(null);
                  }}
                  className="px-4 py-2 bg-[#C5A880] text-[#12231A] text-[10px] uppercase font-bold tracking-wider hover:bg-[#DFCAAB] cursor-pointer"
                >
                  {selectedVideo.ctaLabel || 'Explore Product'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
