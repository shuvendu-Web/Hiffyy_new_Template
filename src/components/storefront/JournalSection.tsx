import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../../context/StoreContext';
import { Sparkles, ArrowRight, BookOpen, Clock, X, Youtube, ChevronLeft, ChevronRight, Pause, Play, Share2 } from 'lucide-react';
import { RevealSection } from '../common/RevealSection';
import { BlogPost } from '../../types';

export const JournalSection: React.FC = () => {
  const { blogPosts } = useStore();
  const [activeArticle, setActiveArticle] = useState<BlogPost | null>(null);

  // Responsive Carousel State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Body scroll lock & Escape key listener for Article Reader Modal
  useEffect(() => {
    if (activeArticle) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setActiveArticle(null);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [activeArticle]);

  // Detect Mobile Viewport (< 768px: 1 card, >= 768px: 2 cards)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const visibleCount = isMobile ? 1 : 2;
  const maxIndex = Math.max(0, blogPosts.length - visibleCount);

  // Auto carousel effect with smooth timer (4000ms)
  useEffect(() => {
    if (isPaused || blogPosts.length <= visibleCount) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 4000);

    return () => clearInterval(timer);
  }, [isPaused, maxIndex, blogPosts.length, visibleCount]);

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  return (
    <section id="journal" className="py-20 bg-[#FAF8F5] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Navigation Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.25em] uppercase font-bold text-[#886938] mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>The Perfumer's Journal</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif text-[#12231A] font-light">
              Olfactory Knowledge & Heritage
            </h2>
            <p className="text-xs text-[#717A75] font-light max-w-md mt-2">
              Dispatches from our distillation stills in Kannauj, spice markets of Malabar, and saffron fields of Pampore.
            </p>
          </div>

          {/* Carousel Arrows & Controls */}
          {blogPosts.length > visibleCount && (
            <div className="flex items-center gap-3 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                className="p-2 rounded-full border border-[#E6DFD5] bg-white text-[#717A75] hover:text-[#12231A] hover:border-[#12231A] transition-colors cursor-pointer text-xs"
                title={isPaused ? 'Resume auto-play' : 'Pause auto-play'}
              >
                {isPaused ? <Play className="w-3.5 h-3.5 fill-[#12231A]" /> : <Pause className="w-3.5 h-3.5" />}
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={goToPrev}
                  className="w-10 h-10 rounded-full border border-[#E6DFD5] bg-white text-[#12231A] hover:bg-[#12231A] hover:text-[#DFCAAB] flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Previous Journal Article"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={goToNext}
                  className="w-10 h-10 rounded-full border border-[#E6DFD5] bg-white text-[#12231A] hover:bg-[#12231A] hover:text-[#DFCAAB] flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Next Journal Article"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Carousel Viewport (Showing 2 Cards on Desktop, 1 Card on Mobile, Auto-Carouseling the rest) */}
        <div
          className="relative overflow-hidden -mx-2 sm:-mx-3"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className="flex transition-transform duration-700 ease-out"
            style={{
              transform: isMobile
                ? `translateX(-${currentIndex * 100}%)`
                : `translateX(-${currentIndex * 50}%)`,
            }}
          >
            {blogPosts.map((post) => (
              <div
                key={post.id}
                className="w-full md:w-1/2 shrink-0 px-2 sm:px-3"
              >
                <div
                  onClick={() => setActiveArticle(post)}
                  className="group bg-white border border-[#E6DFD5] hover:border-[#C5A880] rounded-sm overflow-hidden flex flex-col cursor-pointer transition-all shadow-sm hover:shadow-md h-full select-none"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#182F23]">
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#12231A]/80 backdrop-blur-sm text-white text-[10px] uppercase tracking-wider font-semibold">
                      {post.category}
                    </div>
                    {post.youtubeUrl && (
                      <div className="absolute top-3 right-3 px-2.5 py-1 bg-[#12231A]/90 text-[#96F816] border border-[#96F816]/30 text-[10px] font-bold flex items-center gap-1 shadow-sm">
                        <Youtube className="w-3 h-3 text-[#96F816]" />
                        <span>Video Essay</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 text-[11px] text-[#717A75] mb-2 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readTime}
                        </span>
                        <span>•</span>
                        <span>{post.publishedAt}</span>
                      </div>

                      <h3 className="text-lg font-serif font-bold text-[#12231A] group-hover:text-[#886938] transition-colors leading-snug mb-3 line-clamp-2">
                        {post.title}
                      </h3>

                      <p className="text-xs text-[#717A75] font-light leading-relaxed line-clamp-3 mb-6">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#F4EFE6] flex items-center justify-between text-xs font-semibold text-[#12231A]">
                      <span className="text-[#886938] text-[11px]">By {post.author}</span>
                      <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform text-[#12231A]">
                        <span>Read Article</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots Pagination Indicators */}
        {blogPosts.length > visibleCount && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentIndex === idx
                    ? 'w-6 bg-[#12231A]'
                    : 'w-2 bg-[#E6DFD5] hover:bg-[#886938]'
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Article Reader Modal using createPortal to escape parent transform and overflow:hidden */}
      {activeArticle &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
            onClick={() => setActiveArticle(null)}
          >
            <div
              className="relative w-full max-w-3xl bg-white border border-[#E6DFD5] shadow-2xl rounded-sm p-6 sm:p-10 my-auto max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveArticle(null)}
                aria-label="Close article modal"
                className="absolute top-4 right-4 text-[#717A75] hover:text-[#12231A] hover:bg-[#FAF8F5] p-2 rounded-full border border-transparent hover:border-[#E6DFD5] transition-all cursor-pointer z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-[#886938] bg-[#FAF8F5] px-2.5 py-1 border border-[#E6DFD5] rounded-sm">
                    {activeArticle.category}
                  </span>
                  <span className="text-[11px] text-[#717A75] font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#C5A880]" />
                    {activeArticle.readTime}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#12231A] mb-4 leading-tight">
                  {activeArticle.title}
                </h2>

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#717A75] pb-5 border-b border-[#E6DFD5] mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#12231A] text-[#DFCAAB] text-[10px] font-serif font-bold flex items-center justify-center">
                      {activeArticle.author.charAt(0)}
                    </div>
                    <div>
                      <span className="font-semibold text-[#12231A] block">{activeArticle.author}</span>
                      <span className="text-[10px] text-[#886938]">Master Perfumer & Botanical Historian</span>
                    </div>
                  </div>
                  <div className="text-[11px] font-mono text-[#717A75]">
                    Published: {activeArticle.publishedAt}
                  </div>
                </div>

                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-sm mb-6 border border-[#E6DFD5] bg-[#182F23]">
                  <img
                    src={activeArticle.featuredImage}
                    alt={activeArticle.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 backdrop-blur-sm text-white/90 text-[10px] font-mono">
                    HIFFYY Botanical Archive
                  </div>
                </div>

                <div className="prose text-xs sm:text-sm text-[#1B201E] leading-relaxed space-y-4">
                  <p className="font-serif italic text-base sm:text-lg text-[#886938] leading-relaxed border-l-2 border-[#C5A880] pl-4 my-4">
                    "{activeArticle.excerpt}"
                  </p>
                  <p className="first-letter:text-4xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-2 first-letter:text-[#12231A]">
                    {activeArticle.content}
                  </p>
                  <p>
                    Every formulation honors ancient steam-distillation rituals handed down over five centuries. We source only wild-harvested botanicals from sustainable estates across the Indian subcontinent and Arabia.
                  </p>
                  <p>
                    To experience this olfactory mastery firsthand, explore our collection of pure Extrait de Parfum flacons or acquire the Imperial Discovery Wardrobe.
                  </p>
                </div>

                {/* YouTube Video Essay CTA if present */}
                {activeArticle.youtubeUrl && (
                  <div className="mt-8 p-4 bg-[#FAF8F5] border border-[#E6DFD5] rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5 text-xs font-semibold text-[#12231A]">
                      <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                        <Youtube className="w-4 h-4" />
                      </div>
                      <div>
                        <div>Visual Distillation Documentary</div>
                        <div className="text-[10px] text-[#717A75] font-normal">Available in 4K Cinema Audio</div>
                      </div>
                    </div>
                    <a
                      href={activeArticle.youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-[#12231A] text-[#DFCAAB] text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#182F23] text-center"
                    >
                      Watch Video Essay &rarr;
                    </a>
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-[#E6DFD5] flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-[#717A75] tracking-wider">
                    HIFFYY JOURNAL DISPATCH
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveArticle(null)}
                    className="px-5 py-2 bg-[#12231A] text-[#DFCAAB] text-xs uppercase font-bold tracking-wider hover:bg-[#182F23] cursor-pointer"
                  >
                    Close Article
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
};
