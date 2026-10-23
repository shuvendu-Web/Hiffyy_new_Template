import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { HeroCarouselProduct, ObjectFitProperty, HeroGlassSettings, TextTypographySettings } from '../../types';
import {
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Save,
  Check,
  Layers,
  Sliders,
  Sparkles,
  X,
  RotateCcw,
  Palette,
  Droplets,
  Sun,
  Moon,
  Eye,
  Type,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ImageUploadModal } from './ImageUploadModal';

const hexToRgba = (hex: string, alpha: number) => {
  const clean = (hex || '#FFFFFF').replace('#', '');
  let r = 255, g = 255, b = 255;
  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16) || 255;
    g = parseInt(clean[1] + clean[1], 16) || 255;
    b = parseInt(clean[2] + clean[2], 16) || 255;
  } else if (clean.length >= 6) {
    r = parseInt(clean.substring(0, 2), 16) || 255;
    g = parseInt(clean.substring(2, 4), 16) || 255;
    b = parseInt(clean.substring(4, 6), 16) || 255;
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const isColorDark = (hex: string) => {
  const clean = (hex || '#FFFFFF').replace('#', '');
  let r = 255, g = 255, b = 255;
  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16) || 255;
    g = parseInt(clean[1] + clean[1], 16) || 255;
    b = parseInt(clean[2] + clean[2], 16) || 255;
  } else if (clean.length >= 6) {
    r = parseInt(clean.substring(0, 2), 16) || 255;
    g = parseInt(clean.substring(2, 4), 16) || 255;
    b = parseInt(clean.substring(4, 6), 16) || 255;
  }
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq < 128;
};

const fontFamilyMap: Record<string, string> = {
  sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  serif: 'Playfair Display, "Times New Roman", Georgia, serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
};

const letterSpacingMap: Record<string, string> = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
};

const fontSizeMap: Record<string, string> = {
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
};

const LUXURY_PALETTE = [
  { color: '#FFFFFF', name: 'Pure White' },
  { color: '#96F816', name: 'Neon Lime' },
  { color: '#C5A880', name: 'Amber Gold' },
  { color: '#8B5E3C', name: 'Warm Bronze' },
  { color: '#FAF8F5', name: 'Ivory Cream' },
  { color: '#12231A', name: 'Forest Noir' },
  { color: '#0F172A', name: 'Midnight' },
  { color: '#94A3B8', name: 'Silver Slate' },
];

const SUBTITLE_PILL_PALETTE = [
  { color: '#12231A', name: 'Deep Jade' },
  { color: '#000000', name: 'Onyx Black' },
  { color: '#1A2E23', name: 'Dark Emerald' },
  { color: '#2B2319', name: 'Smoked Amber' },
  { color: '#FAF8F5', name: 'Ivory Cream' },
  { color: '#96F816', name: 'Neon Lime' },
];

interface TypographyControlBlockProps {
  label: string;
  fieldKey: string;
  value: TextTypographySettings;
  onChange: (updates: Partial<TextTypographySettings>) => void;
  onReset: () => void;
  previewText: string;
  isSubtitle?: boolean;
  isOpen: boolean;
  onToggleOpen: () => void;
  isMoreOpen: boolean;
  onToggleMore: () => void;
  defaultColor?: string;
  defaultWeight?: string;
  defaultFamily?: 'sans' | 'serif' | 'mono';
  defaultTransform?: 'none' | 'uppercase' | 'capitalize' | 'lowercase';
  defaultLetterSpacing?: 'tighter' | 'tight' | 'normal' | 'wide' | 'wider' | 'widest';
  defaultPillBg?: string;
}

