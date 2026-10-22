import React from 'react';
import { useStore } from '../../context/StoreContext';

interface BrandLogoProps {
  variant?: 'header' | 'hero' | 'footer' | 'mark' | 'floating';
  className?: string;
  onClick?: () => void;
}


/**
 * HIFFYY Final Brand Logo Wordmark
 * Faithful vector rendering of the official neon lime wordmark:
 * Distinctive bold serif letterforms, sparkling star dot over 'i', and electric neon lime (#96F816).
 */
export const HiffyyWordmarkSvg: React.FC<{
  className?: string;
  color?: string;
  showSparkle?: boolean;
}> = ({ className = 'h-7 w-auto', color = '#96F816', showSparkle = true }) => {
  return (
    <svg
      viewBox="0 0 380 92"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <filter id="neon-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="1" floodColor={color} floodOpacity="0.45" />
        </filter>
      </defs>

      <g fill={color} filter="url(#neon-glow-filter)">
        {/* H */}
        <g id="letter-H">
          {/* Left Vertical Pillar */}
          <path d="M 12 18 L 30 18 L 30 76 L 12 76 Z" />
          {/* Top Left Bracket Serif */}
          <path d="M 6 18 L 36 18 L 36 23 L 6 23 Z" />
          {/* Bottom Left Bracket Serif */}
          <path d="M 6 71 L 36 71 L 36 76 L 6 76 Z" />

          {/* Crossbar */}
          <path d="M 30 42 L 66 42 L 66 51 L 30 51 Z" />

          {/* Right Vertical Pillar */}
          <path d="M 66 18 L 84 18 L 84 76 L 66 76 Z" />
          {/* Top Right Bracket Serif */}
          <path d="M 60 18 L 90 18 L 90 23 L 60 23 Z" />
          {/* Bottom Right Bracket Serif */}
          <path d="M 60 71 L 90 71 L 90 76 L 60 76 Z" />
        </g>

        {/* I with Star Sparkle Accent */}
        <g id="letter-I">
          {/* Stem */}
          <path d="M 120 32 L 137 32 L 137 76 L 120 76 Z" />
          {/* Top serif */}
          <path d="M 115 32 L 142 32 L 142 37 L 115 37 Z" />
          {/* Bottom serif */}
          <path d="M 114 71 L 143 71 L 143 76 L 114 76 Z" />

          {/* Sparkle 4-point Diamond Star Dot */}
          {showSparkle && (
            <g id="sparkle-dot">
              <path
                d="M 128.5 7 C 128.5 15 132 17.5 139 18.5 C 132 19.5 128.5 22 128.5 30 C 128.5 22 125 19.5 118 18.5 C 125 17.5 128.5 15 128.5 7 Z"
                fill={color}
              />
              <circle cx="128.5" cy="18.5" r="1.5" fill="#FFFFFF" />
            </g>
          )}
        </g>

        {/* F 1 */}
        <g id="letter-F1">
          {/* Main Stem */}
          <path d="M 172 18 L 189 18 L 189 76 L 172 76 Z" />
          {/* Bottom Stem Serif */}
          <path d="M 166 71 L 195 71 L 195 76 L 166 76 Z" />
          {/* Top Arch and Upper Bar */}
          <path d="M 166 18 L 216 18 L 216 25 L 189 25 L 189 42 L 210 42 L 210 49 L 189 49 L 189 76 L 172 76 Z" />
          {/* Top Right Downward Finial */}
          <path d="M 210 18 L 218 18 L 218 31 L 212 31 Z" />
          {/* Center Bar Serif */}
          <path d="M 205 42 L 211 42 L 211 54 L 205 52 Z" />
        </g>

        {/* F 2 */}
        <g id="letter-F2">
          {/* Main Stem */}
          <path d="M 230 18 L 247 18 L 247 76 L 230 76 Z" />
          {/* Bottom Stem Serif */}
          <path d="M 224 71 L 253 71 L 253 76 L 224 76 Z" />
          {/* Top Arch and Upper Bar */}
          <path d="M 224 18 L 274 18 L 274 25 L 247 25 L 247 42 L 268 42 L 268 49 L 247 49 L 247 76 L 230 76 Z" />
          {/* Top Right Downward Finial */}
          <path d="M 268 18 L 276 18 L 276 31 L 270 31 Z" />
          {/* Center Bar Serif */}
          <path d="M 263 42 L 269 42 L 269 54 L 263 52 Z" />
        </g>

        {/* Y 1 */}
        <g id="letter-Y1">
          {/* Left Upper Arm */}
          <path d="M 283 32 L 298 32 L 311 59 L 302 61 Z" />
          <path d="M 279 32 L 300 32 L 300 36 L 279 36 Z" />
          {/* Right Upper Arm */}
          <path d="M 324 32 L 339 32 L 308 72 L 304 81 C 300 89 293 93 283 93 L 278 93 L 278 85 L 284 85 C 289 85 292 83 295 78 L 299 71 L 294 62 Z" />
          <path d="M 322 32 L 341 32 L 341 36 L 322 36 Z" />
        </g>

        {/* Y 2 */}
        <g id="letter-Y2">
          {/* Left Upper Arm */}
          <path d="M 345 32 L 360 32 L 373 59 L 364 61 Z" />
          <path d="M 341 32 L 362 32 L 362 36 L 341 36 Z" />
          {/* Right Upper Arm */}
          <path d="M 386 32 L 401 32 L 370 72 L 366 81 C 362 89 355 93 345 93 L 340 93 L 340 85 L 346 85 C 351 85 354 83 357 78 L 361 71 L 356 62 Z" />
          <path d="M 384 32 L 403 32 L 403 36 L 384 36 Z" />
        </g>
      </g>
    </svg>
  );
};

