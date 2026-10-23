import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { HeroSection } from './components/storefront/HeroSection';
import { SocialVideoCarousel } from './components/storefront/SocialVideoCarousel';
import { FeaturedProducts } from './components/storefront/FeaturedProducts';
import { OlfactoryPyramidSection } from './components/storefront/OlfactoryPyramidSection';
import { JournalSection } from './components/storefront/JournalSection';
import { StoreFooter } from './components/storefront/StoreFooter';
import { ProductDetailModal } from './components/storefront/ProductDetailModal';
import { CartDrawer } from './components/storefront/CartDrawer';
import { CheckoutModal } from './components/storefront/CheckoutModal';
import { ScentDiscoveryQuiz } from './components/storefront/ScentDiscoveryQuiz';
import { OrderTrackingModal } from './components/storefront/OrderTrackingModal';
import { CustomerAccountModal } from './components/storefront/CustomerAccountModal';
import { AuthModal } from './components/storefront/AuthModal';
import { SillageChatbot } from './components/storefront/SillageChatbot';
import { BackToTop } from './components/storefront/BackToTop';
import { RevealSection } from './components/common/RevealSection';






// Admin Components
import { AdminLayout } from './components/admin/AdminLayout';
import { OverviewDashboard } from './components/admin/OverviewDashboard';
import { OrderManager } from './components/admin/OrderManager';
import { ProductCatalogManager } from './components/admin/ProductCatalogManager';
import { InventoryLedgerManager } from './components/admin/InventoryLedgerManager';
import { StockMovementsManager } from './components/admin/StockMovementsManager';
import { PosTerminal } from './components/admin/PosTerminal';
import { OmnichannelMarketplaces } from './components/admin/OmnichannelMarketplaces';
import { CmsPageBuilder } from './components/admin/CmsPageBuilder';
import { MediaCarouselManager } from './components/admin/MediaCarouselManager';
import { BlogContentManager } from './components/admin/BlogContentManager';
import { SeoControlCenter } from './components/admin/SeoControlCenter';
import { AiImageStudio } from './components/admin/AiImageStudio';
import { RagKnowledgeBaseManager } from './components/admin/RagKnowledgeBaseManager';
import { AnalyticsProfitability } from './components/admin/AnalyticsProfitability';
import { StaffPermissions } from './components/admin/StaffPermissions';
import { HeroSectionManager } from './components/admin/HeroSectionManager';
import { BrandLogoManager } from './components/admin/BrandLogoManager';
import { YoupiGatewayManager } from './components/admin/YoupiGatewayManager';
import { AiMarketingEmployeesManager } from './components/admin/AiMarketingEmployeesManager';

