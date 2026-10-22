import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;

      // Show button after scrolling past 300px
      if (scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      // Calculate percentage for circular progress border
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (scrollY / totalHeight) * 100));
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Circular progress ring metrics
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <div
      className={`fixed bottom-6 right-6 z-40 transition-all duration-500 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto scale-100'
          : 'opacity-0 translate-y-6 pointer-events-none scale-90'
      }`}
    >
      <button
        onClick={scrollToTop}
        aria-label="Back to Top"
        title="Scroll back to top"
        className="group relative w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-[#12231A] text-white flex items-center justify-center shadow-xl shadow-[#12231A]/30 hover:shadow-2xl hover:shadow-[#96F816]/20 transition-all duration-300 hover:scale-108 active:scale-95 cursor-pointer border border-[#A0B7A3]/30"
      >
        {/* SVG Circular Scroll Progress Ring */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
          viewBox="0 0 52 52"
        >
          {/* Background Track */}
          <circle
            cx="26"
            cy="26"
            r={radius}
            fill="none"
            stroke="rgba(160, 183, 163, 0.2)"
            strokeWidth="2.5"
          />
          {/* Animated Lime Progress Indicator */}
          <circle
            cx="26"
            cy="26"
            r={radius}
            fill="none"
            stroke="#96F816"
            strokeWidth="2.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-150 ease-out"
          />
        </svg>

        {/* Upward Arrow Icon with hover elevation */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          <ArrowUp className="w-5 h-5 text-white group-hover:text-[#96F816] transition-all duration-300 group-hover:-translate-y-1" />
        </div>

        {/* Floating Tooltip on Hover */}
        <div className="absolute right-full mr-3 px-2.5 py-1 bg-[#12231A] text-[#FAFBF9] border border-[#A0B7A3]/40 rounded-md text-[10px] tracking-wider uppercase font-bold whitespace-nowrap shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200">
          Top • {Math.round(scrollProgress)}%
        </div>
      </button>
    </div>

  );
};
