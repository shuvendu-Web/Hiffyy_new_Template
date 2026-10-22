import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Sliders, Eye, ArrowUp, ArrowDown, Check, Save, Sparkles } from 'lucide-react';
import { CmsSection } from '../../types';

export const CmsPageBuilder: React.FC = () => {
  const { cmsPages, updateCmsPage, setCurrentView } = useStore();
  const homePage = cmsPages.find((p) => p.slug === 'home') || cmsPages[0];

  const [sections, setSections] = useState<CmsSection[]>(homePage.sections);
  const [headline, setHeadline] = useState(
    (homePage.sections.find((s) => s.type === 'hero')?.settings.headline as string) ||
      'THE ROYAL SILLAGE'
  );
  const [subheadline, setSubheadline] = useState(
    (homePage.sections.find((s) => s.type === 'hero')?.settings.subheadline as string) ||
      'Pure Extrait de Parfum crafted from Assam Oud, Pampore Saffron & Kannauj Petrichor'
  );
  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleToggleActive = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newArr = [...sections];
    const temp = newArr[index - 1];
    newArr[index - 1] = newArr[index];
    newArr[index] = temp;
    setSections(newArr);
  };

  const handleMoveDown = (index: number) => {
    if (index === sections.length - 1) return;
    const newArr = [...sections];
    const temp = newArr[index + 1];
    newArr[index + 1] = newArr[index];
    newArr[index] = temp;
    setSections(newArr);
  };

  const handleSavePage = () => {
    const updatedSections = sections.map((s) => {
      if (s.type === 'hero') {
        return {
          ...s,
          settings: { ...s.settings, headline, subheadline },
        };
      }
      return s;
    });

    updateCmsPage(homePage.id, { sections: updatedSections });
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#12231A]">
            Dynamic Website Builder / CMS
          </h2>
          <p className="text-xs text-[#717A75]">
            Configure homepage sections, hero banners, and promotional content with instant persistence
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('storefront')}
            className="px-4 py-2 bg-white border border-[#E6DFD5] text-[#12231A] text-xs font-semibold hover:border-[#12231A] flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Storefront</span>
          </button>
          <button
            onClick={handleSavePage}
            className="px-6 py-2 bg-[#12231A] text-[#DFCAAB] text-xs uppercase tracking-wider font-bold hover:bg-[#182F23] flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Publish Changes</span>
          </button>
        </div>
      </div>

      {savedFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-sm flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>CMS configuration published to storefront successfully.</span>
        </div>
      )}

      {/* Hero Banner Editor */}
      <div className="bg-white border border-[#E6DFD5] p-6 rounded-sm shadow-sm space-y-4">
        <h3 className="text-sm font-serif font-bold text-[#12231A] uppercase tracking-wider">
          Primary Hero Banner Settings
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-[#717A75] uppercase mb-1">
              Editorial Headline *
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full p-2.5 bg-[#FAF8F5] border border-[#E6DFD5] text-xs font-serif font-bold text-[#12231A] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[#717A75] uppercase mb-1">
              Subheadline / Secondary Copy *
            </label>
            <input
              type="text"
              value={subheadline}
              onChange={(e) => setSubheadline(e.target.value)}
              className="w-full p-2.5 bg-[#FAF8F5] border border-[#E6DFD5] text-xs text-[#12231A] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Sections Reordering & Visibility Manager */}
      <div className="bg-white border border-[#E6DFD5] rounded-sm shadow-sm p-6">
        <h3 className="text-sm font-serif font-bold text-[#12231A] uppercase tracking-wider mb-2">
          Homepage Layout Architecture & Reordering
        </h3>
        <p className="text-xs text-[#717A75] mb-4">
          Enable or disable sections, reorder priority, and manage customer journey flow.
        </p>

        <div className="space-y-3">
          {sections.map((sec, idx) => (
            <div
              key={sec.id}
              className={`p-4 border rounded-sm flex items-center justify-between transition-colors ${
                sec.isActive ? 'bg-[#FAF8F5] border-[#E6DFD5]' : 'bg-gray-50 border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[#12231A] text-[#DFCAAB] text-[10px] font-bold flex items-center justify-center font-mono">
                  {idx + 1}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-[#12231A]">{sec.title}</h4>
                  <span className="text-[10px] text-[#717A75] uppercase font-mono">
                    Type: {sec.type}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Visibility Toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleActive(sec.id)}
                  className={`px-3 py-1 text-[11px] font-semibold rounded-sm cursor-pointer ${
                    sec.isActive
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {sec.isActive ? 'Visible' : 'Hidden'}
                </button>

                {/* Move buttons */}
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMoveUp(idx)}
                  className="p-1 border border-[#E6DFD5] bg-white hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === sections.length - 1}
                  onClick={() => handleMoveDown(idx)}
                  className="p-1 border border-[#E6DFD5] bg-white hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
