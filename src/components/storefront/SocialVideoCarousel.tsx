import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Instagram,
  Youtube,
  Sparkles,
  X,
  Volume2,
  VolumeX,
  RotateCcw,
} from 'lucide-react';
import { MediaItem } from '../../types';

const formatTime = (secs: number) => {
  if (isNaN(secs) || secs < 0) return '0:00';
  const minutes = Math.floor(secs / 60);
  const seconds = Math.floor(secs % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

export const SocialVideoCarousel: React.FC = () => {
  const { mediaItems, setSelectedProduct, products } = useStore();
  const activeItems = mediaItems.filter((item) => item.isActive);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<MediaItem | null>(null);
  const videoTrackRef = useRef<HTMLDivElement>(null);

  // Popup Video Player State
  const popupVideoRef = useRef<HTMLVideoElement>(null);
  const [isPopupPlaying, setIsPopupPlaying] = useState(true);
  const [isPopupMuted, setIsPopupMuted] = useState(false);
  const [popupVolume, setPopupVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Autoplay with pause-on-hover / user pause
  useEffect(() => {
    if (!isPlaying || activeItems.length <= 1 || selectedVideo !== null) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeItems.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPlaying, activeItems.length, selectedVideo]);

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

  // Handle Video in Popup (Play with Sound upon click)
  useEffect(() => {
    if (selectedVideo) {
      setIsPopupPlaying(true);
      setIsPopupMuted(false);
      setPopupVolume(1);
      setCurrentTime(0);

      // Attempt to play with sound immediately when modal mounts
      if (popupVideoRef.current) {
        popupVideoRef.current.currentTime = 0;
        popupVideoRef.current.muted = false;
        popupVideoRef.current.volume = 1;
        const playPromise = popupVideoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('Browser required explicit audio gesture, waiting for user:', err);
            // Fallback: start muted if browser blocked unmuted autoplay
            setIsPopupMuted(true);
            if (popupVideoRef.current) {
              popupVideoRef.current.muted = true;
              popupVideoRef.current.play().catch(() => {});
            }
          });
        }
      }
    }
  }, [selectedVideo]);

  // Keyboard accessibility: Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedVideo) {
        setSelectedVideo(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedVideo]);

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

  const togglePopupPlay = () => {
    if (popupVideoRef.current) {
      if (isPopupPlaying) {
        popupVideoRef.current.pause();
        setIsPopupPlaying(false);
      } else {
        popupVideoRef.current.play().then(() => setIsPopupPlaying(true)).catch(() => {});
      }
    }
  };

  const togglePopupMute = () => {
    if (popupVideoRef.current) {
      const nextMuted = !isPopupMuted;
      popupVideoRef.current.muted = nextMuted;
      setIsPopupMuted(nextMuted);
      if (!nextMuted && popupVolume === 0) {
        popupVideoRef.current.volume = 0.8;
        setPopupVolume(0.8);
      }
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
                  {/* Media Video Container: All video cards auto-play without sound */}
                  <div
                    onClick={() => setSelectedVideo(item)}
                    className="relative aspect-[9/12] w-full overflow-hidden bg-[#0B1510] cursor-pointer group"
                  >
                    {item.videoUrl ? (
                      <video
                        src={item.videoUrl}
                        poster={item.thumbnailUrl}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                      />
                    ) : item.type === 'youtube' && item.embedId ? (
                      <div className="relative w-full h-full pointer-events-none">
                        <iframe
                          src={`https://www.youtube-nocookie.com/embed/${item.embedId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${item.embedId}&disablekb=1&modestbranding=1&playsinline=1&rel=0`}
                          title={item.title}
                          className="w-full h-full object-cover scale-125 opacity-90 group-hover:opacity-100 pointer-events-none"
                          allow="autoplay; encrypted-media"
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

                    {/* Top Badges: Muted Auto-Play & Duration */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-0.5 bg-[#12231A]/85 backdrop-blur-md text-white text-[9px] uppercase tracking-wider font-bold rounded-xs border border-white/10 shadow-sm">
                      <VolumeX className="w-3 h-3 text-[#96F816]" />
                      <span>Muted Preview</span>
                    </div>

                    {item.duration && (
                      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-black/75 backdrop-blur-md text-[#DFCAAB] text-[9px] font-mono font-bold rounded-xs border border-white/10">
                        {item.duration}
                      </div>
                    )}

                    {/* Play with Sound Onclick Overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/25 group-hover:bg-black/45 transition-colors p-3 text-center">
                      <div className="w-12 h-12 rounded-full bg-[#12231A]/90 border border-[#96F816]/70 text-[#96F816] flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-[#96F816] group-hover:text-[#12231A] group-hover:border-[#96F816] transition-all duration-300">
                        <Volume2 className="w-5 h-5 group-hover:hidden transition-transform" />
                        <Play className="w-5 h-5 fill-current ml-0.5 hidden group-hover:block transition-transform" />
                      </div>
                      <div className="mt-2.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-sm text-white text-[9px] tracking-wider uppercase font-bold border border-white/20 group-hover:border-[#96F816] group-hover:text-[#96F816] transition-all shadow-md">
                        Click to Play with Sound
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

      {/* Video Modal Player with Sound (Pop-up upon click) */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl bg-[#0E1A14] border border-[#C5A880]/60 rounded-sm overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-[#1E3A2B] bg-[#12231A] text-white shrink-0">
              <div className="flex items-center gap-2.5 truncate mr-3">
                <div className="w-6 h-6 rounded-full bg-[#96F816]/20 border border-[#96F816] flex items-center justify-center shrink-0">
                  <Volume2 className="w-3.5 h-3.5 text-[#96F816]" />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-serif font-bold text-white truncate">
                      {selectedVideo.title}
                    </h3>
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.2 bg-[#96F816]/15 text-[#96F816] text-[9px] rounded-xs font-mono font-bold border border-[#96F816]/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#96F816] animate-pulse" />
                      Sound Enabled
                    </span>
                  </div>
                  <p className="text-[10px] text-[#A0B7A3] font-mono truncate">
                    HIFFYY Cinema & Master Class • Playing with Audio
                  </p>
                </div>
              </div>

              {/* Audio Equalizer visualizer & Close button */}
              <div className="flex items-center gap-3 shrink-0">
                {/* Visualizer bars */}
                <div className="hidden sm:flex items-end gap-0.5 h-4 w-6 px-1" title="Sound is active">
                  <span className="w-1 bg-[#96F816] rounded-xs animate-pulse h-3" />
                  <span className="w-1 bg-[#96F816] rounded-xs animate-pulse h-4" />
                  <span className="w-1 bg-[#96F816] rounded-xs animate-pulse h-2" />
                  <span className="w-1 bg-[#96F816] rounded-xs animate-pulse h-3.5" />
                </div>

                <button
                  onClick={() => setSelectedVideo(null)}
                  className="w-8 h-8 rounded-full hover:bg-white/10 text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close video player"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Video Viewport with Sound */}
            <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
              {selectedVideo.videoUrl ? (
                <div className="relative w-full h-full flex items-center justify-center bg-black group/player">
                  <video
                    ref={popupVideoRef}
                    src={selectedVideo.videoUrl}
                    autoPlay
                    playsInline
                    loop
                    onTimeUpdate={() => {
                      if (popupVideoRef.current) {
                        setCurrentTime(popupVideoRef.current.currentTime);
                        setDuration(popupVideoRef.current.duration || 0);
                      }
                    }}
                    onLoadedMetadata={() => {
                      if (popupVideoRef.current) {
                        popupVideoRef.current.muted = false;
                        popupVideoRef.current.volume = popupVolume;
                        setDuration(popupVideoRef.current.duration || 0);
                        popupVideoRef.current.play().catch(() => {
                          setIsPopupMuted(true);
                        });
                      }
                    }}
                    className="w-full h-full object-contain"
                  />

                  {/* Tap to Unmute Banner if browser auto-mute occurred */}
                  {isPopupMuted && (
                    <button
                      onClick={togglePopupMute}
                      className="absolute top-4 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 px-4 py-2 bg-[#96F816] text-[#12231A] text-xs font-bold uppercase tracking-wider rounded-full shadow-2xl flex items-center justify-center gap-2 animate-bounce cursor-pointer z-30"
                    >
                      <Volume2 className="w-4 h-4 text-[#12231A]" />
                      <span>Tap to Unmute Audio</span>
                    </button>
                  )}

                  {/* Audio & Playback Controls Overlay Bar */}
                  <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/95 via-black/60 to-transparent flex flex-col gap-2 transition-opacity z-20">
                    {/* Progress Scrubber */}
                    <input
                      type="range"
                      min="0"
                      max={duration || 100}
                      value={currentTime}
                      onChange={(e) => {
                        const targetTime = Number(e.target.value);
                        if (popupVideoRef.current) {
                          popupVideoRef.current.currentTime = targetTime;
                          setCurrentTime(targetTime);
                        }
                      }}
                      className="w-full accent-[#96F816] h-1.5 cursor-pointer bg-white/20 rounded-lg"
                    />

                    <div className="flex items-center justify-between text-white text-xs">
                      <div className="flex items-center gap-3">
                        {/* Play/Pause */}
                        <button
                          onClick={togglePopupPlay}
                          className="p-1 hover:text-[#96F816] transition-colors cursor-pointer"
                          title={isPopupPlaying ? 'Pause' : 'Play'}
                        >
                          {isPopupPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                        </button>

                        {/* Volume / Mute Toggle */}
                        <button
                          onClick={togglePopupMute}
                          className="p-1 hover:text-[#96F816] transition-colors cursor-pointer flex items-center gap-1"
                          title={isPopupMuted ? 'Unmute' : 'Mute'}
                        >
                          {isPopupMuted || popupVolume === 0 ? (
                            <VolumeX className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Volume2 className="w-4 h-4 text-[#96F816]" />
                          )}
                        </button>

                        {/* Volume Slider */}
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={isPopupMuted ? 0 : popupVolume}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            setPopupVolume(v);
                            if (popupVideoRef.current) {
                              popupVideoRef.current.volume = v;
                              popupVideoRef.current.muted = v === 0;
                              setIsPopupMuted(v === 0);
                            }
                          }}
                          className="w-16 sm:w-24 accent-[#96F816] h-1 cursor-pointer bg-white/20 rounded-lg"
                        />

                        {/* Time indicator */}
                        <span className="text-[10px] font-mono text-gray-300">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>

                      {/* Sound status pill */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#96F816] font-mono font-bold flex items-center gap-1">
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>AUDIO ON</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : selectedVideo.type === 'youtube' ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${selectedVideo.embedId}?autoplay=1&mute=0&controls=1&rel=0&playsinline=1`}
                  title={selectedVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-gradient-to-b from-[#182F23] to-[#12231A] text-white">
                  <Instagram className="w-10 h-10 text-pink-400 mb-3 animate-pulse" />
                  <h4 className="text-sm font-serif font-bold mb-1.5">{selectedVideo.title}</h4>
                  <p className="text-xs text-gray-300 max-w-md mb-4">{selectedVideo.caption}</p>
                  <a
                    href={selectedVideo.mediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#96F816] text-[#12231A] text-xs font-bold uppercase tracking-wider hover:bg-[#85e110] transition-colors rounded-xs flex items-center gap-1.5"
                  >
                    <span>Watch Reel with Audio on Instagram</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Modal Footer Bar */}
            <div className="p-3.5 sm:p-4 bg-[#12231A] border-t border-[#1E3A2B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <p className="text-xs text-[#DFCAAB] line-clamp-1 flex-1 font-light">
                {selectedVideo.caption}
              </p>
              {selectedVideo.ctaLink && (
                <button
                  onClick={() => {
                    handleCtaClick(selectedVideo.ctaLink);
                    setSelectedVideo(null);
                  }}
                  className="px-4 py-2 bg-[#96F816] text-[#12231A] text-xs uppercase font-bold tracking-wider hover:bg-[#85e110] transition-colors rounded-xs shrink-0 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>{selectedVideo.ctaLabel || 'Shop Scent Flacon'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
