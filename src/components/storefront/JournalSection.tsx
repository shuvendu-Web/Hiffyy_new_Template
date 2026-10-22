import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Sparkles, ArrowRight, BookOpen, Clock, X, Youtube } from 'lucide-react';
import { RevealSection } from '../common/RevealSection';
import { BlogPost } from '../../types';


export const JournalSection: React.FC = () => {
  const { blogPosts } = useStore();
  const [activeArticle, setActiveArticle] = useState<BlogPost | null>(null);

  return (
    <section id="journal" className="py-20 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.25em] uppercase font-bold text-[#886938] mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>The Perfumer's Journal</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif text-[#12231A] font-light">
              Olfactory Knowledge & Heritage
            </h2>
          </div>
          <span className="text-xs text-[#717A75] font-light max-w-sm">
            Dispatches from our distillation stills in Kannauj, spice markets of Malabar, and saffron fields of Pampore.
          </span>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {blogPosts.map((post, idx) => (
            <RevealSection
              key={post.id}
              direction="up"
              delay={idx * 120}
              duration={700}
            >
              <div
                onClick={() => setActiveArticle(post)}
                className="group bg-white border border-[#E6DFD5] hover:border-[#C5A880] rounded-sm overflow-hidden flex flex-col cursor-pointer transition-all shadow-sm hover:shadow-md h-full"
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

                    <h3 className="text-lg font-serif font-bold text-[#12231A] group-hover:text-[#886938] transition-colors leading-snug mb-3">
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
            </RevealSection>
          ))}
        </div>
      </div>

      {/* Article Reader Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 bg-[#12231A]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white border border-[#E6DFD5] shadow-2xl rounded-sm p-6 sm:p-10 my-8">
            <button
              onClick={() => setActiveArticle(null)}
              className="absolute top-4 right-4 text-[#717A75] hover:text-[#12231A] p-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="max-w-2xl mx-auto">
              <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#886938] block mb-2">
                {activeArticle.category} • {activeArticle.readTime}
              </span>

              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#12231A] mb-4 leading-tight">
                {activeArticle.title}
              </h2>

              <div className="flex items-center gap-3 text-xs text-[#717A75] mb-6 pb-4 border-b border-[#E6DFD5]">
                <span>Author: {activeArticle.author}</span>
                <span>•</span>
                <span>Published: {activeArticle.publishedAt}</span>
              </div>

              <img
                src={activeArticle.featuredImage}
                alt={activeArticle.title}
                className="w-full aspect-video object-cover rounded-sm mb-6 border border-[#E6DFD5]"
              />

              <div className="prose text-xs sm:text-sm text-[#1B201E] leading-relaxed space-y-4">
                <p className="font-medium text-[#886938] italic text-sm">
                  {activeArticle.excerpt}
                </p>
                <p>{activeArticle.content}</p>
                <p>
                  To experience this botanical mastery firsthand, explore our collection of pure Extrait de Parfum flacons or order the Imperial Discovery Wardrobe.
                </p>
              </div>

              {activeArticle.youtubeUrl && (
                <div className="mt-8 p-4 bg-[#FAF8F5] border border-[#E6DFD5] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#12231A]">
                    <Youtube className="w-5 h-5 text-[#12231A]" />
                    <span>Watch Full Distillation Video on YouTube</span>
                  </div>
                  <a
                    href={activeArticle.youtubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-[#12231A] text-[#DFCAAB] text-xs font-semibold uppercase tracking-wider"
                  >
                    Watch Now
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
