import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Upload,
  Image as ImageIcon,
  Check,
  RotateCcw,
  Sliders,
  Sparkles,
  Link,
  Eye,
  Trash2,
  Save,
  Palette,
  Layers,
  ArrowRight,
  ExternalLink,
  Globe,
  X,
} from 'lucide-react';
import { ImageUploadModal } from './ImageUploadModal';
import { BrandLogo, HiffyyWordmarkSvg } from '../storefront/BrandLogo';

export const BrandLogoManager: React.FC = () => {
  const { brandLogos, updateBrandLogos, resetBrandLogos, setCurrentView } = useStore();

  const [headerLogo, setHeaderLogo] = useState(brandLogos.headerLogo || '');
  const [footerLogo, setFooterLogo] = useState(brandLogos.footerLogo || '');
  const [floatingLogo, setFloatingLogo] = useState(brandLogos.floatingLogo || '');
  const [faviconIcon, setFaviconIcon] = useState(brandLogos.faviconIcon || '');

  const [headerLogoHeight, setHeaderLogoHeight] = useState(brandLogos.headerLogoHeight || 32);
  const [footerLogoHeight, setFooterLogoHeight] = useState(brandLogos.footerLogoHeight || 40);
  const [floatingLogoSize, setFloatingLogoSize] = useState(brandLogos.floatingLogoSize || 34);

  const [logoAltText, setLogoAltText] = useState(brandLogos.logoAltText || 'HIFFYY Haute Parfumerie Royale');

  const [enableCustomHeaderLogo, setEnableCustomHeaderLogo] = useState(brandLogos.enableCustomHeaderLogo);
  const [enableCustomFooterLogo, setEnableCustomFooterLogo] = useState(brandLogos.enableCustomFooterLogo);
  const [enableCustomFloatingLogo, setEnableCustomFloatingLogo] = useState(brandLogos.enableCustomFloatingLogo);
  const [enableCustomFavicon, setEnableCustomFavicon] = useState(brandLogos.enableCustomFavicon ?? false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeUploadTarget, setActiveUploadTarget] = useState<'header' | 'footer' | 'floating' | 'favicon' | null>(null);
  const [savedToast, setSavedToast] = useState(false);
  const [isUploading, setIsUploading] = useState<string | null>(null);

  // Direct file input handler that uploads to server /api/upload
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'header' | 'footer' | 'floating' | 'favicon'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(target);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target?.result as string;
        try {
          // Attempt uploading to server disk endpoint
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image: base64Data,
              filename: `logo_${target}_${Date.now()}.${file.name.split('.').pop() || 'png'}`,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.url) {
              applyLogoUrl(target, data.url);
              return;
            }
          }
        } catch {
          // Fallback to base64 if server upload endpoint is unavailable
        }
        applyLogoUrl(target, base64Data);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(null);
    }
  };

  const applyLogoUrl = (target: 'header' | 'footer' | 'floating' | 'favicon', url: string) => {
    if (target === 'header') {
      setHeaderLogo(url);
      setEnableCustomHeaderLogo(true);
      updateBrandLogos({ headerLogo: url, enableCustomHeaderLogo: true });
    } else if (target === 'footer') {
      setFooterLogo(url);
      setEnableCustomFooterLogo(true);
      updateBrandLogos({ footerLogo: url, enableCustomFooterLogo: true });
    } else if (target === 'floating') {
      setFloatingLogo(url);
      setEnableCustomFloatingLogo(true);
      updateBrandLogos({ floatingLogo: url, enableCustomFloatingLogo: true });
    } else if (target === 'favicon') {
      setFaviconIcon(url);
      setEnableCustomFavicon(true);
      updateBrandLogos({ faviconIcon: url, enableCustomFavicon: true });
    }
  };

  const handleSaveAll = () => {
    updateBrandLogos({
      headerLogo,
      footerLogo,
      floatingLogo,
      faviconIcon,
      headerLogoHeight,
      footerLogoHeight,
      floatingLogoSize,
      logoAltText,
      enableCustomHeaderLogo,
      enableCustomFooterLogo,
      enableCustomFloatingLogo,
      enableCustomFavicon,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handleResetToDefaults = () => {
    if (confirm('Restore the default official HIFFYY vector neon SVG logos and favicon?')) {
      resetBrandLogos();
      setHeaderLogo('');
      setFooterLogo('');
      setFloatingLogo('');
      setFaviconIcon('');
      setHeaderLogoHeight(32);
      setFooterLogoHeight(40);
      setFloatingLogoSize(34);
      setEnableCustomHeaderLogo(false);
      setEnableCustomFooterLogo(false);
      setEnableCustomFloatingLogo(false);
      setEnableCustomFavicon(false);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2500);
    }
  };

  const openMediaModalFor = (target: 'header' | 'footer' | 'floating' | 'favicon') => {
    setActiveUploadTarget(target);
    setIsModalOpen(true);
  };


  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E6DFD5] gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#12231A] text-[#96F816] rounded-full text-[10px] tracking-widest uppercase font-bold mb-2">
            <Palette className="w-3.5 h-3.5" />
            <span>Brand Assets & Visual Identity</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#12231A]">
            Header, Footer & Floating Logo Studio
          </h1>
          <p className="text-xs text-[#717A75] mt-1 font-light max-w-2xl leading-relaxed">
            Upload custom high-resolution logos, transparent SVGs, or wordmarks for your storefront
            Header, Dark Luxury Footer, and Floating Brand Mark. Changes reflect across all customer devices immediately.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetToDefaults}
            className="px-4 py-2.5 bg-white border border-[#E6DFD5] hover:border-[#12231A] text-[#12231A] text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            title="Restore default neon vector wordmarks"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Defaults</span>
          </button>

          <button
            onClick={handleSaveAll}
            className="px-5 py-2.5 bg-[#12231A] hover:bg-[#96F816] text-[#96F816] hover:text-[#12231A] text-xs uppercase tracking-wider font-extrabold rounded-lg transition-all cursor-pointer flex items-center gap-2 shadow-md active:scale-95"
          >
            {savedToast ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Saved & Live!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Logo Settings</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Global Alt Text Setting */}
      <div className="bg-white p-5 rounded-xl border border-[#E6DFD5] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#12231A]">
            Brand Accessibility & SEO Alt Text
          </h3>
          <p className="text-[11px] text-[#717A75]">
            HTML alt attribute applied to all logo images for search engines and screen readers.
          </p>
        </div>
        <div className="w-full sm:w-96">
          <input
            type="text"
            value={logoAltText}
            onChange={(e) => setLogoAltText(e.target.value)}
            placeholder="HIFFYY Haute Parfumerie Royale"
            className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs rounded-lg text-[#12231A] font-medium focus:outline-none focus:border-[#12231A]"
          />
        </div>
      </div>

      {/* 4 Main Brand Asset Upload Cards Grid (Header, Footer, Floating Mark, Favicon) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* ===================== CARD 1: HEADER LOGO ===================== */}
        <div className="bg-white rounded-2xl border border-[#E6DFD5] p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            {/* Card Header & Toggle */}
            <div className="flex items-center justify-between pb-4 border-b border-[#F4EFE6] mb-5">
              <div>
                <span className="text-[10px] tracking-wider uppercase font-bold text-[#886938] block">
                  Top Navbar & Hero Header
                </span>
                <h3 className="text-base font-serif font-bold text-[#12231A]">
                  1. Header Logo
                </h3>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enableCustomHeaderLogo}
                  onChange={(e) => setEnableCustomHeaderLogo(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#12231A]" />
                <span className="text-[10px] font-bold uppercase text-[#12231A]">
                  {enableCustomHeaderLogo ? 'Custom' : 'Default'}
                </span>
              </label>
            </div>

            {/* Live Preview Box */}
            <div className="mb-5">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#717A75] block mb-2">
                Header Live Preview (Dark Pill on Sage)
              </span>
              <div className="p-4 bg-[#A0B7A3] rounded-xl flex items-center justify-center border border-[#8BA68F]/50 shadow-inner min-h-[90px]">
                {enableCustomHeaderLogo && headerLogo ? (
                  <div className="bg-[#12231A] px-4 py-2 rounded-full border border-[#96F816]/40 shadow-sm flex items-center justify-center">
                    <img
                      src={headerLogo}
                      alt="Header Logo Preview"
                      className="w-auto object-contain"
                      style={{ height: `${headerLogoHeight}px` }}
                    />
                  </div>
                ) : (
                  <div className="bg-[#12231A] px-4 py-2 rounded-full border border-[#96F816]/40 shadow-sm flex items-center justify-center">
                    <HiffyyWordmarkSvg className="h-4 sm:h-5 w-auto" color="#96F816" />
                  </div>
                )}
              </div>
            </div>

            {/* Upload & Input Controls */}
            <div className="space-y-4">
              {/* Direct File Dropzone */}
              <div>
                <label className="block text-[11px] font-bold text-[#12231A] uppercase tracking-wider mb-1.5">
                  Upload Logo File (PNG / SVG / WebP)
                </label>
                <div className="relative border-2 border-dashed border-[#E6DFD5] hover:border-[#12231A] rounded-xl p-4 text-center bg-[#FAF8F5] transition-colors cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'header')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-5 h-5 mx-auto text-[#717A75] group-hover:text-[#12231A] mb-1.5 transition-colors" />
                  <span className="text-xs font-semibold text-[#12231A] block">
                    {isUploading === 'header' ? 'Uploading...' : 'Browse from computer'}
                  </span>
                  <span className="text-[10px] text-[#717A75]">Transparent background recommended</span>
                </div>
              </div>

              {/* Or Media Studio Button */}
              <button
                type="button"
                onClick={() => openMediaModalFor('header')}
                className="w-full py-2 px-3 bg-[#EBF2EC] hover:bg-[#12231A] hover:text-[#96F816] text-[#12231A] text-xs font-bold rounded-lg border border-[#A0B7A3]/40 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#96F816]" />
                <span>Open Media Studio / AI Generator</span>
              </button>

              {/* URL Input */}
              <div>
                <label className="block text-[10px] font-bold text-[#717A75] uppercase tracking-wider mb-1">
                  Or Paste Direct Image URL
                </label>
                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <Link className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#717A75]" />
                    <input
                      type="text"
                      value={headerLogo}
                      onChange={(e) => {
                        setHeaderLogo(e.target.value);
                        if (e.target.value) setEnableCustomHeaderLogo(true);
                      }}
                      placeholder="https://example.com/logo-header.png"
                      className="w-full pl-9 pr-3 py-1.5 bg-[#FAF8F5] border border-[#E6DFD5] text-xs rounded-lg text-[#12231A] focus:outline-none focus:border-[#12231A]"
                    />
                  </div>
                  {headerLogo && (
                    <button
                      type="button"
                      onClick={() => {
                        setHeaderLogo('');
                        setEnableCustomHeaderLogo(false);
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                      title="Clear custom logo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Height Adjuster Slider */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-[#12231A] flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-[#886938]" />
                    Display Height
                  </span>
                  <span className="font-mono text-[11px] text-[#717A75]">{headerLogoHeight}px</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="60"
                  step="2"
                  value={headerLogoHeight}
                  onChange={(e) => setHeaderLogoHeight(Number(e.target.value))}
                  className="w-full accent-[#12231A] cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ===================== CARD 2: FOOTER LOGO ===================== */}
        <div className="bg-white rounded-2xl border border-[#E6DFD5] p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            {/* Card Header & Toggle */}
            <div className="flex items-center justify-between pb-4 border-b border-[#F4EFE6] mb-5">
              <div>
                <span className="text-[10px] tracking-wider uppercase font-bold text-[#886938] block">
                  Dark Luxury Storefront Footer
                </span>
                <h3 className="text-base font-serif font-bold text-[#12231A]">
                  2. Footer Logo
                </h3>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enableCustomFooterLogo}
                  onChange={(e) => setEnableCustomFooterLogo(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#12231A]" />
                <span className="text-[10px] font-bold uppercase text-[#12231A]">
                  {enableCustomFooterLogo ? 'Custom' : 'Default'}
                </span>
              </label>
            </div>

            {/* Live Preview Box */}
            <div className="mb-5">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#717A75] block mb-2">
                Footer Live Preview (Deep Forest #12231A)
              </span>
              <div className="p-4 bg-[#12231A] rounded-xl flex flex-col items-center justify-center border border-[#182F23] shadow-inner min-h-[90px]">
                {enableCustomFooterLogo && footerLogo ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={footerLogo}
                      alt="Footer Logo Preview"
                      className="w-auto object-contain mb-1"
                      style={{ height: `${footerLogoHeight}px` }}
                    />
                    <span className="text-[8px] uppercase tracking-[0.3em] text-white/60 font-semibold">
                      Haute Parfumerie Royale
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <HiffyyWordmarkSvg className="h-7 sm:h-8 w-auto mb-1" color="#96F816" />
                    <span className="text-[8px] uppercase tracking-[0.3em] text-white/60 font-semibold">
                      Haute Parfumerie Royale
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Upload & Input Controls */}
            <div className="space-y-4">
              {/* Direct File Dropzone */}
              <div>
                <label className="block text-[11px] font-bold text-[#12231A] uppercase tracking-wider mb-1.5">
                  Upload Logo File (PNG / SVG / WebP)
                </label>
                <div className="relative border-2 border-dashed border-[#E6DFD5] hover:border-[#12231A] rounded-xl p-4 text-center bg-[#FAF8F5] transition-colors cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'footer')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-5 h-5 mx-auto text-[#717A75] group-hover:text-[#12231A] mb-1.5 transition-colors" />
                  <span className="text-xs font-semibold text-[#12231A] block">
                    {isUploading === 'footer' ? 'Uploading...' : 'Browse from computer'}
                  </span>
                  <span className="text-[10px] text-[#717A75]">Light/white or neon graphic recommended</span>
                </div>
              </div>

              {/* Or Media Studio Button */}
              <button
                type="button"
                onClick={() => openMediaModalFor('footer')}
                className="w-full py-2 px-3 bg-[#EBF2EC] hover:bg-[#12231A] hover:text-[#96F816] text-[#12231A] text-xs font-bold rounded-lg border border-[#A0B7A3]/40 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#96F816]" />
                <span>Open Media Studio / AI Generator</span>
              </button>

              {/* URL Input */}
              <div>
                <label className="block text-[10px] font-bold text-[#717A75] uppercase tracking-wider mb-1">
                  Or Paste Direct Image URL
                </label>
                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <Link className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#717A75]" />
                    <input
                      type="text"
                      value={footerLogo}
                      onChange={(e) => {
                        setFooterLogo(e.target.value);
                        if (e.target.value) setEnableCustomFooterLogo(true);
                      }}
                      placeholder="https://example.com/logo-footer.png"
                      className="w-full pl-9 pr-3 py-1.5 bg-[#FAF8F5] border border-[#E6DFD5] text-xs rounded-lg text-[#12231A] focus:outline-none focus:border-[#12231A]"
                    />
                  </div>
                  {footerLogo && (
                    <button
                      type="button"
                      onClick={() => {
                        setFooterLogo('');
                        setEnableCustomFooterLogo(false);
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                      title="Clear custom logo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Height Adjuster Slider */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-[#12231A] flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-[#886938]" />
                    Display Height
                  </span>
                  <span className="font-mono text-[11px] text-[#717A75]">{footerLogoHeight}px</span>
                </div>
                <input
                  type="range"
                  min="24"
                  max="80"
                  step="2"
                  value={footerLogoHeight}
                  onChange={(e) => setFooterLogoHeight(Number(e.target.value))}
                  className="w-full accent-[#12231A] cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ===================== CARD 3: FLOATING LOGO ===================== */}
        <div className="bg-white rounded-2xl border border-[#E6DFD5] p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            {/* Card Header & Toggle */}
            <div className="flex items-center justify-between pb-4 border-b border-[#F4EFE6] mb-5">
              <div>
                <span className="text-[10px] tracking-wider uppercase font-bold text-[#886938] block">
                  Quick Dock & Floating Badges
                </span>
                <h3 className="text-base font-serif font-bold text-[#12231A]">
                  3. Floating Brand Logo
                </h3>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enableCustomFloatingLogo}
                  onChange={(e) => setEnableCustomFloatingLogo(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#12231A]" />
                <span className="text-[10px] font-bold uppercase text-[#12231A]">
                  {enableCustomFloatingLogo ? 'Custom' : 'Default'}
                </span>
              </label>
            </div>

            {/* Live Preview Box */}
            <div className="mb-5">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#717A75] block mb-2">
                Floating Mark Live Preview (Circular Badge)
              </span>
              <div className="p-4 bg-[#EBF2EC] rounded-xl flex items-center justify-center border border-[#A0B7A3]/40 shadow-inner min-h-[90px]">
                {enableCustomFloatingLogo && floatingLogo ? (
                  <div
                    className="rounded-full bg-[#12231A] border-2 border-[#96F816] flex items-center justify-center shadow-lg overflow-hidden p-1"
                    style={{ width: `${floatingLogoSize}px`, height: `${floatingLogoSize}px` }}
                  >
                    <img
                      src={floatingLogo}
                      alt="Floating Logo Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#12231A] border-2 border-[#96F816]/70 flex items-center justify-center shadow-md relative">
                    <span className="font-serif font-black text-sm text-[#96F816] tracking-widest pl-0.5">
                      H
                    </span>
                    <span className="absolute -top-1 -right-1 text-[8px] text-[#96F816]">
                      ✦
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Upload & Input Controls */}
            <div className="space-y-4">
              {/* Direct File Dropzone */}
              <div>
                <label className="block text-[11px] font-bold text-[#12231A] uppercase tracking-wider mb-1.5">
                  Upload Icon / Mark (PNG / SVG)
                </label>
                <div className="relative border-2 border-dashed border-[#E6DFD5] hover:border-[#12231A] rounded-xl p-4 text-center bg-[#FAF8F5] transition-colors cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'floating')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-5 h-5 mx-auto text-[#717A75] group-hover:text-[#12231A] mb-1.5 transition-colors" />
                  <span className="text-xs font-semibold text-[#12231A] block">
                    {isUploading === 'floating' ? 'Uploading...' : 'Browse from computer'}
                  </span>
                  <span className="text-[10px] text-[#717A75]">Square 1:1 aspect ratio recommended</span>
                </div>
              </div>

              {/* Or Media Studio Button */}
              <button
                type="button"
                onClick={() => openMediaModalFor('floating')}
                className="w-full py-2 px-3 bg-[#EBF2EC] hover:bg-[#12231A] hover:text-[#96F816] text-[#12231A] text-xs font-bold rounded-lg border border-[#A0B7A3]/40 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#96F816]" />
                <span>Open Media Studio / AI Generator</span>
              </button>

              {/* URL Input */}
              <div>
                <label className="block text-[10px] font-bold text-[#717A75] uppercase tracking-wider mb-1">
                  Or Paste Direct Icon URL
                </label>
                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <Link className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#717A75]" />
                    <input
                      type="text"
                      value={floatingLogo}
                      onChange={(e) => {
                        setFloatingLogo(e.target.value);
                        if (e.target.value) setEnableCustomFloatingLogo(true);
                      }}
                      placeholder="https://example.com/logo-floating.png"
                      className="w-full pl-9 pr-3 py-1.5 bg-[#FAF8F5] border border-[#E6DFD5] text-xs rounded-lg text-[#12231A] focus:outline-none focus:border-[#12231A]"
                    />
                  </div>
                  {floatingLogo && (
                    <button
                      type="button"
                      onClick={() => {
                        setFloatingLogo('');
                        setEnableCustomFloatingLogo(false);
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                      title="Clear custom logo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Size Adjuster Slider */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-[#12231A] flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-[#886938]" />
                    Badge Size
                  </span>
                  <span className="font-mono text-[11px] text-[#717A75]">{floatingLogoSize}px</span>
                </div>
                <input
                  type="range"
                  min="24"
                  max="64"
                  step="2"
                  value={floatingLogoSize}
                  onChange={(e) => setFloatingLogoSize(Number(e.target.value))}
                  className="w-full accent-[#12231A] cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ===================== CARD 4: BROWSER FAVICON & TAB ICON ===================== */}
        <div className="bg-white rounded-2xl border border-[#E6DFD5] p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            {/* Card Header & Toggle */}
            <div className="flex items-center justify-between pb-4 border-b border-[#F4EFE6] mb-5">
              <div>
                <span className="text-[10px] tracking-wider uppercase font-bold text-[#886938] block">
                  Browser Tab & PWA Icon
                </span>
                <h3 className="text-base font-serif font-bold text-[#12231A] flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-[#886938]" />
                  <span>4. Site Favicon</span>
                </h3>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enableCustomFavicon}
                  onChange={(e) => {
                    setEnableCustomFavicon(e.target.checked);
                    updateBrandLogos({ enableCustomFavicon: e.target.checked });
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#12231A]" />
                <span className="text-[10px] font-bold uppercase text-[#12231A]">
                  {enableCustomFavicon ? 'Custom' : 'Default'}
                </span>
              </label>
            </div>

            {/* Live Simulated Browser Tab Preview */}
            <div className="mb-5">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#717A75] block mb-2">
                Simulated Browser Tab Preview
              </span>
              <div className="p-3 bg-[#E8E4DC] rounded-xl flex flex-col justify-center border border-[#D5CEC2] shadow-inner min-h-[90px] space-y-2">
                {/* Browser Tab Shell */}
                <div className="bg-[#FAF8F5] rounded-t-lg px-2.5 py-1.5 flex items-center justify-between border-t border-x border-[#D5CEC2] shadow-xs max-w-full">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Favicon Icon */}
                    <div className="w-4 h-4 rounded shrink-0 overflow-hidden flex items-center justify-center bg-[#12231A]">
                      {enableCustomFavicon && faviconIcon ? (
                        <img
                          src={faviconIcon}
                          alt="Favicon Preview"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="font-serif font-black text-[9px] text-[#96F816]">H</span>
                      )}
                    </div>
                    <span className="text-[10px] font-medium text-[#12231A] truncate max-w-[130px]">
                      HIFFYY | Luxury Parfums
                    </span>
                  </div>
                  <X className="w-2.5 h-2.5 text-[#717A75] shrink-0" />
                </div>

                {/* Mobile / PWA App Icon Badge */}
                <div className="flex items-center justify-between px-2 text-[10px] text-[#717A75]">
                  <span>Mobile Bookmark:</span>
                  <div className="w-6 h-6 rounded-md bg-[#12231A] border border-[#96F816]/50 flex items-center justify-center shadow-xs overflow-hidden">
                    {enableCustomFavicon && faviconIcon ? (
                      <img src={faviconIcon} alt="PWA Icon" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-serif font-black text-[10px] text-[#96F816]">H✦</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Upload & Input Controls */}
            <div className="space-y-4">
              {/* Direct File Dropzone */}
              <div>
                <label className="block text-[11px] font-bold text-[#12231A] uppercase tracking-wider mb-1.5">
                  Upload Favicon (.ico / .png / .svg)
                </label>
                <div className="relative border-2 border-dashed border-[#E6DFD5] hover:border-[#12231A] rounded-xl p-4 text-center bg-[#FAF8F5] transition-colors cursor-pointer group">
                  <input
                    type="file"
                    accept=".ico,.png,.svg,.webp,image/*"
                    onChange={(e) => handleFileUpload(e, 'favicon')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-5 h-5 mx-auto text-[#717A75] group-hover:text-[#12231A] mb-1.5 transition-colors" />
                  <span className="text-xs font-semibold text-[#12231A] block">
                    {isUploading === 'favicon' ? 'Uploading...' : 'Browse icon file'}
                  </span>
                  <span className="text-[10px] text-[#717A75]">Square 32x32 or 64x64 px recommended</span>
                </div>
              </div>

              {/* Or Media Studio Button */}
              <button
                type="button"
                onClick={() => openMediaModalFor('favicon')}
                className="w-full py-2 px-3 bg-[#EBF2EC] hover:bg-[#12231A] hover:text-[#96F816] text-[#12231A] text-xs font-bold rounded-lg border border-[#A0B7A3]/40 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#96F816]" />
                <span>Open Media Studio / AI Generator</span>
              </button>

              {/* URL Input */}
              <div>
                <label className="block text-[10px] font-bold text-[#717A75] uppercase tracking-wider mb-1">
                  Or Paste Direct Favicon URL
                </label>
                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <Link className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#717A75]" />
                    <input
                      type="text"
                      value={faviconIcon}
                      onChange={(e) => {
                        setFaviconIcon(e.target.value);
                        if (e.target.value) {
                          setEnableCustomFavicon(true);
                          updateBrandLogos({ faviconIcon: e.target.value, enableCustomFavicon: true });
                        }
                      }}
                      placeholder="https://example.com/favicon.png"
                      className="w-full pl-9 pr-3 py-1.5 bg-[#FAF8F5] border border-[#E6DFD5] text-xs rounded-lg text-[#12231A] focus:outline-none focus:border-[#12231A]"
                    />
                  </div>
                  {faviconIcon && (
                    <button
                      type="button"
                      onClick={() => {
                        setFaviconIcon('');
                        setEnableCustomFavicon(false);
                        updateBrandLogos({ faviconIcon: '', enableCustomFavicon: false });
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                      title="Clear custom favicon"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* 1-Click Luxury Favicon Presets */}
              <div className="pt-1">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#717A75] block mb-1.5">
                  1-Click Luxury Vector Presets:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const p1 = `data:image/svg+xml,${encodeURIComponent(`
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
                          <rect width="64" height="64" rx="14" fill="#12231A"/>
                          <rect x="2" y="2" width="60" height="60" rx="12" fill="none" stroke="#96F816" stroke-width="2"/>
                          <path d="M26 12 L38 12 L38 18 L26 18 Z" fill="#96F816"/>
                          <path d="M20 22 L44 22 L48 50 L16 50 Z" fill="#182F23" stroke="#96F816" stroke-width="2"/>
                          <text x="32" y="40" font-family="sans-serif" font-size="16" font-weight="900" fill="#96F816" text-anchor="middle" dominant-baseline="central">H</text>
                        </svg>
                      `)}`;
                      applyLogoUrl('favicon', p1);
                    }}
                    className="p-1.5 bg-[#FAF8F5] hover:bg-[#12231A] hover:text-[#96F816] text-[#12231A] border border-[#E6DFD5] rounded text-[9px] font-bold transition-all text-center cursor-pointer"
                    title="Neon Emerald Flacon"
                  >
                    Neon Flacon
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const p2 = `data:image/svg+xml,${encodeURIComponent(`
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
                          <rect width="64" height="64" rx="14" fill="#1A1713"/>
                          <rect x="2" y="2" width="60" height="60" rx="12" fill="none" stroke="#C5A880" stroke-width="2"/>
                          <text x="32" y="34" font-family="serif" font-size="28" font-weight="bold" fill="#DFCAAB" text-anchor="middle" dominant-baseline="central">H</text>
                          <circle cx="32" cy="50" r="2.5" fill="#96F816"/>
                        </svg>
                      `)}`;
                      applyLogoUrl('favicon', p2);
                    }}
                    className="p-1.5 bg-[#FAF8F5] hover:bg-[#12231A] hover:text-[#DFCAAB] text-[#12231A] border border-[#E6DFD5] rounded text-[9px] font-bold transition-all text-center cursor-pointer"
                    title="Imperial Gold Monogram"
                  >
                    Gold Crest
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const p3 = `data:image/svg+xml,${encodeURIComponent(`
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
                          <rect width="64" height="64" rx="14" fill="#0B100D"/>
                          <circle cx="32" cy="32" r="22" fill="none" stroke="#FAF8F5" stroke-width="2"/>
                          <text x="32" y="34" font-family="sans-serif" font-size="18" font-weight="900" fill="#FAF8F5" text-anchor="middle" dominant-baseline="central">HF</text>
                        </svg>
                      `)}`;
                      applyLogoUrl('favicon', p3);
                    }}
                    className="p-1.5 bg-[#FAF8F5] hover:bg-[#12231A] hover:text-white text-[#12231A] border border-[#E6DFD5] rounded text-[9px] font-bold transition-all text-center cursor-pointer"
                    title="Onyx Monogram"
                  >
                    Onyx HF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Preview Section */}
      <div className="bg-[#12231A] text-white p-6 sm:p-8 rounded-2xl border border-[#182F23] shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#182F23] mb-6 gap-3">
          <div>
            <h3 className="text-base font-serif font-bold text-[#96F816]">
              Storefront Preview Simulator
            </h3>
            <p className="text-xs text-white/70">
              Live simulation of how your custom logos and favicon appear across storefront touchpoints and browser tabs.
            </p>
          </div>
          <button
            onClick={() => setCurrentView('storefront')}
            className="px-4 py-2 bg-[#96F816] hover:bg-[#85e110] text-[#12231A] text-xs uppercase tracking-wider font-extrabold rounded-full transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 self-start sm:self-auto"
          >
            <span>View Live Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="p-4 bg-[#182F23]/80 rounded-xl border border-white/10 flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase font-bold text-[#96F816] tracking-wider mb-3">
              Header View
            </span>
            <BrandLogo variant="header" />
          </div>

          <div className="p-4 bg-[#182F23]/80 rounded-xl border border-white/10 flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase font-bold text-[#96F816] tracking-wider mb-3">
              Footer View
            </span>
            <BrandLogo variant="footer" />
          </div>

          <div className="p-4 bg-[#182F23]/80 rounded-xl border border-white/10 flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase font-bold text-[#96F816] tracking-wider mb-3">
              Floating View
            </span>
            <BrandLogo variant="mark" />
          </div>

          <div className="p-4 bg-[#182F23]/80 rounded-xl border border-white/10 flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase font-bold text-[#96F816] tracking-wider mb-3">
              Browser Tab Favicon
            </span>
            <div className="bg-[#FAF8F5] text-[#12231A] px-3 py-1.5 rounded-t-lg flex items-center gap-2 border border-[#D5CEC2] shadow-xs max-w-full">
              <div className="w-4 h-4 rounded bg-[#12231A] shrink-0 overflow-hidden flex items-center justify-center">
                {enableCustomFavicon && faviconIcon ? (
                  <img src={faviconIcon} alt="Tab Favicon" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-[9px] font-black text-[#96F816]">H</span>
                )}
              </div>
              <span className="text-[10px] font-bold truncate max-w-[100px]">HIFFYY Store</span>
              <X className="w-2.5 h-2.5 text-[#717A75]" />
            </div>
          </div>
        </div>
      </div>

      {/* Image Upload Modal Integration (for Media Studio / AI Generation) */}
      <ImageUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectImage={(url) => {
          if (activeUploadTarget) {
            applyLogoUrl(activeUploadTarget, url);
          }
          setIsModalOpen(false);
        }}
        currentImage={
          activeUploadTarget === 'header'
            ? headerLogo
            : activeUploadTarget === 'footer'
            ? footerLogo
            : activeUploadTarget === 'floating'
            ? floatingLogo
            : faviconIcon
        }
      />
    </div>
  );
};