import { ArrowLeft, Sparkles, Store } from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentView, setCurrentView, adminTab, isAuthModalOpen, closeAuthModal } = useStore();

  // Modals state for Storefront
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountModalTab, setAccountModalTab] = useState<'addresses' | 'orders' | 'wishlist'>('addresses');

  // Standalone POS View
  if (currentView === 'pos') {
    return (
      <div className="min-h-screen bg-[#F4EFE6] flex flex-col">
        <header className="bg-[#12231A] text-[#FAF8F5] px-6 py-3 flex items-center justify-between border-b border-[#182F23]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentView('admin')}
              className="p-1.5 bg-[#182F23] hover:bg-[#203D2E] rounded-sm text-[#DFCAAB] flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Admin OS</span>
            </button>
            <span className="text-base font-serif font-bold text-white tracking-widest">
              HIFFYY POS TERMINAL
            </span>
          </div>

          <button
            onClick={() => setCurrentView('storefront')}
            className="text-xs text-[#DFCAAB] hover:underline cursor-pointer"
          >
            Go to DTC Storefront &rarr;
          </button>
        </header>

        <div className="p-6 max-w-7xl mx-auto w-full flex-1">
          <PosTerminal />
        </div>
        <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
      </div>
    );
  }

  // Admin OS View
  if (currentView === 'admin') {
    return (
      <>
        <AdminLayout>
          {adminTab === 'overview' && <OverviewDashboard />}
          {adminTab === 'orders' && <OrderManager />}
          {adminTab === 'youpi-gateway' && <YoupiGatewayManager />}
          {adminTab === 'ai-marketing' && <AiMarketingEmployeesManager />}
          {adminTab === 'products' && <ProductCatalogManager />}
          {adminTab === 'hero-manager' && <HeroSectionManager />}
          {adminTab === 'brand-logos' && <BrandLogoManager />}

          {adminTab === 'inventory' && <InventoryLedgerManager />}
          {adminTab === 'movements' && <StockMovementsManager />}
          {adminTab === 'pos' && <PosTerminal />}
          {adminTab === 'channels' && <OmnichannelMarketplaces />}
          {adminTab === 'cms' && <CmsPageBuilder />}
          {adminTab === 'media' && <MediaCarouselManager />}
          {adminTab === 'blog' && <BlogContentManager />}
          {adminTab === 'seo' && <SeoControlCenter />}
          {adminTab === 'ai-studio' && <AiImageStudio />}
          {adminTab === 'rag' && <RagKnowledgeBaseManager />}
          {adminTab === 'analytics' && <AnalyticsProfitability />}
          {adminTab === 'staff' && <StaffPermissions />}
        </AdminLayout>
        <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
      </>
    );
  }

  // Public Storefront View
  return (
    <div className="min-h-screen flex flex-col bg-[#EBF2EC]">
      <main className="flex-1">
        {/* Hero Section with All-Only-Icon Navigation Header */}
        <HeroSection
          onOpenQuiz={() => setIsQuizOpen(true)}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenAccountModal={(tab) => {
            if (tab) setAccountModalTab(tab);
            setIsAccountModalOpen(true);
          }}
          onOpenWishlist={() => {
            setAccountModalTab('wishlist');
            setIsAccountModalOpen(true);
          }}
          onTrackOrder={() => setIsTrackOrderOpen(true)}
        />

        {/* Video & Social Reels Carousel */}
        <RevealSection direction="up" delay={50} duration={800}>
          <SocialVideoCarousel />
        </RevealSection>

        {/* Featured Fragrance Collections */}
        <RevealSection direction="up" delay={50} duration={800}>
          <FeaturedProducts onOpenCart={() => setIsCartOpen(true)} />
        </RevealSection>

        {/* Olfactory Notes Pyramid Architecture */}
        <RevealSection direction="up" delay={50} duration={850}>
          <OlfactoryPyramidSection />
        </RevealSection>

        {/* Discovery Set Banner */}
        <RevealSection direction="up" delay={50} duration={800}>
          <section className="bg-[#12231A] text-white py-16 border-y border-[#A0B7A3]/30 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-xl">
                <span className="text-[10px] tracking-[0.25em] uppercase font-black text-[#96F816] block mb-2">
                  Limited Artisanal Allocation
                </span>
                <h2 className="text-3xl font-serif font-light text-white mb-3">
                  The Imperial Discovery Wardrobe
                </h2>
                <p className="text-xs sm:text-sm text-white/80 font-light leading-relaxed">
                  Experience all six master compositions in 5ml crystal vials presented in an ebony velvet coffer.
                  Includes a ₹1,999 privilege credit voucher toward your first full flacon.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-5">
                <span className="text-3xl font-serif font-extrabold text-[#96F816]">₹1,999</span>
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="px-8 py-3.5 bg-[#96F816] text-[#12231A] text-xs uppercase tracking-[0.2em] font-black hover:bg-[#85e110] transition-all cursor-pointer shadow-lg shadow-[#96F816]/30 hover:scale-105 active:scale-95"
                >
                  Acquire Discovery Set
                </button>
              </div>
            </div>
          </section>
        </RevealSection>

        {/* Editorial Journal & Fragrance Heritage */}
        <RevealSection direction="up" delay={50} duration={800}>
          <JournalSection />
        </RevealSection>
      </main>

      <RevealSection direction="up" delay={50} duration={700}>
        <StoreFooter />
      </RevealSection>


      <SillageChatbot />
      <BackToTop />


      {/* Modals */}
      <ProductDetailModal
        onOpenCheckout={() => setIsCheckoutOpen(true)}
      />
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
      <ScentDiscoveryQuiz
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
      />
      <OrderTrackingModal
        isOpen={isTrackOrderOpen}
        onClose={() => setIsTrackOrderOpen(false)}
      />
      <CustomerAccountModal
        isOpen={isAccountModalOpen}
        initialTab={accountModalTab}
        onClose={() => setIsAccountModalOpen(false)}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
      />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainContent />
    </StoreProvider>
  );
}
