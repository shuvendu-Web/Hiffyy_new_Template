import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ShieldCheck, Mail, ArrowRight, Instagram, Youtube, Check } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export const StoreFooter: React.FC = () => {
  const { setCurrentView, setAdminTab } = useStore();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubscribed(true);
    setTimeout(() => {
      setNewsletterEmail('');
      setSubscribed(false);
    }, 3000);
  };

  return (
    <footer className="bg-[#12231A] text-[#FAF8F5] border-t border-[#182F23]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-14 border-b border-[#182F23]">
          {/* Brand Col */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <BrandLogo variant="footer" />
            </div>
            <p className="text-xs text-[#FAF8F5]/70 font-light leading-relaxed max-w-sm mb-6">
              Distilled in Kannauj and Rajasthan. Macerated for sixty days in charred oak casks.
              Created for imperial presence, heat resilience, and unforgettable sillage.
            </p>

            <div className="flex items-center space-x-3 text-[#96F816]">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 border border-[#182F23] hover:border-[#96F816] rounded-sm transition-colors"
                title="Instagram @hiffyyfragrances"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 border border-[#182F23] hover:border-[#96F816] rounded-sm transition-colors"
                title="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Scent Wardrobe */}
          <div>
            <h4 className="text-xs font-serif font-bold text-[#DFCAAB] uppercase tracking-[0.2em] mb-4">
              The Flacons
            </h4>
            <ul className="space-y-2 text-xs text-[#FAF8F5]/80 font-light">
              <li>
                <a href="#collection" className="hover:text-white transition-colors">
                  Oud Royal Rajasthan
                </a>
              </li>
              <li>
                <a href="#collection" className="hover:text-white transition-colors">
                  Monsoon Vetiver & Petrichor
                </a>
              </li>
              <li>
                <a href="#collection" className="hover:text-white transition-colors">
                  Kashmiri Saffron & Vanilla
                </a>
              </li>
              <li>
                <a href="#collection" className="hover:text-white transition-colors">
                  Deccan Cedar & Citrus
                </a>
              </li>
              <li>
                <a href="#collection" className="hover:text-white transition-colors">
                  Gulab Attar Modern
                </a>
              </li>
            </ul>
          </div>

          {/* Client Concierge */}
          <div>
            <h4 className="text-xs font-serif font-bold text-[#DFCAAB] uppercase tracking-[0.2em] mb-4">
              Client Concierge
            </h4>
            <ul className="space-y-2 text-xs text-[#FAF8F5]/80 font-light">
              <li>
                <span className="hover:text-white cursor-pointer">Authenticity & Batch Verification</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer">7-Day Unopened Return Policy</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer">Express All-India PIN Delivery</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer">Maceration & Care Guide</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer">Corporate & Bespoke Gifting</span>
              </li>
            </ul>
          </div>

          {/* Private Newsletter */}
          <div>
            <h4 className="text-xs font-serif font-bold text-[#DFCAAB] uppercase tracking-[0.2em] mb-4">
              Private Scent Club
            </h4>
            <p className="text-xs text-[#FAF8F5]/70 font-light mb-4">
              Receive private invitations to limited seasonal distillations and private launches.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="patron@domain.com"
                  className="w-full py-2.5 pl-3 pr-8 bg-[#182F23] border border-[#A0B7A3]/40 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#96F816]"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2.5 text-[#96F816] hover:text-white"
                >
                  {subscribed ? <Check className="w-4 h-4 text-[#96F816]" /> : <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
              {subscribed && (
                <span className="text-[10px] text-[#96F816] block font-bold">
                  Welcome to the HIFFYY Private Scent Club.
                </span>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Bar & OS Access */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#FAF8F5]/60 gap-4">
          <p>© 2026 HIFFYY Luxury Fragrances Private Limited. All Rights Reserved. Mumbai & Kannauj, India.</p>

          <div className="flex items-center space-x-6">
            <span className="text-[11px] text-[#A0B7A3]">FSSAI / Cosmetics Lic. MH-MUM-2026-991</span>
            <button
              onClick={() => {
                setCurrentView('admin');
                setAdminTab('overview');
              }}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#96F816] text-[#12231A] hover:bg-[#85e110] text-[11px] uppercase tracking-wider font-extrabold cursor-pointer rounded-sm shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Super Admin OS
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
