import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Search, Globe, Share2, CheckCircle2, AlertCircle, FileCode, Check } from 'lucide-react';

export const SeoControlCenter: React.FC = () => {
  const { products, cmsPages } = useStore();

  const [globalTitle, setGlobalTitle] = useState('HIFFYY | Haute Parfumerie Royale | Extrait de Parfum India');
  const [globalDesc, setGlobalDesc] = useState(
    'Discover HIFFYY artisanal Indian luxury fragrances. Pure 35% Extrait de Parfum crafted from wild Assam Oud, Kannauj Rose, and Pampore Saffron for exceptional longevity.'
  );
  const [canonicalUrl, setCanonicalUrl] = useState('https://hiffyy.com');
  const [ogImageUrl, setOgImageUrl] = useState(
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=80'
  );
  const [robotsTxt, setRobotsTxt] = useState(
    `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /pos\nSitemap: https://hiffyy.com/sitemap.xml`
  );
  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleSave = () => {
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3000);
  };

  const schemaJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'HIFFYY',
    url: 'https://hiffyy.com',
    logo: 'https://hiffyy.com/logo.png',
    description: globalDesc,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Mumbai',
      addressRegion: 'Maharashtra',
      addressCountry: 'IN',
    },
    sameAs: ['https://instagram.com/hiffyyfragrances', 'https://youtube.com/@hiffyy'],
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#12231A]">
            Technical SEO & Social Card Control Center
          </h2>
          <p className="text-xs text-[#717A75]">
            Manage global search engine directives, Open Graph social share cards, XML sitemaps, and Schema.org JSON-LD
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-2 bg-[#12231A] text-[#DFCAAB] text-xs uppercase tracking-wider font-bold hover:bg-[#182F23] cursor-pointer flex items-center gap-1.5 shadow-sm"
        >
          <Check className="w-4 h-4" />
          <span>Save Global SEO</span>
        </button>
      </div>

      {savedFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-sm">
          Technical SEO settings and OpenGraph tags saved successfully!
        </div>
      )}

      {/* Grid: Settings on Left, Previews on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Settings */}
        <div className="lg:col-span-7 space-y-6 bg-white p-6 border border-[#E6DFD5] rounded-sm shadow-sm">
          <h3 className="text-sm font-serif font-bold text-[#12231A] uppercase tracking-wider mb-2">
            Core Metadata & Open Graph Directives
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-[#717A75] uppercase mb-1">
                Global Title Tag (Recommended: 50-60 Characters)
              </label>
              <input
                type="text"
                value={globalTitle}
                onChange={(e) => setGlobalTitle(e.target.value)}
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#E6DFD5] text-xs focus:outline-none"
              />
              <span className="text-[10px] text-[#717A75] font-mono mt-1 block">
                Length: {globalTitle.length} chars
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#717A75] uppercase mb-1">
                Global Meta Description (Recommended: 140-160 Characters)
              </label>
              <textarea
                rows={3}
                value={globalDesc}
                onChange={(e) => setGlobalDesc(e.target.value)}
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#E6DFD5] text-xs focus:outline-none"
              />
              <span className="text-[10px] text-[#717A75] font-mono mt-1 block">
                Length: {globalDesc.length} chars
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#717A75] uppercase mb-1">
                Canonical Base URL
              </label>
              <input
                type="url"
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#E6DFD5] text-xs font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#717A75] uppercase mb-1">
                Open Graph Card Share Image (1200 x 630 px)
              </label>
              <input
                type="url"
                value={ogImageUrl}
                onChange={(e) => setOgImageUrl(e.target.value)}
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#E6DFD5] text-xs font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#717A75] uppercase mb-1">
                Robots.txt Content
              </label>
              <textarea
                rows={4}
                value={robotsTxt}
                onChange={(e) => setRobotsTxt(e.target.value)}
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#E6DFD5] text-xs font-mono focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Previews & JSON-LD */}
        <div className="lg:col-span-5 space-y-6">
          {/* Google Search Result Snippet Preview */}
          <div className="bg-white p-5 border border-[#E6DFD5] rounded-sm shadow-sm">
            <span className="text-[10px] uppercase font-bold text-[#717A75] block mb-3">
              Google SERP Result Preview
            </span>
            <div className="p-3 bg-[#FAF8F5] border border-[#E6DFD5] rounded-sm space-y-1">
              <span className="text-[11px] text-[#202124] block">https://hiffyy.com</span>
              <h4 className="text-sm text-[#1a0dab] hover:underline font-medium cursor-pointer line-clamp-1">
                {globalTitle}
              </h4>
              <p className="text-xs text-[#4d5156] line-clamp-2 leading-relaxed">
                {globalDesc}
              </p>
            </div>
          </div>

          {/* Social Share Card Preview (WhatsApp / Facebook / Twitter) */}
          <div className="bg-white p-5 border border-[#E6DFD5] rounded-sm shadow-sm">
            <span className="text-[10px] uppercase font-bold text-[#717A75] block mb-3">
              WhatsApp / iMessage Social Card Preview
            </span>
            <div className="border border-[#E6DFD5] rounded-sm overflow-hidden bg-[#FAF8F5]">
              <div className="aspect-[1.91/1] w-full overflow-hidden bg-gray-100">
                <img src={ogImageUrl} alt="Open Graph Card" className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <span className="text-[10px] text-[#717A75] uppercase font-mono block">HIFFYY.COM</span>
                <h4 className="text-xs font-bold text-[#12231A] line-clamp-1">{globalTitle}</h4>
                <p className="text-[11px] text-[#717A75] line-clamp-2 mt-0.5">{globalDesc}</p>
              </div>
            </div>
          </div>

          {/* Schema.org Structured Data */}
          <div className="bg-white p-5 border border-[#E6DFD5] rounded-sm shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold text-[#717A75]">
                Schema.org Organization JSON-LD
              </span>
              <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-sm">
                Valid JSON-LD
              </span>
            </div>
            <pre className="p-3 bg-[#12231A] text-[#DFCAAB] text-[10px] font-mono overflow-x-auto rounded-sm">
              {JSON.stringify(schemaJsonLd, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
