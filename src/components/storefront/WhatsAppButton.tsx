import React, { useState, useEffect } from 'react';
import { MessageCircle, Check, Copy, ExternalLink, X } from 'lucide-react';

interface WhatsAppButtonProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phoneNumber = '9477831477',
  defaultMessage = 'Hello HIFFYY Atelier, I would like to inquire about your luxury perfumes and bespoke fragrances.',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // International format for India (+91)
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  const internationalNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;
  const whatsappUrl = `https://wa.me/${internationalNumber}?text=${encodeURIComponent(
    defaultMessage
  )}`;

  const handleCopyNumber = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`+91 ${phoneNumber}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`fixed bottom-6 left-5 sm:left-8 z-50 select-none group transition-all duration-300 ${
        showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
      }`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Expanded Quick Contact Popover if clicked or toggled */}
      {isOpenMenu && (
        <div className="absolute bottom-16 left-0 w-72 bg-white rounded-2xl shadow-2xl border border-[#A0B7A3]/50 p-4 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
          <div className="flex items-center justify-between pb-3 border-b border-[#EBF2EC]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-sm">
                <MessageCircle className="w-4 h-4 fill-current" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#12231A] leading-tight">HIFFYY Concierge</h4>
                <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online • WhatsApp Support
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpenMenu(false)}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="py-3">
            <p className="text-[11px] text-[#12231A]/80 leading-relaxed mb-3">
              Need personal fragrance recommendations, corporate gifting assistance, or order help?
            </p>

            <div className="flex items-center justify-between p-2.5 bg-[#FAFBF9] rounded-xl border border-[#EBF2EC] mb-3">
              <span className="text-xs font-mono font-bold text-[#12231A]">
                +91 {phoneNumber}
              </span>
              <button
                onClick={handleCopyNumber}
                className="text-[10px] font-semibold text-[#12231A] hover:text-emerald-700 flex items-center gap-1 px-2 py-1 rounded bg-white shadow-xs border border-slate-200 cursor-pointer"
                title="Copy phone number"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-500" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpenMenu(false)}
              className="w-full py-2.5 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#25D366]/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Open Chat on WhatsApp</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </a>
          </div>
        </div>
      )}

      {/* Main Floating Button: Lady Image + WhatsApp Icon with Pulse Radar Animation */}
      <div className="relative flex items-center">
        {/* Radar Ring 1 Pulse Wave */}
        <span className="absolute -inset-1.5 rounded-full bg-[#25D366] opacity-50 animate-ping pointer-events-none" />

        {/* Radar Ring 2 Secondary Soft Glow */}
        <span className="absolute -inset-3 rounded-full bg-[#25D366]/25 animate-pulse pointer-events-none" />

        {/* WhatsApp Anchor CTA Button with Lady Image & WhatsApp Badge */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="relative block w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl shadow-[#25D366]/50 hover:shadow-[#25D366]/70 transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-white bg-white cursor-pointer group shrink-0"
          title={`Chat with us on WhatsApp (+91 ${phoneNumber})`}
          aria-label="Chat with WhatsApp Support Lady Consultant"
        >
          {/* Lady Consultant Image */}
          <div className="w-full h-full rounded-full overflow-hidden bg-slate-100">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&h=160&q=80"
              alt="Support Consultant"
              className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-110"
            />
          </div>

          {/* WhatsApp Icon Badge */}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#25D366] text-white flex items-center justify-center border-2 border-white shadow-md">
            <svg
              viewBox="0 0 24 24"
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.507 14.307l-.009.075c-.238-.12-1.406-.694-1.624-.774-.219-.079-.378-.119-.538.12-.159.239-.618.774-.757.934-.139.16-.279.18-.518.06-.239-.12-1.011-.373-1.926-1.189-.712-.635-1.193-1.42-1.332-1.659-.14-.239-.015-.368.105-.488.108-.107.239-.279.359-.419.12-.139.159-.239.239-.399.08-.16.04-.299-.02-.419-.06-.12-.538-1.296-.738-1.775-.195-.466-.393-.403-.538-.411-.139-.008-.299-.01-.459-.01-.159 0-.418.06-.638.3-.219.239-.837.818-.837 1.994s.857 2.313.976 2.473c.12.16 1.687 2.576 4.088 3.612.571.246 1.017.394 1.365.505.574.183 1.096.157 1.509.095.46-.069 1.406-.575 1.605-1.13.199-.555.199-1.031.139-1.13-.059-.1-.219-.16-.458-.28zm-5.467 6.643c-1.848 0-3.567-.497-5.05-1.366l-.362-.215-3.753.984 1.002-3.659-.236-.376c-.958-1.524-1.464-3.292-1.464-5.111 0-5.267 4.285-9.552 9.553-9.552 2.552 0 4.951.994 6.755 2.798 1.803 1.804 2.797 4.204 2.797 6.756 0 5.268-4.285 9.553-9.553 9.553zm8.075-17.628C17.96 1.168 15.118.001 12.04 0 5.399 0 0 5.399 0 12.041c0 2.122.554 4.195 1.607 6.02L0 24.082l6.223-1.632c1.761.96 3.743 1.466 5.817 1.466 6.64 0 12.04-5.399 12.04-12.041 0-3.218-1.253-6.242-3.528-8.517z" />
            </svg>
          </div>
        </a>
      </div>
    </div>
  );
};