export const BrandLogo: React.FC<BrandLogoProps> = ({

  variant = 'header',
  className = '',
  onClick,
}) => {
  const { brandLogos } = useStore();

  // 1. Floating Mark Variant
  if (variant === 'mark' || variant === 'floating') {
    if (brandLogos?.enableCustomFloatingLogo && brandLogos.floatingLogo) {
      return (
        <button
          onClick={onClick}
          type="button"
          className={`relative inline-flex items-center justify-center p-1 hover:scale-105 transition-all cursor-pointer ${className}`}
          title={brandLogos.logoAltText || 'HIFFYY Official Logo'}
          aria-label="HIFFYY Home"
        >
          <div
            className="rounded-full bg-[#12231A] border border-[#96F816]/60 flex items-center justify-center shadow-md overflow-hidden"
            style={{
              width: `${brandLogos.floatingLogoSize || 34}px`,
              height: `${brandLogos.floatingLogoSize || 34}px`,
            }}
          >
            <img
              src={brandLogos.floatingLogo}
              alt={brandLogos.logoAltText || 'HIFFYY'}
              className="w-full h-full object-contain p-0.5"
            />
          </div>
        </button>
      );
    }

    return (
      <button
        onClick={onClick}
        type="button"
        className={`relative inline-flex items-center justify-center p-1 hover:scale-105 transition-all cursor-pointer ${className}`}
        title="HIFFYY Official Final Logo"
        aria-label="HIFFYY Home"
      >
        <div className="w-8 h-8 rounded-full bg-[#12231A] border border-[#96F816]/60 flex items-center justify-center shadow-md">
          {/* Sparkle H Icon */}
          <div className="relative flex items-center justify-center">
            <span className="font-serif font-black text-xs text-[#96F816] tracking-widest pl-0.5">
              H
            </span>
            <span className="absolute -top-1 -right-1 text-[8px] text-[#96F816] leading-none">
              ✦
            </span>
          </div>
        </div>
      </button>
    );
  }

  // 2. Hero Header Variant
  if (variant === 'hero') {
    if (brandLogos?.enableCustomHeaderLogo && brandLogos.headerLogo) {
      return (
        <a
          href="#"
          onClick={(e) => {
            if (onClick) {
              e.preventDefault();
              onClick();
            }
          }}
          className={`group inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#12231A]/90 hover:bg-[#12231A] backdrop-blur-md transition-all duration-300 shadow-lg shadow-[#12231A]/20 border border-[#96F816]/40 hover:border-[#96F816] ${className}`}
          title={brandLogos.logoAltText || 'HIFFYY Haute Parfumerie'}
        >
          <div className="flex items-center">
            <img
              src={brandLogos.headerLogo}
              alt={brandLogos.logoAltText || 'HIFFYY'}
              className="w-auto object-contain"
              style={{ height: `${Math.min(brandLogos.headerLogoHeight || 32, 38)}px` }}
            />
          </div>
        </a>
      );
    }

    return (
      <a
        href="#"
        onClick={(e) => {
          if (onClick) {
            e.preventDefault();
            onClick();
          }
        }}
        className={`group inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#12231A]/90 hover:bg-[#12231A] backdrop-blur-md transition-all duration-300 shadow-lg shadow-[#12231A]/20 border border-[#96F816]/40 hover:border-[#96F816] ${className}`}
        title="HIFFYY Haute Parfumerie"
      >
        <div className="flex items-center">
          <HiffyyWordmarkSvg className="h-4 sm:h-4.5 w-auto" color="#96F816" />
        </div>
      </a>
    );
  }

  // 3. Footer Variant
  if (variant === 'footer') {
    if (brandLogos?.enableCustomFooterLogo && brandLogos.footerLogo) {
      return (
        <div
          onClick={onClick}
          className={`inline-flex flex-col items-start gap-1 cursor-pointer group ${className}`}
        >
          <img
            src={brandLogos.footerLogo}
            alt={brandLogos.logoAltText || 'HIFFYY'}
            className="w-auto object-contain group-hover:scale-105 transition-transform"
            style={{ height: `${brandLogos.footerLogoHeight || 40}px` }}
          />
          <span className="text-[9px] uppercase tracking-[0.35em] text-white/70 font-semibold pl-0.5">
            Haute Parfumerie Royale
          </span>
        </div>
      );
    }

    return (
      <div
        onClick={onClick}
        className={`inline-flex flex-col items-start gap-1 cursor-pointer group ${className}`}
      >
        <HiffyyWordmarkSvg className="h-7 sm:h-8 w-auto group-hover:scale-105 transition-transform" color="#96F816" />
        <span className="text-[9px] uppercase tracking-[0.35em] text-white/70 font-semibold pl-0.5">
          Haute Parfumerie Royale
        </span>
      </div>
    );
  }

  // 4. Default Header Variant
  if (brandLogos?.enableCustomHeaderLogo && brandLogos.headerLogo) {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center gap-2 cursor-pointer group text-left ${className}`}
      >
        <div className="flex items-center bg-[#12231A] px-3 py-1.5 rounded-full border border-[#96F816]/40 group-hover:border-[#96F816] transition-all shadow-sm">
          <img
            src={brandLogos.headerLogo}
            alt={brandLogos.logoAltText || 'HIFFYY'}
            className="w-auto object-contain"
            style={{ height: `${brandLogos.headerLogoHeight || 32}px` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2 cursor-pointer group text-left ${className}`}
    >
      <div className="flex items-center bg-[#12231A] px-3 py-1.5 rounded-full border border-[#96F816]/40 group-hover:border-[#96F816] transition-all shadow-sm">
        <HiffyyWordmarkSvg className="h-4 sm:h-4.5 w-auto" color="#96F816" />
      </div>
    </div>
  );
};