const TypographyControlBlock: React.FC<TypographyControlBlockProps> = ({
  label,
  value,
  onChange,
  onReset,
  previewText,
  isSubtitle = false,
  isOpen,
  onToggleOpen,
  isMoreOpen,
  onToggleMore,
  defaultColor = '#FFFFFF',
  defaultWeight = '500',
  defaultFamily = 'sans',
  defaultTransform = 'none',
  defaultLetterSpacing = 'normal',
  defaultPillBg = '#12231A',
}) => {
  const activeColor = value.color || defaultColor;
  const activeWeight = value.fontWeight || defaultWeight;
  const activeFamily = value.fontFamily || defaultFamily;
  const activeStyle = value.fontStyle || 'normal';
  const activeTransform = value.textTransform || defaultTransform;
  const activeSpacing = value.letterSpacing || defaultLetterSpacing;
  const activeFontSize = value.fontSize ? fontSizeMap[value.fontSize] : undefined;

  const previewStyle: React.CSSProperties = {
    color: activeColor,
    fontWeight: activeWeight,
    fontFamily: fontFamilyMap[activeFamily] || fontFamilyMap.sans,
    fontStyle: activeStyle as React.CSSProperties['fontStyle'],
    textTransform: activeTransform as React.CSSProperties['textTransform'],
    letterSpacing: letterSpacingMap[activeSpacing] || '0em',
    fontSize: activeFontSize,
  };

  return (
    <div className="border border-[#E6DFD5] rounded-sm overflow-hidden bg-white mt-1.5 shadow-xs">
      {/* Collapsible Header */}
      <div className="flex items-center justify-between p-2 sm:p-2.5 bg-[#FAF8F5] border-b border-[#E6DFD5]">
        <button
          type="button"
          onClick={onToggleOpen}
          className="flex items-center gap-2 text-left cursor-pointer flex-1 group"
        >
          <div className="w-5 h-5 rounded-xs bg-[#12231A] text-[#96F816] flex items-center justify-center shrink-0">
            <Type className="w-3 h-3 text-[#96F816]" />
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-bold text-[#12231A] group-hover:text-[#886938] transition-colors">
              {label} Typography
            </span>
            <span className="text-[10px] text-[#717A75] font-mono flex items-center gap-1">
              <span>({activeWeight} •</span>
              <span
                style={{ backgroundColor: isColorDark(activeColor) ? '#12231A' : '#FAF8F5', color: activeColor }}
                className="font-bold px-1 py-0.2 rounded-xs border border-gray-300"
              >
                {activeColor}
              </span>
              <span>• {activeStyle}{activeFamily !== 'sans' ? ` • ${activeFamily}` : ''})</span>
            </span>
          </div>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onReset();
            }}
            title="Reset to default typography"
            className="px-1.5 py-0.5 text-[#717A75] hover:text-[#12231A] hover:bg-gray-200 rounded-xs text-[10px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3 text-[#717A75]" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <button
            type="button"
            onClick={onToggleOpen}
            className="p-1 text-[#717A75] hover:text-[#12231A] cursor-pointer"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Typography Controls Panel */}
      {isOpen && (
        <div className="p-3 bg-white space-y-3">
          {/* Row 1: Font Color */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#717A75]">
              <span className="flex items-center gap-1">
                <Palette className="w-3 h-3 text-[#886938]" />
                Font Color
              </span>
              <span className="font-mono text-[#886938]">{activeColor}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="color"
                value={activeColor.startsWith('#') && activeColor.length === 7 ? activeColor : '#FFFFFF'}
                onChange={(e) => onChange({ color: e.target.value })}
                className="w-8 h-8 p-0.5 rounded-sm border border-[#E6DFD5] cursor-pointer bg-transparent shrink-0"
              />
              <input
                type="text"
                value={value.color || ''}
                placeholder={defaultColor}
                onChange={(e) => onChange({ color: e.target.value })}
                className="w-24 p-1.5 text-xs font-mono font-bold bg-[#FAF8F5] border border-[#E6DFD5] rounded-xs uppercase focus:outline-none"
              />
              {/* Palette Swatches */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {LUXURY_PALETTE.map((p) => (
                  <button
                    key={p.color}
                    type="button"
                    onClick={() => onChange({ color: p.color })}
                    title={p.name}
                    className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer shadow-xs ${
                      activeColor.toUpperCase() === p.color.toUpperCase()
                        ? 'border-[#12231A] scale-110 ring-2 ring-[#96F816]'
                        : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: p.color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Font Weight & Font Style */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-gray-100">
            <div className="sm:col-span-8 space-y-1.5">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#717A75]">
                Font Weight: <span className="font-mono text-[#12231A] font-bold">{activeWeight}</span>
              </span>
              <div className="grid grid-cols-7 gap-1">
                {[
                  { weight: '300', label: '300' },
                  { weight: '400', label: '400' },
                  { weight: '500', label: '500' },
                  { weight: '600', label: '600' },
                  { weight: '700', label: '700' },
                  { weight: '800', label: '800' },
                  { weight: '900', label: '900' },
                ].map((w) => {
                  const isSelected = activeWeight === w.weight;
                  return (
                    <button
                      key={w.weight}
                      type="button"
                      onClick={() => onChange({ fontWeight: w.weight })}
                      className={`py-1 text-[10px] font-mono font-bold rounded-xs transition-colors cursor-pointer text-center ${
                        isSelected
                          ? 'bg-[#12231A] text-[#96F816] shadow-xs'
                          : 'bg-[#FAF8F5] border border-[#E6DFD5] text-[#12231A] hover:bg-gray-100'
                      }`}
                    >
                      {w.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="sm:col-span-4 space-y-1.5">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#717A75]">
                Font Style
              </span>
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => onChange({ fontStyle: 'normal' })}
                  className={`py-1 text-[11px] rounded-xs font-semibold cursor-pointer ${
                    activeStyle === 'normal'
                      ? 'bg-[#12231A] text-white shadow-xs'
                      : 'bg-[#FAF8F5] border border-[#E6DFD5] text-[#717A75] hover:bg-gray-100'
                  }`}
                >
                  Normal
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ fontStyle: 'italic' })}
                  className={`py-1 text-[11px] rounded-xs font-serif italic font-bold cursor-pointer ${
                    activeStyle === 'italic'
                      ? 'bg-[#12231A] text-[#96F816] shadow-xs'
                      : 'bg-[#FAF8F5] border border-[#E6DFD5] text-[#717A75] hover:bg-gray-100'
                  }`}
                >
                  Italic
                </button>
              </div>
            </div>
          </div>

          {/* "More Options" toggle */}
          <div className="pt-1 border-t border-gray-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onToggleMore}
              className="text-[10px] font-bold text-[#886938] hover:text-[#12231A] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Sliders className="w-3 h-3 text-[#886938]" />
              <span>{isMoreOpen ? 'Hide Advanced Options ▴' : 'More Options (Font Family, Transform, Spacing, Size...) ▾'}</span>
            </button>
          </div>

          {/* Expandable Advanced Options */}
          {isMoreOpen && (
            <div className="p-2.5 bg-[#FAF8F5] border border-[#E6DFD5] rounded-xs space-y-3 animate-in fade-in duration-150">
              {/* Font Family */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#717A75] block">
                  Font Family
                </span>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'sans', label: 'Modern Sans' },
                    { id: 'serif', label: 'Luxury Serif' },
                    { id: 'mono', label: 'Artisan Mono' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => onChange({ fontFamily: f.id as 'sans' | 'serif' | 'mono' })}
                      className={`py-1 px-2 text-[10px] rounded-xs border text-center cursor-pointer transition-colors ${
                        activeFamily === f.id
                          ? 'bg-[#12231A] text-[#96F816] border-[#12231A] font-bold'
                          : 'bg-white border-[#E6DFD5] text-[#12231A] hover:bg-gray-50'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Transform & Letter Spacing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#717A75] block">
                    Text Transform
                  </span>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { id: 'none', label: 'Aa' },
                      { id: 'uppercase', label: 'AA' },
                      { id: 'capitalize', label: 'Ab' },
                      { id: 'lowercase', label: 'aa' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => onChange({ textTransform: t.id as 'none' | 'uppercase' | 'capitalize' | 'lowercase' })}
                        className={`py-1 text-[10px] rounded-xs border text-center cursor-pointer ${
                          activeTransform === t.id
                            ? 'bg-[#12231A] text-[#96F816] border-[#12231A] font-bold'
                            : 'bg-white border-[#E6DFD5] text-[#717A75] hover:bg-gray-50'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#717A75] block">
                    Letter Spacing
                  </span>
                  <div className="grid grid-cols-5 gap-1">
                    {[
                      { id: 'tight', label: '-1' },
                      { id: 'normal', label: '0' },
                      { id: 'wide', label: '+1' },
                      { id: 'wider', label: '+2' },
                      { id: 'widest', label: '+3' },
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => onChange({ letterSpacing: s.id as 'tight' | 'normal' | 'wide' | 'wider' | 'widest' })}
                        className={`py-1 text-[10px] rounded-xs border text-center cursor-pointer ${
                          activeSpacing === s.id
                            ? 'bg-[#12231A] text-[#96F816] border-[#12231A] font-bold'
                            : 'bg-white border-[#E6DFD5] text-[#717A75] hover:bg-gray-50'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Font Size Preset Override */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#717A75] block">
                  Font Size Override (Optional)
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1">
                  {[
                    { id: undefined, label: 'Default' },
                    { id: 'sm', label: 'SM' },
                    { id: 'base', label: 'BASE' },
                    { id: 'lg', label: 'LG' },
                    { id: 'xl', label: 'XL' },
                    { id: '2xl', label: '2XL' },
                    { id: '3xl', label: '3XL' },
                    { id: '4xl', label: '4XL' },
                  ].map((sz) => (
                    <button
                      key={sz.label}
                      type="button"
                      onClick={() => onChange({ fontSize: sz.id })}
                      className={`py-1 text-[9px] rounded-xs border text-center cursor-pointer ${
                        value.fontSize === sz.id
                          ? 'bg-[#12231A] text-[#96F816] border-[#12231A] font-bold'
                          : 'bg-white border-[#E6DFD5] text-[#717A75] hover:bg-gray-50'
                      }`}
                    >
                      {sz.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* If Subtitle: Pill Background Color */}
              {isSubtitle && (
                <div className="space-y-1.5 pt-2 border-t border-[#E6DFD5]">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#717A75]">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#96F816]" />
                      Subtitle Badge Pill Background Color
                    </span>
                    <span className="font-mono text-[#886938]">{value.pillBgColor || defaultPillBg}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="color"
                      value={(value.pillBgColor || defaultPillBg).startsWith('#') && (value.pillBgColor || defaultPillBg).length === 7 ? (value.pillBgColor || defaultPillBg) : '#12231A'}
                      onChange={(e) => onChange({ pillBgColor: e.target.value })}
                      className="w-8 h-8 p-0.5 rounded-sm border border-[#E6DFD5] cursor-pointer bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={value.pillBgColor || ''}
                      placeholder={defaultPillBg}
                      onChange={(e) => onChange({ pillBgColor: e.target.value })}
                      className="w-24 p-1.5 text-xs font-mono font-bold bg-white border border-[#E6DFD5] rounded-xs uppercase focus:outline-none"
                    />
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {SUBTITLE_PILL_PALETTE.map((p) => (
                        <button
                          key={p.color}
                          type="button"
                          onClick={() => onChange({ pillBgColor: p.color })}
                          title={p.name}
                          className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer ${
                            (value.pillBgColor || defaultPillBg).toUpperCase() === p.color.toUpperCase()
                              ? 'border-[#96F816] scale-110 ring-1 ring-[#96F816]'
                              : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: p.color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Real-Time Live Preview Box */}
          <div className="p-3 bg-[#0B1510] border border-[#1e3a2b] rounded-sm space-y-1.5 shadow-inner">
            <div className="flex items-center justify-between text-[9px] font-mono text-[#717A75] border-b border-[#1e3a2b]/60 pb-1">
              <span className="flex items-center gap-1 text-[#96F816] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#96F816] animate-pulse" />
                Live Storefront Typography Preview
              </span>
              <span>Stage Background: #0B1510</span>
            </div>
            <div className="py-1">
              {isSubtitle ? (
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border shadow-sm transition-all duration-300"
                  style={{
                    backgroundColor: value.pillBgColor || defaultPillBg,
                    borderColor: hexToRgba(activeColor, 0.4),
                  }}
                >
                  <Sparkles className="w-3 h-3" style={{ color: activeColor }} />
                  <span style={previewStyle} className="text-[10px]">
                    {previewText || 'Restorative Dermal Barrier & Moisture Cream'}
                  </span>
                </div>
              ) : (
                <p style={previewStyle} className="leading-snug">
                  {previewText || 'Sample typography preview text'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const HeroSectionManager: React.FC = () => {
  const {
    heroSlides,
    addHeroSlide,
    updateHeroSlide,
    deleteHeroSlide,
    resetHeroSlides,
    products,
    addProduct,
    deleteProduct,
    heroGlassSettings,
    updateHeroGlassSettings,
    resetHeroGlassSettings,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'slides' | 'cards' | 'glass'>('slides');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroCarouselProduct | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [glassSavedToast, setGlassSavedToast] = useState(false);

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
  const [cardImageObjectFit, setCardImageObjectFit] = useState<ObjectFitProperty>('contain');
  const [heroModelObjectFit, setHeroModelObjectFit] = useState<ObjectFitProperty>('contain');
  const [heroModelObjectPosition, setHeroModelObjectPosition] = useState<string>('center center');

  // Individual Slide Card Glassmorphism & Mood Settings (Strictly Per Slide)
  const [customCardGlass, setCustomCardGlass] = useState<boolean>(false);
  const [cardGlassColor, setCardGlassColor] = useState<string>('#FFFFFF');
  const [cardGlassOpacity, setCardGlassOpacity] = useState<number>(85);
  const [cardGlassBlur, setCardGlassBlur] = useState<number>(16);
  const [cardBorderColor, setCardBorderColor] = useState<string>('#FFFFFF');
  const [cardBorderOpacity, setCardBorderOpacity] = useState<number>(50);
  const [cardGlowColor, setCardGlowColor] = useState<string>('#96F816');
  const [cardGlassTextColor, setCardGlassTextColor] = useState<'auto' | 'dark' | 'light'>('auto');
  const [canvasBgColor, setCanvasBgColor] = useState<string>('');

  // Individual Slide Typography Settings (Strictly Per Slide)
  const [titleStyle, setTitleStyle] = useState<TextTypographySettings>({});
  const [subtitleStyle, setSubtitleStyle] = useState<TextTypographySettings>({});
  const [headlineFirstStyle, setHeadlineFirstStyle] = useState<TextTypographySettings>({});
  const [headlineSecondStyle, setHeadlineSecondStyle] = useState<TextTypographySettings>({});
  const [descriptionStyle, setDescriptionStyle] = useState<TextTypographySettings>({});

  // Collapsible accordion states for typography panels
  const [openTypoPanels, setOpenTypoPanels] = useState<Record<string, boolean>>({
    title: true,
    subtitle: true,
    headlineFirst: true,
    headlineSecond: true,
    description: true,
  });

  // "More Options" toggle state per field
  const [openMoreOptions, setOpenMoreOptions] = useState<Record<string, boolean>>({
    title: false,
    subtitle: false,
    headlineFirst: false,
    headlineSecond: false,
    description: false,
  });

  // Glassmorphism controls state (Global Defaults)
  const [glassEnabled, setGlassEnabled] = useState(heroGlassSettings?.enabled ?? true);
  const [glassColor, setGlassColor] = useState(heroGlassSettings?.tintColor ?? '#FFFFFF');
  const [glassOpacity, setGlassOpacity] = useState(heroGlassSettings?.opacity ?? 85);
  const [glassBlur, setGlassBlur] = useState(heroGlassSettings?.blur ?? 16);
  const [glassBorderOpacity, setGlassBorderOpacity] = useState(heroGlassSettings?.borderOpacity ?? 50);
  const [glassBorderColor, setGlassBorderColor] = useState(heroGlassSettings?.borderColor ?? '#FFFFFF');
  const [glassBorderRadius, setGlassBorderRadius] = useState(heroGlassSettings?.borderRadius ?? 16);
  const [glassGlow, setGlassGlow] = useState(heroGlassSettings?.shadowGlow ?? true);
  const [glassGlowColor, setGlassGlowColor] = useState(heroGlassSettings?.glowColor ?? '#96F816');
  const [glassTextColor, setGlassTextColor] = useState<'auto' | 'dark' | 'light'>(heroGlassSettings?.cardTextColor ?? 'auto');

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
    setCardImageObjectFit('contain');
    setHeroModelObjectFit('cover');
    setHeroModelObjectPosition('center center');
    setCustomCardGlass(false);
    setCardGlassColor('#FFFFFF');
    setCardGlassOpacity(85);
    setCardGlassBlur(16);
    setCardBorderColor('#FFFFFF');
    setCardBorderOpacity(50);
    setCardGlowColor('#96F816');
    setCardGlassTextColor('auto');
    setCanvasBgColor('');
    setTitleStyle({
      fontWeight: '600',
      color: '#FFFFFF',
      fontStyle: 'normal',
      fontFamily: 'sans',
      textTransform: 'none',
      letterSpacing: 'normal',
    });
    setSubtitleStyle({
      fontWeight: '600',
      color: '#96F816',
      pillBgColor: '#12231A',
      fontStyle: 'normal',
      fontFamily: 'sans',
      textTransform: 'uppercase',
      letterSpacing: 'wide',
    });
    setHeadlineFirstStyle({
      fontWeight: '500',
      color: '#FFFFFF',
      fontStyle: 'normal',
      fontFamily: 'sans',
      textTransform: 'none',
      letterSpacing: 'normal',
    });
    setHeadlineSecondStyle({
      fontWeight: '500',
      color: '#FFFFFF',
      fontStyle: 'normal',
      fontFamily: 'serif',
      textTransform: 'none',
      letterSpacing: 'normal',
    });
    setDescriptionStyle({
      fontWeight: '400',
      color: '#FFFFFF',
      fontStyle: 'normal',
      fontFamily: 'sans',
      textTransform: 'none',
      letterSpacing: 'normal',
    });
    setOpenTypoPanels({
      title: true,
      subtitle: true,
      headlineFirst: true,
      headlineSecond: true,
      description: true,
    });
    setOpenMoreOptions({
      title: false,
      subtitle: false,
      headlineFirst: false,
      headlineSecond: false,
      description: false,
    });
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
    setCardImageObjectFit(slide.cardImageObjectFit || 'contain');
    setHeroModelObjectFit(slide.heroModelObjectFit || 'cover');
    setHeroModelObjectPosition(slide.heroModelObjectPosition || 'center center');
    setCustomCardGlass(Boolean(slide.customCardGlass));
    setCardGlassColor(slide.cardGlassColor || '#FFFFFF');
    setCardGlassOpacity(slide.cardGlassOpacity ?? 85);
    setCardGlassBlur(slide.cardGlassBlur ?? 16);
    setCardBorderColor(slide.cardBorderColor || '#FFFFFF');
    setCardBorderOpacity(slide.cardBorderOpacity ?? 50);
    setCardGlowColor(slide.cardGlowColor || '#96F816');
    setCardGlassTextColor(slide.cardGlassTextColor || 'auto');
    setCanvasBgColor(slide.canvasBgColor || '');
    setTitleStyle(slide.titleStyle ? { ...slide.titleStyle } : {});
    setSubtitleStyle(slide.subtitleStyle ? { ...slide.subtitleStyle } : {});
    setHeadlineFirstStyle(slide.headlineFirstStyle ? { ...slide.headlineFirstStyle } : {});
    setHeadlineSecondStyle(slide.headlineSecondStyle ? { ...slide.headlineSecondStyle } : {});
    setDescriptionStyle(slide.descriptionStyle ? { ...slide.descriptionStyle } : {});
    setOpenTypoPanels({
      title: true,
      subtitle: true,
      headlineFirst: true,
      headlineSecond: true,
      description: true,
    });
    setOpenMoreOptions({
      title: false,
      subtitle: false,
      headlineFirst: false,
      headlineSecond: false,
      description: false,
    });
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
      cardImageObjectFit,
      heroModelObjectFit,
      heroModelObjectPosition,
      customCardGlass,
      cardGlassColor,
      cardGlassOpacity,
      cardGlassBlur,
      cardBorderColor,
      cardBorderOpacity,
      cardGlowColor,
      cardGlassTextColor,
      canvasBgColor,
      titleStyle,
      subtitleStyle,
      headlineFirstStyle,
      headlineSecondStyle,
      descriptionStyle,
    };

    if (editingSlide) {
      updateHeroSlide(editingSlide.id, slideData);
    } else {
      addHeroSlide(slideData);
    }
    setIsModalOpen(false);
  };

  const handleSaveGlassSettings = () => {
    updateHeroGlassSettings({
      enabled: glassEnabled,
      tintColor: glassColor,
      opacity: glassOpacity,
      blur: glassBlur,
      borderOpacity: glassBorderOpacity,
      borderColor: glassBorderColor,
      borderRadius: glassBorderRadius,
      shadowGlow: glassGlow,
      glowColor: glassGlowColor,
      cardTextColor: glassTextColor,
    });
    setGlassSavedToast(true);
    setTimeout(() => setGlassSavedToast(false), 2500);
  };

  const handleResetGlassSettings = () => {
    if (confirm('Restore default hero card frosted glass settings?')) {
      resetHeroGlassSettings();
      setGlassEnabled(true);
      setGlassColor('#FFFFFF');
      setGlassOpacity(85);
      setGlassBlur(16);
      setGlassBorderOpacity(50);
      setGlassBorderColor('#FFFFFF');
      setGlassBorderRadius(16);
      setGlassGlow(true);
      setGlassGlowColor('#96F816');
      setGlassTextColor('auto');
      setGlassSavedToast(true);
      setTimeout(() => setGlassSavedToast(false), 2500);
    }
  };

  const applyGlassPreset = (preset: {
    color: string;
    opacity: number;
    blur: number;
    borderOpacity: number;
    borderColor: string;
    borderRadius: number;
    glow: boolean;
    glowColor: string;
    textColor: 'auto' | 'dark' | 'light';
  }) => {
    setGlassColor(preset.color);
    setGlassOpacity(preset.opacity);
    setGlassBlur(preset.blur);
    setGlassBorderOpacity(preset.borderOpacity);
    setGlassBorderColor(preset.borderColor);
    setGlassBorderRadius(preset.borderRadius);
    setGlassGlow(preset.glow);
    setGlassGlowColor(preset.glowColor);
    setGlassTextColor(preset.textColor);
    setGlassEnabled(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#12231A]">
            Hero Section & Slide Menu Index
          </h2>
          <p className="text-xs text-[#717A75]">
            Manage hero carousel slides, configure object-fit image controls, customize card glassmorphism effects with color, and manage product catalog.
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
            <button
              onClick={() => setActiveTab('glass')}
              className={`px-3 py-1.5 font-bold rounded-sm transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'glass' ? 'bg-[#12231A] text-[#96F816]' : 'text-[#12231A] hover:text-[#886938]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#96F816]" />
              <span>Card Glassmorphism</span>
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

          {activeTab === 'glass' && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetGlassSettings}
                className="px-3 py-2 bg-[#FAF8F5] border border-[#E6DFD5] text-[#12231A] text-xs font-semibold hover:border-[#12231A] flex items-center gap-1.5 cursor-pointer"
                title="Reset glass styles to defaults"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>

              <button
                onClick={handleSaveGlassSettings}
                className="px-4 py-2 bg-[#12231A] hover:bg-[#96F816] text-[#96F816] hover:text-[#12231A] text-xs uppercase tracking-wider font-extrabold flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
              >
                {glassSavedToast ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
                <span>{glassSavedToast ? 'Saved & Live!' : 'Save Glass Settings'}</span>
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
                          style={{ objectFit: slide.cardImageObjectFit || 'contain' }}
                          className="w-full h-full"
                        />
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/75 text-white text-[9px] rounded-xs font-mono">
                          Packshot: {slide.cardImageObjectFit || 'contain'}
                        </span>
                      </div>
                      <div className="relative aspect-video rounded-sm overflow-hidden border border-[#E6DFD5] flex items-center justify-center bg-[repeating-conic-gradient(#e5e7eb_0%_25%,_#ffffff_0%_50%)] bg-[length:12px_12px] p-1">
                        <img
                          src={slide.heroModelImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'}
                          alt={slide.title || 'Model'}
                          style={{
                            objectFit: slide.heroModelObjectFit || 'cover',
                            objectPosition: slide.heroModelObjectPosition || 'center center',
                          }}
                          className="w-full h-full"
                        />
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/75 text-white text-[9px] rounded-xs font-mono">
                          Hero Stage: {slide.heroModelObjectFit || 'cover'}
                        </span>
                      </div>
                    </div>

                    {/* Individual Settings Indicators */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                        slide.customCardGlass
                          ? 'bg-[#12231A] text-[#96F816] border border-[#96F816]/30'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {slide.customCardGlass ? '✨ Custom Card Glass' : 'Global Glass'}
                      </span>
                      {slide.canvasBgColor && (
                        <span className="px-2 py-0.5 text-[9px] font-mono rounded-full bg-[#FAF8F5] border border-[#E6DFD5] text-[#12231A] flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full border border-black/20" style={{ backgroundColor: slide.canvasBgColor }} />
                          Canvas: {slide.canvasBgColor}
                        </span>
                      )}
                      <span className="px-2 py-0.5 text-[9px] font-mono rounded-full bg-gray-50 border border-gray-200 text-gray-500">
                        Pos: {slide.heroModelObjectPosition || 'center center'}
                      </span>
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

      {/* Glassmorphism Studio & Live Simulator Tab */}
      {activeTab === 'glass' && (
        <div className="space-y-6">
          {/* Header & Presets */}
          <div className="bg-white border border-[#E6DFD5] rounded-sm p-5 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E6DFD5]">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#96F816]" />
                  <h3 className="text-base font-serif font-bold text-[#12231A]">
                    Hero Card Glassmorphism Studio & Visual Effects
                  </h3>
                </div>
                <p className="text-xs text-[#717A75] mt-1">
                  Fine-tune translucent glass colors, backdrop-filter blur, border sheen, neon glow, and contrast styles across all storefront hero cards.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetGlassSettings}
                  className="px-3 py-1.5 bg-[#FAF8F5] border border-[#E6DFD5] text-[#12231A] text-xs font-semibold hover:border-[#12231A] flex items-center gap-1.5 cursor-pointer rounded-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#717A75]" />
                  <span>Restore Defaults</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveGlassSettings}
                  className="px-4 py-1.5 bg-[#12231A] text-[#96F816] text-xs font-bold uppercase tracking-wider hover:bg-[#182F23] flex items-center gap-1.5 cursor-pointer rounded-xs shadow-sm"
                >
                  <Save className="w-3.5 h-3.5 text-[#96F816]" />
                  <span>Save Glass Styles</span>
                </button>
              </div>
            </div>

            {glassSavedToast && (
              <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-xs flex items-center gap-2 animate-in fade-in duration-200">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Glassmorphism settings saved & applied to the storefront hero section!</span>
              </div>
            )}

            {/* Curated Luxury Glass Presets */}
            <div className="mt-4 pt-3">
              <span className="text-[11px] font-bold text-[#717A75] uppercase tracking-wider block mb-2">
                Curated Luxury Glass Presets (1-Click Apply)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    applyGlassPreset({
                      color: '#FFFFFF',
                      opacity: 85,
                      blur: 16,
                      borderOpacity: 50,
                      borderColor: '#FFFFFF',
                      borderRadius: 16,
                      glow: true,
                      glowColor: '#96F816',
                      textColor: 'auto',
                    })
                  }
                  className="p-2.5 rounded-sm border border-gray-200 hover:border-[#12231A] bg-[#FAF8F5] text-left transition-all hover:-translate-y-0.5 cursor-pointer group shadow-xs"
                >
                  <div className="w-full h-4 rounded-xs mb-1.5 border border-white/60 bg-white/80 shadow-xs" />
                  <p className="text-[11px] font-bold text-[#12231A] group-hover:text-[#886938]">Frosted Opal</p>
                  <p className="text-[9px] text-[#717A75]">White 85% • 16px Blur</p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    applyGlassPreset({
                      color: '#12231A',
                      opacity: 75,
                      blur: 20,
                      borderOpacity: 40,
                      borderColor: '#96F816',
                      borderRadius: 16,
                      glow: true,
                      glowColor: '#96F816',
                      textColor: 'light',
                    })
                  }
                  className="p-2.5 rounded-sm border border-gray-200 hover:border-[#12231A] bg-[#12231A] text-left transition-all hover:-translate-y-0.5 cursor-pointer group shadow-xs"
                >
                  <div className="w-full h-4 rounded-xs mb-1.5 border border-[#96F816]/40 bg-[#12231A]/75 shadow-xs" />
                  <p className="text-[11px] font-bold text-[#96F816]">Midnight Luxe</p>
                  <p className="text-[9px] text-gray-300">Forest 75% • Neon Tint</p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    applyGlassPreset({
                      color: '#C5A880',
                      opacity: 65,
                      blur: 16,
                      borderOpacity: 60,
                      borderColor: '#FAF8F5',
                      borderRadius: 18,
                      glow: true,
                      glowColor: '#C5A880',
                      textColor: 'dark',
                    })
                  }
                  className="p-2.5 rounded-sm border border-gray-200 hover:border-[#12231A] bg-[#FAF8F5] text-left transition-all hover:-translate-y-0.5 cursor-pointer group shadow-xs"
                >
                  <div className="w-full h-4 rounded-xs mb-1.5 border border-amber-200 bg-[#C5A880]/65 shadow-xs" />
                  <p className="text-[11px] font-bold text-[#886938]">Imperial Amber</p>
                  <p className="text-[9px] text-[#717A75]">Gold 65% • Warm Sillage</p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    applyGlassPreset({
                      color: '#182F23',
                      opacity: 80,
                      blur: 24,
                      borderOpacity: 70,
                      borderColor: '#96F816',
                      borderRadius: 20,
                      glow: true,
                      glowColor: '#96F816',
                      textColor: 'light',
                    })
                  }
                  className="p-2.5 rounded-sm border border-gray-200 hover:border-[#12231A] bg-[#182F23] text-left transition-all hover:-translate-y-0.5 cursor-pointer group shadow-xs"
                >
                  <div className="w-full h-4 rounded-xs mb-1.5 border border-[#96F816]/60 bg-[#182F23]/80 shadow-xs" />
                  <p className="text-[11px] font-bold text-[#96F816]">Neon Emerald</p>
                  <p className="text-[9px] text-gray-300">Dark Jade • 24px Blur</p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    applyGlassPreset({
                      color: '#F5E6E8',
                      opacity: 70,
                      blur: 18,
                      borderOpacity: 45,
                      borderColor: '#E8B4B8',
                      borderRadius: 16,
                      glow: true,
                      glowColor: '#E8B4B8',
                      textColor: 'dark',
                    })
                  }
                  className="p-2.5 rounded-sm border border-gray-200 hover:border-[#12231A] bg-[#FAF8F5] text-left transition-all hover:-translate-y-0.5 cursor-pointer group shadow-xs"
                >
                  <div className="w-full h-4 rounded-xs mb-1.5 border border-pink-200 bg-[#F5E6E8]/70 shadow-xs" />
                  <p className="text-[11px] font-bold text-[#9E5A63]">Rose Quartz</p>
                  <p className="text-[9px] text-[#717A75]">Blush 70% • 18px Blur</p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    applyGlassPreset({
                      color: '#FFFFFF',
                      opacity: 25,
                      blur: 28,
                      borderOpacity: 35,
                      borderColor: '#FFFFFF',
                      borderRadius: 16,
                      glow: false,
                      glowColor: '#96F816',
                      textColor: 'auto',
                    })
                  }
                  className="p-2.5 rounded-sm border border-gray-200 hover:border-[#12231A] bg-slate-100 text-left transition-all hover:-translate-y-0.5 cursor-pointer group shadow-xs"
                >
                  <div className="w-full h-4 rounded-xs mb-1.5 border border-white/40 bg-white/25 shadow-xs" />
                  <p className="text-[11px] font-bold text-slate-800">Ultra Crystal</p>
                  <p className="text-[9px] text-[#717A75]">Sheer 25% • 28px Blur</p>
                </button>
              </div>
            </div>
          </div>

          {/* 2-Column Studio Grid: Controls on Left, Live Interactive Simulator on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Glass Control Settings */}
            <div className="lg:col-span-7 bg-white border border-[#E6DFD5] rounded-sm p-6 shadow-sm space-y-5">
              {/* Enable / Disable Glass Effect */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E6DFD5]">
                <div>
                  <label className="text-xs font-bold text-[#12231A] uppercase tracking-wider block">
                    Glassmorphism Effect Status
                  </label>
                  <p className="text-[11px] text-[#717A75]">
                    Toggle frosted backdrop glass styling on or off for hero cards.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setGlassEnabled(!glassEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    glassEnabled ? 'bg-[#12231A]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-[#96F816] shadow ring-0 transition duration-200 ease-in-out ${
                      glassEnabled ? 'translate-x-5' : 'translate-x-0 bg-white'
                    }`}
                  />
                </button>
              </div>

              {/* Tint Color Picker & Quick Chips */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#12231A] uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-[#886938]" />
                    <span>Glass Tint Color</span>
                  </label>
                  <span className="font-mono text-xs font-bold text-[#886938]">{glassColor.toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={glassColor}
                    onChange={(e) => setGlassColor(e.target.value)}
                    className="w-10 h-10 p-0.5 rounded-sm border border-[#E6DFD5] cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={glassColor}
                    onChange={(e) => setGlassColor(e.target.value)}
                    placeholder="#FFFFFF"
                    className="w-28 p-2 text-xs font-mono font-bold bg-[#FAF8F5] border border-[#E6DFD5] rounded-xs uppercase focus:outline-none"
                  />
                  {/* Quick Color Palette Circles */}
                  <div className="flex items-center gap-1.5 ml-auto">
                    {[
                      { color: '#FFFFFF', name: 'White' },
                      { color: '#12231A', name: 'Dark Jade' },
                      { color: '#96F816', name: 'Neon Lime' },
                      { color: '#C5A880', name: 'Amber Gold' },
                      { color: '#F5E6E8', name: 'Rose Blush' },
                      { color: '#0F172A', name: 'Midnight' },
                    ].map((item) => (
                      <button
                        key={item.color}
                        type="button"
                        onClick={() => setGlassColor(item.color)}
                        title={item.name}
                        className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer shadow-xs ${
                          glassColor.toUpperCase() === item.color.toUpperCase()
                            ? 'border-[#12231A] scale-110'
                            : 'border-white'
                        }`}
                        style={{ backgroundColor: item.color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Opacity Slider */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#12231A] uppercase tracking-wider flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-[#886938]" />
                    Glass Opacity (Translucency)
                  </span>
                  <span className="font-mono font-bold text-[#886938]">{glassOpacity}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={glassOpacity}
                  onChange={(e) => setGlassOpacity(Number(e.target.value))}
                  className="w-full accent-[#12231A] cursor-pointer h-2 bg-[#E6DFD5] rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-[#717A75]">
                  <span>5% (Ultra Sheer)</span>
                  <span>50% (Semi-Translucent)</span>
                  <span>100% (Solid Matte)</span>
                </div>
              </div>

              {/* Blur Intensity Slider */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#12231A] uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#886938]" />
                    Backdrop Filter Blur
                  </span>
                  <span className="font-mono font-bold text-[#886938]">{glassBlur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={glassBlur}
                  onChange={(e) => setGlassBlur(Number(e.target.value))}
                  className="w-full accent-[#12231A] cursor-pointer h-2 bg-[#E6DFD5] rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-[#717A75]">
                  <span>0px (Crisp / No Blur)</span>
                  <span>16px (Luxury Frosted)</span>
                  <span>40px (Deep Diffusion)</span>
                </div>
              </div>

              {/* Border Color & Opacity Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#12231A] uppercase tracking-wider block">
                    Border Glass Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={glassBorderColor}
                      onChange={(e) => setGlassBorderColor(e.target.value)}
                      className="w-9 h-9 p-0.5 rounded-sm border border-[#E6DFD5] cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={glassBorderColor}
                      onChange={(e) => setGlassBorderColor(e.target.value)}
                      className="w-24 p-2 text-xs font-mono font-bold bg-[#FAF8F5] border border-[#E6DFD5] rounded-xs uppercase focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#12231A] uppercase tracking-wider">
                      Border Sheen Opacity
                    </span>
                    <span className="font-mono font-bold text-[#886938]">{glassBorderOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={glassBorderOpacity}
                    onChange={(e) => setGlassBorderOpacity(Number(e.target.value))}
                    className="w-full accent-[#12231A] cursor-pointer h-2 bg-[#E6DFD5] rounded-lg"
                  />
                </div>
              </div>

              {/* Border Radius & Shadow Glow Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#12231A] uppercase tracking-wider">
                      Corner Radius
                    </span>
                    <span className="font-mono font-bold text-[#886938]">{glassBorderRadius}px</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="32"
                    value={glassBorderRadius}
                    onChange={(e) => setGlassBorderRadius(Number(e.target.value))}
                    className="w-full accent-[#12231A] cursor-pointer h-2 bg-[#E6DFD5] rounded-lg"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#12231A] uppercase tracking-wider block">
                    Glow / Ambient Sheen
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setGlassGlow(!glassGlow)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xs border transition-colors cursor-pointer ${
                        glassGlow
                          ? 'bg-[#12231A] text-[#96F816] border-[#12231A]'
                          : 'bg-white text-gray-500 border-gray-300'
                      }`}
                    >
                      {glassGlow ? 'Glow Enabled' : 'Glow Off'}
                    </button>
                    {glassGlow && (
                      <input
                        type="color"
                        value={glassGlowColor}
                        onChange={(e) => setGlassGlowColor(e.target.value)}
                        className="w-8 h-8 p-0.5 rounded-sm border border-[#E6DFD5] cursor-pointer"
                        title="Glow Color"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Card Text Contrast Mode */}
              <div className="space-y-2 pt-2 border-t border-[#E6DFD5]">
                <label className="text-xs font-bold text-[#12231A] uppercase tracking-wider block">
                  Card Typography Contrast Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setGlassTextColor('auto')}
                    className={`p-2 text-xs font-medium rounded-xs border text-center transition-colors cursor-pointer ${
                      glassTextColor === 'auto'
                        ? 'bg-[#12231A] text-[#DFCAAB] border-[#12231A] font-bold shadow-xs'
                        : 'bg-[#FAF8F5] text-gray-700 border-[#E6DFD5]'
                    }`}
                  >
                    Auto Contrast
                  </button>
                  <button
                    type="button"
                    onClick={() => setGlassTextColor('dark')}
                    className={`p-2 text-xs font-medium rounded-xs border text-center transition-colors cursor-pointer ${
                      glassTextColor === 'dark'
                        ? 'bg-[#12231A] text-[#DFCAAB] border-[#12231A] font-bold shadow-xs'
                        : 'bg-[#FAF8F5] text-gray-700 border-[#E6DFD5]'
                    }`}
                  >
                    Dark Text (Charcoal)
                  </button>
                  <button
                    type="button"
                    onClick={() => setGlassTextColor('light')}
                    className={`p-2 text-xs font-medium rounded-xs border text-center transition-colors cursor-pointer ${
                      glassTextColor === 'light'
                        ? 'bg-[#12231A] text-[#96F816] border-[#12231A] font-bold shadow-xs'
                        : 'bg-[#FAF8F5] text-gray-700 border-[#E6DFD5]'
                    }`}
                  >
                    Light Text (Ivory/White)
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Live Interactive Storefront Simulator */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-[#12231A] border border-[#233F30] rounded-sm p-6 shadow-xl relative overflow-hidden">
                {/* Background Storefront Simulation Gradient */}
                <div className="absolute inset-0 bg-radial from-[#1A3828] via-[#12231A] to-[#0A140F] opacity-90" />
                <div className="absolute -top-10 -right-10 w-44 h-44 bg-[#96F816]/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <span className="text-[11px] font-bold text-[#96F816] uppercase tracking-wider flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      Live Storefront Card Simulator
                    </span>
                    <span className="text-[10px] text-white/50 font-mono">Real-time preview</span>
                  </div>

                  {/* Simulated Hero Card with live styles */}
                  <div className="flex justify-center py-6">
                    {(() => {
                      const sampleBg = glassEnabled
                        ? hexToRgba(glassColor, glassOpacity / 100)
                        : '#FFFFFF';
                      const sampleBorder = glassEnabled
                        ? `1px solid ${hexToRgba(glassBorderColor, glassBorderOpacity / 100)}`
                        : '1px solid rgba(255,255,255,0.7)';
                      const sampleShadow = glassEnabled && glassGlow
                        ? `0 12px 30px -6px ${hexToRgba(glassGlowColor, 0.3)}, 0 4px 10px -2px ${hexToRgba(glassGlowColor, 0.2)}`
                        : '0 8px 16px -2px rgba(0, 0, 0, 0.2)';

                      const isLightText =
                        glassTextColor === 'light' ||
                        (glassTextColor === 'auto' && isColorDark(glassColor) && glassOpacity > 40);

                      return (
                        <div
                          className="w-[220px] h-[190px] p-3 transition-all duration-300 flex flex-col justify-between relative group select-none ring-2 ring-[#96F816] overflow-visible"
                          style={{
                            backgroundColor: sampleBg,
                            backdropFilter: glassEnabled ? `blur(${glassBlur}px)` : 'none',
                            WebkitBackdropFilter: glassEnabled ? `blur(${glassBlur}px)` : 'none',
                            border: sampleBorder,
                            borderRadius: `${glassBorderRadius}px`,
                            boxShadow: sampleShadow,
                          }}
                        >
                          {/* Heart icon */}
                          <div className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 shadow-xs">
                            <Sparkles className="w-3 h-3 text-[#12231A]" />
                          </div>

                          {/* Image (overflow-hidden removed) */}
                          <div className="w-full h-22 flex items-center justify-center relative overflow-visible">
                            <img
                              src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=300&q=80"
                              alt="Simulator Bottle"
                              className="max-h-full max-w-full object-contain filter drop-shadow-md"
                            />
                          </div>

                          {/* Info */}
                          <div>
                            <div className="flex items-center justify-between">
                              <span
                                className={`font-extrabold text-sm tracking-tight ${
                                  isLightText ? 'text-white' : 'text-[#12231A]'
                                }`}
                              >
                                ₹3,499
                              </span>
                              <span className="text-[9px] text-[#96F816] font-bold">50ml</span>
                            </div>
                            <p
                              className={`text-[11px] font-bold truncate leading-tight mt-0.5 ${
                                isLightText ? 'text-gray-100' : 'text-slate-800'
                              }`}
                            >
                              Centella Moisture Cream
                            </p>
                            <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/20">
                              <span
                                className={`text-[8px] font-medium ${
                                  isLightText ? 'text-gray-300' : 'text-gray-500'
                                }`}
                              >
                                50ml / 1.7 FL.OZ
                              </span>
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#96F816] text-[#12231A] shadow-xs">
                                Add +
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Simulator Diagnostics Info */}
                  <div className="p-3 bg-black/40 border border-white/10 rounded-sm text-[11px] font-mono text-gray-300 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Glass Status:</span>
                      <span className={glassEnabled ? 'text-[#96F816] font-bold' : 'text-gray-400'}>
                        {glassEnabled ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">CSS Background:</span>
                      <span className="text-amber-200 truncate max-w-[190px]">
                        {hexToRgba(glassColor, glassOpacity / 100)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">CSS Backdrop Blur:</span>
                      <span className="text-white">{glassBlur}px</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Border Radius:</span>
                      <span className="text-white">{glassBorderRadius}px</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveGlassSettings}
                    className="w-full py-2.5 bg-[#96F816] text-[#12231A] text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-[#85e110] transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-[#96F816]/20"
                  >
                    <Save className="w-4 h-4" />
                    <span>Apply Glass Styles to Storefront</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Create Slide Modal (Individual Carousel Settings) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="w-full max-w-4xl bg-white rounded-sm border border-[#E6DFD5] shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#E6DFD5] bg-[#FAF8F5] flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#12231A] text-[#96F816] flex items-center justify-center">
                  <Sliders className="w-4 h-4 text-[#96F816]" />
                </div>
                <div>
                  <h3 className="text-sm font-serif font-bold text-[#12231A]">
                    {editingSlide
                      ? `Edit Hero Slide: #${heroSlides.findIndex((s) => s.id === editingSlide.id) + 1} — ${title || 'Fragrance Slide'}`
                      : 'Create New Hero Carousel Slide'}
                  </h3>
                  <p className="text-[10px] text-[#717A75]">
                    Individual Carousel Slide & Imagery Controls
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-gray-200 transition-colors flex items-center justify-center text-gray-500 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSaveSlide} className="overflow-y-auto p-4 sm:p-6 space-y-6 text-xs flex-1">
              {/* Individual Carousel Isolation Banner */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-sm flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                    <span>Individual Carousel Isolation Guaranteed</span>
                    <span className="px-1.5 py-0.2 bg-emerald-600 text-white text-[9px] rounded-xs font-mono font-bold">Isolated</span>
                  </div>
                  <p className="text-[10px] text-emerald-800 leading-relaxed">
                    All settings configured below (card packshot, hero background stage image, individual object-fit properties, positioning, custom card glassmorphism colors, and canvas mood) apply <strong>STRICTLY to this slide</strong>. Modifying this carousel slide will have <strong>NO EFFECT on other carousel slides</strong>.
                  </p>
                </div>
              </div>

              {/* Section 1: Slide Content & Typography */}
              <div className="bg-[#FAF8F5] border border-[#E6DFD5] p-4 rounded-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E6DFD5] pb-2">
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-[#12231A]" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#12231A]">
                      1. Slide Content & Individual Section Typography
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenTypoPanels({
                          title: true,
                          subtitle: true,
                          headlineFirst: true,
                          headlineSecond: true,
                          description: true,
                        })
                      }
                      className="text-[10px] text-[#886938] hover:text-[#12231A] font-semibold cursor-pointer"
                    >
                      Expand All
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenTypoPanels({
                          title: false,
                          subtitle: false,
                          headlineFirst: false,
                          headlineSecond: false,
                          description: false,
                        })
                      }
                      className="text-[10px] text-[#717A75] hover:text-[#12231A] font-semibold cursor-pointer"
                    >
                      Collapse All
                    </button>
                  </div>
                </div>

                {/* 1. Slide Title */}
                <div className="space-y-1.5 bg-white p-3 border border-[#E6DFD5] rounded-sm">
                  <label className="block text-[11px] font-bold text-[#12231A] uppercase tracking-wide">
                    Slide Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="e.g. Centella Moisture Cream"
                    className="w-full p-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs focus:outline-none focus:border-[#12231A]"
                  />
                  <TypographyControlBlock
                    label="Slide Title"
                    fieldKey="title"
                    value={titleStyle}
                    onChange={(updates) => setTitleStyle((prev) => ({ ...prev, ...updates }))}
                    onReset={() =>
                      setTitleStyle({
                        fontWeight: '600',
                        color: '#FFFFFF',
                        fontStyle: 'normal',
                        fontFamily: 'sans',
                        textTransform: 'none',
                        letterSpacing: 'normal',
                      })
                    }
                    previewText={title}
                    isOpen={openTypoPanels.title}
                    onToggleOpen={() =>
                      setOpenTypoPanels((prev) => ({ ...prev, title: !prev.title }))
                    }
                    isMoreOpen={openMoreOptions.title}
                    onToggleMore={() =>
                      setOpenMoreOptions((prev) => ({ ...prev, title: !prev.title }))
                    }
                    defaultColor="#FFFFFF"
                    defaultWeight="600"
                    defaultFamily="sans"
                  />
                </div>

                {/* 2. Subtitle / Botanical Type */}
                <div className="space-y-1.5 bg-white p-3 border border-[#E6DFD5] rounded-sm">
                  <label className="block text-[11px] font-bold text-[#12231A] uppercase tracking-wide">
                    Subtitle / Botanical Type *
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    required
                    placeholder="e.g. Restorative Dermal Barrier & Moisture Cream"
                    className="w-full p-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs focus:outline-none focus:border-[#12231A]"
                  />
                  <TypographyControlBlock
                    label="Subtitle Badge"
                    fieldKey="subtitle"
                    value={subtitleStyle}
                    onChange={(updates) => setSubtitleStyle((prev) => ({ ...prev, ...updates }))}
                    onReset={() =>
                      setSubtitleStyle({
                        fontWeight: '600',
                        color: '#96F816',
                        pillBgColor: '#12231A',
                        fontStyle: 'normal',
                        fontFamily: 'sans',
                        textTransform: 'uppercase',
                        letterSpacing: 'wide',
                      })
                    }
                    previewText={subtitle}
                    isSubtitle={true}
                    isOpen={openTypoPanels.subtitle}
                    onToggleOpen={() =>
                      setOpenTypoPanels((prev) => ({ ...prev, subtitle: !prev.subtitle }))
                    }
                    isMoreOpen={openMoreOptions.subtitle}
                    onToggleMore={() =>
                      setOpenMoreOptions((prev) => ({ ...prev, subtitle: !prev.subtitle }))
                    }
                    defaultColor="#96F816"
                    defaultWeight="600"
                    defaultFamily="sans"
                    defaultTransform="uppercase"
                    defaultLetterSpacing="wide"
                    defaultPillBg="#12231A"
                  />
                </div>

                {/* 3. Headline Line 1 */}
                <div className="space-y-1.5 bg-white p-3 border border-[#E6DFD5] rounded-sm">
                  <label className="block text-[11px] font-bold text-[#12231A] uppercase tracking-wide">
                    Headline Line 1 *
                  </label>
                  <input
                    type="text"
                    value={headlineFirst}
                    onChange={(e) => setHeadlineFirst(e.target.value)}
                    required
                    placeholder="e.g. Bloom in"
                    className="w-full p-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs focus:outline-none focus:border-[#12231A]"
                  />
                  <TypographyControlBlock
                    label="Headline Line 1"
                    fieldKey="headlineFirst"
                    value={headlineFirstStyle}
                    onChange={(updates) => setHeadlineFirstStyle((prev) => ({ ...prev, ...updates }))}
                    onReset={() =>
                      setHeadlineFirstStyle({
                        fontWeight: '500',
                        color: '#FFFFFF',
                        fontStyle: 'normal',
                        fontFamily: 'sans',
                        textTransform: 'none',
                        letterSpacing: 'normal',
                      })
                    }
                    previewText={headlineFirst}
                    isOpen={openTypoPanels.headlineFirst}
                    onToggleOpen={() =>
                      setOpenTypoPanels((prev) => ({ ...prev, headlineFirst: !prev.headlineFirst }))
                    }
                    isMoreOpen={openMoreOptions.headlineFirst}
                    onToggleMore={() =>
                      setOpenMoreOptions((prev) => ({ ...prev, headlineFirst: !prev.headlineFirst }))
                    }
                    defaultColor="#FFFFFF"
                    defaultWeight="500"
                    defaultFamily="sans"
                  />
                </div>

                {/* 4. Headline Line 2 (Golden Accent) */}
                <div className="space-y-1.5 bg-white p-3 border border-[#E6DFD5] rounded-sm">
                  <label className="block text-[11px] font-bold text-[#12231A] uppercase tracking-wide">
                    Headline Line 2 (Golden Accent) *
                  </label>
                  <input
                    type="text"
                    value={headlineSecond}
                    onChange={(e) => setHeadlineSecond(e.target.value)}
                    required
                    placeholder="e.g. Pure Radiance"
                    className="w-full p-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs focus:outline-none font-serif font-bold text-[#886938]"
                  />
                  <TypographyControlBlock
                    label="Headline Line 2"
                    fieldKey="headlineSecond"
                    value={headlineSecondStyle}
                    onChange={(updates) => setHeadlineSecondStyle((prev) => ({ ...prev, ...updates }))}
                    onReset={() =>
                      setHeadlineSecondStyle({
                        fontWeight: '500',
                        color: '#FFFFFF',
                        fontStyle: 'normal',
                        fontFamily: 'serif',
                        textTransform: 'none',
                        letterSpacing: 'normal',
                      })
                    }
                    previewText={headlineSecond}
                    isOpen={openTypoPanels.headlineSecond}
                    onToggleOpen={() =>
                      setOpenTypoPanels((prev) => ({ ...prev, headlineSecond: !prev.headlineSecond }))
                    }
                    isMoreOpen={openMoreOptions.headlineSecond}
                    onToggleMore={() =>
                      setOpenMoreOptions((prev) => ({ ...prev, headlineSecond: !prev.headlineSecond }))
                    }
                    defaultColor="#FFFFFF"
                    defaultWeight="500"
                    defaultFamily="serif"
                  />
                </div>

                {/* 5. Editorial Description */}
                <div className="space-y-1.5 bg-white p-3 border border-[#E6DFD5] rounded-sm">
                  <label className="block text-[11px] font-bold text-[#12231A] uppercase tracking-wide">
                    Editorial Description *
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    placeholder="Poetic fragrance and dermal description..."
                    className="w-full p-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs focus:outline-none focus:border-[#12231A]"
                  />
                  <TypographyControlBlock
                    label="Editorial Description"
                    fieldKey="description"
                    value={descriptionStyle}
                    onChange={(updates) => setDescriptionStyle((prev) => ({ ...prev, ...updates }))}
                    onReset={() =>
                      setDescriptionStyle({
                        fontWeight: '400',
                        color: '#FFFFFF',
                        fontStyle: 'normal',
                        fontFamily: 'sans',
                        textTransform: 'none',
                        letterSpacing: 'normal',
                      })
                    }
                    previewText={description}
                    isOpen={openTypoPanels.description}
                    onToggleOpen={() =>
                      setOpenTypoPanels((prev) => ({ ...prev, description: !prev.description }))
                    }
                    isMoreOpen={openMoreOptions.description}
                    onToggleMore={() =>
                      setOpenMoreOptions((prev) => ({ ...prev, description: !prev.description }))
                    }
                    defaultColor="#FFFFFF"
                    defaultWeight="400"
                    defaultFamily="sans"
                  />
                </div>

                {/* Price and Variant Size info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#E6DFD5]">
                  <div>
                    <label className="block text-[10px] font-bold text-[#717A75] uppercase mb-1">Price (INR ₹) *</label>
                    <input
                      type="number"
                      value={priceINR}
                      onChange={(e) => setPriceINR(Number(e.target.value))}
                      required
                      className="w-full p-2 bg-white border border-[#E6DFD5] text-xs focus:outline-none font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#717A75] uppercase mb-1">Variant Size</label>
                    <select
                      value={variantSize}
                      onChange={(e) => setVariantSize(e.target.value as '30ml' | '50ml' | '100ml')}
                      className="w-full p-2 bg-white border border-[#E6DFD5] text-xs focus:outline-none"
                    >
                      <option value="30ml">30ml</option>
                      <option value="50ml">50ml</option>
                      <option value="100ml">100ml</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#717A75] uppercase mb-1">Volume Display Label</label>
                    <input
                      type="text"
                      value={volumeLabel}
                      onChange={(e) => setVolumeLabel(e.target.value)}
                      placeholder="e.g. 50ml / 1.7 FL.OZ"
                      className="w-full p-2 bg-white border border-[#E6DFD5] text-xs focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Individual Images & object-fit Settings */}
              <div className="bg-[#FAF8F5] border border-[#E6DFD5] p-4 rounded-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-[#E6DFD5] pb-2">
                  <ImageIcon className="w-3.5 h-3.5 text-[#12231A]" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#12231A]">
                    2. Slide Images & Individual Object-Fit Options
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Card Packshot Box */}
                  <div className="bg-white p-3.5 border border-[#E6DFD5] rounded-sm space-y-3">
                    <label className="block text-[11px] font-bold text-[#12231A] uppercase tracking-wide">
                      A. Card Packshot Bottle (PNG / Transparent)
                    </label>

                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-sm border border-[#C5A880] overflow-hidden flex items-center justify-center shrink-0 bg-[repeating-conic-gradient(#e5e7eb_0%_25%,_#ffffff_0%_50%)] bg-[length:10px_10px] p-1 shadow-inner">
                        <img
                          src={cardImage}
                          alt=""
                          className="max-w-full max-h-full"
                          style={{ objectFit: cardImageObjectFit }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setImageModalTarget('cardImage')}
                        className="px-3 py-2 bg-[#FAF8F5] border border-[#12231A] text-[#12231A] text-xs font-semibold hover:bg-[#12231A] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Upload / Edit Bottle PNG</span>
                      </button>
                    </div>

                    {/* Card Packshot Object-Fit Selector */}
                    <div className="p-2.5 bg-[#FAF8F5] border border-[#E6DFD5] rounded-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#12231A] uppercase tracking-wider flex items-center gap-1">
                          <Sliders className="w-3 h-3 text-[#886938]" />
                          Packshot Object-Fit:
                        </span>
                        <span className="text-[10px] font-mono font-bold text-[#886938] uppercase">
                          {cardImageObjectFit}
                        </span>
                      </div>
                      <div className="grid grid-cols-5 gap-1">
                        {(['contain', 'cover', 'fill', 'scale-down', 'none'] as ObjectFitProperty[]).map((fit) => (
                          <button
                            key={fit}
                            type="button"
                            onClick={() => setCardImageObjectFit(fit)}
                            className={`py-1 text-[10px] font-medium rounded-xs border text-center transition-colors cursor-pointer ${
                              cardImageObjectFit === fit
                                ? 'bg-[#12231A] text-[#DFCAAB] border-[#12231A] font-bold shadow-xs'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                            }`}
                          >
                            {fit}
                          </button>
                        ))}
                      </div>
                      <p className="text-[9px] text-[#717A75] italic">
                        {cardImageObjectFit === 'contain' && '• contain: Preserves aspect ratio without cropping (Recommended for perfume bottles).'}
                        {cardImageObjectFit === 'cover' && '• cover: Fills entire card packshot bounds, clipping edges.'}
                        {cardImageObjectFit === 'fill' && '• fill: Stretches dimensions to match container width & height.'}
                        {cardImageObjectFit === 'scale-down' && '• scale-down: Downscales only if container is smaller.'}
                        {cardImageObjectFit === 'none' && '• none: Renders original image dimensions without scaling.'}
                      </p>
                    </div>
                  </div>

                  {/* Full Hero Section Stage Centerpiece */}
                  <div className="bg-white p-3.5 border border-[#E6DFD5] rounded-sm space-y-3">
                    <label className="block text-[11px] font-bold text-[#12231A] uppercase tracking-wide">
                      B. Full Hero Section Image / Centerpiece Stage
                    </label>

                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-sm border border-[#C5A880] overflow-hidden flex items-center justify-center shrink-0 bg-[repeating-conic-gradient(#e5e7eb_0%_25%,_#ffffff_0%_50%)] bg-[length:10px_10px] p-1 shadow-inner">
                        <img
                          src={heroModelImage}
                          alt=""
                          className="w-full h-full"
                          style={{
                            objectFit: heroModelObjectFit,
                            objectPosition: heroModelObjectPosition,
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setImageModalTarget('heroModelImage')}
                        className="px-3 py-2 bg-[#FAF8F5] border border-[#12231A] text-[#12231A] text-xs font-semibold hover:bg-[#12231A] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Upload / Edit Stage Image</span>
                      </button>
                    </div>

                    {/* Stage Object-Fit Selector */}
                    <div className="p-2.5 bg-[#FAF8F5] border border-[#E6DFD5] rounded-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#12231A] uppercase tracking-wider flex items-center gap-1">
                          <Sliders className="w-3 h-3 text-[#886938]" />
                          Full Hero Stage Object-Fit:
                        </span>
                        <span className="text-[10px] font-mono font-bold text-[#886938] uppercase">
                          {heroModelObjectFit}
                        </span>
                      </div>
                      <div className="grid grid-cols-5 gap-1">
                        {(['cover', 'contain', 'fill', 'scale-down', 'none'] as ObjectFitProperty[]).map((fit) => (
                          <button
                            key={fit}
                            type="button"
                            onClick={() => setHeroModelObjectFit(fit)}
                            className={`py-1 text-[10px] font-medium rounded-xs border text-center transition-colors cursor-pointer ${
                              heroModelObjectFit === fit
                                ? 'bg-[#12231A] text-[#DFCAAB] border-[#12231A] font-bold shadow-xs'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                            }`}
                          >
                            {fit}
                          </button>
                        ))}
                      </div>

                      {/* Stage Object-Position Selector */}
                      <div className="pt-2 border-t border-[#E6DFD5]/60">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold text-[#12231A] uppercase tracking-wider">
                            Object-Position on Hero Section:
                          </span>
                          <span className="text-[10px] font-mono text-[#717A75]">{heroModelObjectPosition}</span>
                        </div>
                        <div className="grid grid-cols-5 gap-1">
                          {[
                            { id: 'center center', label: 'Center' },
                            { id: 'center bottom', label: 'Bottom' },
                            { id: 'center top', label: 'Top' },
                            { id: 'left center', label: 'Left' },
                            { id: 'right center', label: 'Right' },
                          ].map((pos) => (
                            <button
                              key={pos.id}
                              type="button"
                              onClick={() => setHeroModelObjectPosition(pos.id)}
                              className={`py-1 text-[9px] font-medium rounded-xs border text-center transition-colors cursor-pointer ${
                                heroModelObjectPosition === pos.id
                                  ? 'bg-[#886938] text-white border-[#886938] font-bold'
                                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                              }`}
                            >
                              {pos.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Stage Atmosphere & Canvas Tone */}
              <div className="bg-[#FAF8F5] border border-[#E6DFD5] p-4 rounded-sm space-y-3">
                <div className="flex items-center justify-between border-b border-[#E6DFD5] pb-2">
                  <div className="flex items-center gap-2">
                    <Palette className="w-3.5 h-3.5 text-[#12231A]" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#12231A]">
                      3. Stage Canvas Atmosphere (Active Mood Tone)
                    </span>
                  </div>
                  <span className="text-[10px] text-[#717A75] italic">Applies only when this slide is active</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 border border-[#E6DFD5] rounded-xs">
                    <input
                      type="color"
                      value={canvasBgColor || '#A0B7A3'}
                      onChange={(e) => setCanvasBgColor(e.target.value)}
                      className="w-6 h-6 border-0 cursor-pointer rounded-xs"
                    />
                    <input
                      type="text"
                      value={canvasBgColor}
                      onChange={(e) => setCanvasBgColor(e.target.value)}
                      placeholder="#A0B7A3 (Default)"
                      className="w-24 text-[11px] font-mono focus:outline-none"
                    />
                  </div>

                  {/* Preset Luxury Moods */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { name: 'Default Sage', hex: '#A0B7A3' },
                      { name: 'Noir Emerald', hex: '#12231A' },
                      { name: 'Forest Moss', hex: '#3B4D3F' },
                      { name: 'Warm Amber', hex: '#8B5E3C' },
                      { name: 'Champagne Sand', hex: '#B5A28A' },
                      { name: 'Midnight Slate', hex: '#1E293B' },
                    ].map((mood) => (
                      <button
                        key={mood.hex}
                        type="button"
                        onClick={() => setCanvasBgColor(mood.hex)}
                        className={`px-2 py-1 text-[9px] rounded-xs border font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                          canvasBgColor === mood.hex
                            ? 'bg-[#12231A] text-white border-[#12231A] font-bold shadow-xs'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: mood.hex }} />
                        <span>{mood.name}</span>
                      </button>
                    ))}
                    {canvasBgColor && (
                      <button
                        type="button"
                        onClick={() => setCanvasBgColor('')}
                        className="px-2 py-1 text-[9px] text-gray-500 hover:text-black underline cursor-pointer"
                      >
                        Clear (Use Default)
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 4: Individual Carousel Card Glassmorphism & Color Settings */}
              <div className="bg-white border-2 border-[#C5A880]/50 p-4 rounded-sm space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E6DFD5] pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#886938]" />
                    <div>
                      <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#12231A]">
                        4. Individual Card Glassmorphism & Color Styling
                      </h4>
                      <p className="text-[10px] text-[#717A75]">
                        Controls how THIS specific carousel card looks in the bottom slider
                      </p>
                    </div>
                  </div>

                  {/* Individual Card Style Toggle */}
                  <label className="inline-flex items-center gap-2 cursor-pointer bg-[#FAF8F5] px-3 py-1.5 border border-[#E6DFD5] rounded-xs hover:border-[#12231A] transition-colors">
                    <input
                      type="checkbox"
                      checked={customCardGlass}
                      onChange={(e) => setCustomCardGlass(e.target.checked)}
                      className="w-4 h-4 accent-[#12231A] rounded cursor-pointer"
                    />
                    <span className="text-[11px] font-bold text-[#12231A]">
                      Enable Custom Card Glass for this Slide
                    </span>
                  </label>
                </div>

                {!customCardGlass ? (
                  <div className="p-4 bg-[#FAF8F5] rounded-xs border border-dashed border-[#E6DFD5] text-center">
                    <p className="text-[11px] font-semibold text-[#12231A]">
                      This slide is currently using the <span className="underline">Global Card Glassmorphism</span> settings.
                    </p>
                    <p className="text-[10px] text-[#717A75] mt-1">
                      Check &quot;Enable Custom Card Glass for this Slide&quot; above to give this carousel card its own unique glass color, opacity, blur, border, glow, and text mode without altering any other carousel cards!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Controls Column */}
                    <div className="lg:col-span-7 space-y-4">
                      {/* Card Glass Tint Color */}
                      <div>
                        <label className="block text-[10px] font-bold text-[#717A75] uppercase mb-1.5">
                          Card Glass / Background Tint Color
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={cardGlassColor}
                            onChange={(e) => setCardGlassColor(e.target.value)}
                            className="w-8 h-8 rounded-xs border border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={cardGlassColor}
                            onChange={(e) => setCardGlassColor(e.target.value)}
                            className="w-28 p-1.5 bg-[#FAF8F5] border border-[#E6DFD5] text-xs font-mono uppercase"
                          />

                          {/* Quick Swatches */}
                          <div className="flex items-center gap-1.5">
                            {[
                              { label: 'Frosted White', hex: '#FFFFFF' },
                              { label: 'Emerald Noir', hex: '#12231A' },
                              { label: 'HIFFYY Lime', hex: '#96F816' },
                              { label: 'Royal Amber', hex: '#C5A880' },
                              { label: 'Slate Night', hex: '#1E293B' },
                              { label: 'Rose Quartz', hex: '#F5E8E4' },
                            ].map((swatch) => (
                              <button
                                key={swatch.hex}
                                type="button"
                                title={swatch.label}
                                onClick={() => setCardGlassColor(swatch.hex)}
                                style={{ backgroundColor: swatch.hex }}
                                className={`w-6 h-6 rounded-full border transition-transform ${
                                  cardGlassColor.toLowerCase() === swatch.hex.toLowerCase()
                                    ? 'ring-2 ring-offset-1 ring-[#12231A] scale-110'
                                    : 'border-black/20 hover:scale-105'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Opacity & Blur Sliders */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] font-bold text-[#717A75] uppercase">Card Opacity</label>
                            <span className="font-mono text-[10px] text-[#12231A] font-bold">{cardGlassOpacity}%</span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="100"
                            value={cardGlassOpacity}
                            onChange={(e) => setCardGlassOpacity(Number(e.target.value))}
                            className="w-full accent-[#12231A] cursor-pointer"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] font-bold text-[#717A75] uppercase">Backdrop Blur</label>
                            <span className="font-mono text-[10px] text-[#12231A] font-bold">{cardGlassBlur}px</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="40"
                            value={cardGlassBlur}
                            onChange={(e) => setCardGlassBlur(Number(e.target.value))}
                            className="w-full accent-[#12231A] cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Border Color & Opacity */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-[#717A75] uppercase mb-1">Border Color</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={cardBorderColor}
                              onChange={(e) => setCardBorderColor(e.target.value)}
                              className="w-7 h-7 rounded-xs border border-gray-300 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={cardBorderColor}
                              onChange={(e) => setCardBorderColor(e.target.value)}
                              className="w-24 p-1.5 bg-[#FAF8F5] border border-[#E6DFD5] text-xs font-mono uppercase"
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] font-bold text-[#717A75] uppercase">Border Opacity</label>
                            <span className="font-mono text-[10px] text-[#12231A] font-bold">{cardBorderOpacity}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={cardBorderOpacity}
                            onChange={(e) => setCardBorderOpacity(Number(e.target.value))}
                            className="w-full accent-[#12231A] cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Active Ring & Glow Color */}
                      <div>
                        <label className="block text-[10px] font-bold text-[#717A75] uppercase mb-1.5">
                          Active Selection Ring & Glow Accent Color
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={cardGlowColor}
                            onChange={(e) => setCardGlowColor(e.target.value)}
                            className="w-8 h-8 rounded-xs border border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={cardGlowColor}
                            onChange={(e) => setCardGlowColor(e.target.value)}
                            className="w-28 p-1.5 bg-[#FAF8F5] border border-[#E6DFD5] text-xs font-mono uppercase"
                          />
                          <div className="flex items-center gap-1.5">
                            {['#96F816', '#C5A880', '#FFFFFF', '#38BDF8', '#F43F5E'].map((clr) => (
                              <button
                                key={clr}
                                type="button"
                                onClick={() => setCardGlowColor(clr)}
                                style={{ backgroundColor: clr }}
                                className={`w-5 h-5 rounded-full border ${
                                  cardGlowColor.toLowerCase() === clr.toLowerCase()
                                    ? 'ring-2 ring-offset-1 ring-black'
                                    : 'border-black/20'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Card Text Color Mode */}
                      <div>
                        <label className="block text-[10px] font-bold text-[#717A75] uppercase mb-1.5">
                          Card Typography Tone
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'auto', label: 'Auto (Contrast)' },
                            { id: 'dark', label: 'Dark Text' },
                            { id: 'light', label: 'Light / White' },
                          ].map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setCardGlassTextColor(opt.id as 'auto' | 'dark' | 'light')}
                              className={`py-1.5 text-[10px] font-bold rounded-xs border text-center transition-colors cursor-pointer ${
                                cardGlassTextColor === opt.id
                                  ? 'bg-[#12231A] text-[#DFCAAB] border-[#12231A]'
                                  : 'bg-[#FAF8F5] text-gray-700 border-gray-200 hover:border-gray-400'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Live Preview Column */}
                    <div className="lg:col-span-5 bg-[#FAF8F5] p-4 rounded-sm border border-[#E6DFD5] flex flex-col items-center justify-center space-y-3">
                      <span className="text-[10px] font-bold text-[#12231A] uppercase tracking-wider flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-[#886938]" />
                        Live Interactive Card Preview
                      </span>

                      {/* Render Simulated Card */}
                      {(() => {
                        const previewBg = hexToRgba(cardGlassColor, cardGlassOpacity / 100);
                        const previewBorder = `1px solid ${hexToRgba(cardBorderColor, cardBorderOpacity / 100)}`;
                        const previewLight =
                          cardGlassTextColor === 'light' ||
                          (cardGlassTextColor !== 'dark' && isColorDark(cardGlassColor) && cardGlassOpacity > 40);

                        return (
                          <div
                            style={{
                              backgroundColor: previewBg,
                              backdropFilter: `blur(${cardGlassBlur}px)`,
                              border: `2px solid ${cardGlowColor}`,
                              borderRadius: '16px',
                              boxShadow: `0 12px 30px -4px ${hexToRgba(cardGlowColor, 0.45)}`,
                            }}
                            className="w-[200px] h-[190px] p-3 flex flex-col justify-between relative shadow-lg overflow-visible"
                          >
                            <div className="w-full h-20 flex items-center justify-center relative overflow-visible">
                              <img
                                src={cardImage}
                                alt="Preview"
                                style={{
                                  objectFit: cardImageObjectFit,
                                  width: cardImageObjectFit === 'cover' || cardImageObjectFit === 'fill' ? '100%' : undefined,
                                  height: cardImageObjectFit === 'cover' || cardImageObjectFit === 'fill' ? '100%' : undefined,
                                }}
                                className="max-h-full max-w-full drop-shadow-md"
                              />
                            </div>

                            <div>
                              <div className={`font-extrabold text-xs tracking-tight flex items-center justify-between ${
                                previewLight ? 'text-white' : 'text-[#12231A]'
                              }`}>
                                <span>₹{(priceINR || 3499).toLocaleString()}</span>
                              </div>

                              <div className={`text-[11px] font-semibold leading-tight line-clamp-1 mt-0.5 ${
                                previewLight ? 'text-gray-100' : 'text-slate-800'
                              }`}>
                                {title || 'Product Title'}
                              </div>

                              <div className="flex items-center justify-between gap-1 mt-1.5">
                                <span className={`text-[8px] font-medium ${
                                  previewLight ? 'text-gray-300' : 'text-slate-400'
                                }`}>
                                  {volumeLabel || '50ml'}
                                </span>

                                <span
                                  style={{
                                    backgroundColor: cardGlowColor,
                                    color: isColorDark(cardGlowColor) ? '#FFFFFF' : '#12231A',
                                  }}
                                  className="text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs cursor-default"
                                >
                                  Book
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      <p className="text-[9px] text-[#717A75] text-center italic max-w-[220px]">
                        Preview renders this specific slide with its custom bottle object-fit, glass opacity, blur, text color, and glow accent.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-[#E6DFD5] bg-white sticky bottom-0">
                <span className="text-[10px] text-[#717A75]">
                  {editingSlide ? 'Editing existing carousel item' : 'Creating new carousel item'}
                </span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-white border border-[#E6DFD5] text-[#12231A] text-xs font-semibold hover:border-[#12231A] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#12231A] text-[#DFCAAB] text-xs uppercase tracking-wider font-bold hover:bg-[#182F23] flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all"
                  >
                    <Save className="w-4 h-4 text-[#96F816]" />
                    <span>Save Slide Changes</span>
                  </button>
                </div>
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
