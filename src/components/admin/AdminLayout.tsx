import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  History,
  Store,
  Globe2,
  Sliders,
  Film,
  FileText,
  Search,
  Sparkles,
  BookOpen,
  BarChart3,
  Users,
  LogOut,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  Palette,
  QrCode,
  Bot,
} from 'lucide-react';


interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const {
    adminTab,
    setAdminTab,
    setCurrentView,
    orders,
    products,
    user,
    openAuthModal,
    logout,
    dbConnected,
    mongoConnected,
  } = useStore();

  const lowStockCount = products.filter((p) => p.stockOnHand <= p.reorderThreshold).length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'confirmed' || o.status === 'processing').length;

  const navItems = [
    { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders & Fulfillment', icon: ShoppingBag, badge: pendingOrdersCount },
    { id: 'youpi-gateway', label: 'YouPI UPI Gateway (0% Fee)', icon: QrCode, highlight: true },
    { id: 'ai-marketing', label: 'AI Marketing Suite (6 Agents)', icon: Bot, highlight: true },
    { id: 'products', label: 'Perfume Catalog', icon: Package },
    { id: 'hero-manager', label: 'Hero Section & Slides', icon: Sparkles, highlight: true },
    { id: 'brand-logos', label: 'Brand Assets & Favicon', icon: Palette, highlight: true },

    { id: 'inventory', label: 'Multi-Warehouse Inventory', icon: Layers, badge: lowStockCount > 0 ? lowStockCount : undefined },
    { id: 'movements', label: 'Stock Movement Ledger', icon: History },
    { id: 'pos', label: 'Offline Store POS', icon: Store },
    { id: 'channels', label: 'Omnichannel Marketplaces', icon: Globe2 },
    { id: 'cms', label: 'Website CMS Builder', icon: Sliders },
    { id: 'media', label: 'Media & Social Reels', icon: Film },
    { id: 'blog', label: 'Editorial Journal', icon: FileText },
    { id: 'seo', label: 'Technical SEO Center', icon: Search },
    { id: 'ai-studio', label: 'AI Perfume Image Studio', icon: Sparkles },
    { id: 'rag', label: 'RAG AI Concierge Knowledge', icon: BookOpen },
    { id: 'analytics', label: 'Financials & Profitability', icon: BarChart3 },
    { id: 'staff', label: 'Staff Accounts & RBAC', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#F4EFE6] flex text-[#1B201E]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#12231A] text-[#FAF8F5] flex flex-col justify-between shrink-0 border-r border-[#182F23]">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-[#182F23]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xl font-serif font-bold tracking-[0.25em] text-white">
                HIFFYY
              </span>
              <span className="px-2 py-0.5 bg-[#182F23] border border-[#C5A880]/50 text-[#DFCAAB] text-[9px] font-mono tracking-wider uppercase font-semibold">
                COMMERCE OS
              </span>
            </div>
            <p className="text-[10px] text-[#C5A880] tracking-wider uppercase">
              Omnichannel Enterprise Platform
            </p>

            {/* DB Status */}
            <div className="flex flex-col gap-1.5 mt-3 text-[10px] text-[#DFCAAB]/80 font-mono">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${mongoConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span>{mongoConnected ? 'MongoDB Cloud Active' : 'MongoDB: Awaiting URI'}</span>
              </div>
              <div className="flex items-center gap-2 text-[9px] text-[#DFCAAB]/50">
                <span className={`w-1.5 h-1.5 rounded-full ${dbConnected ? 'bg-emerald-400/80' : 'bg-amber-400/80'}`} />
                <span>Firebase Auth & Storage</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 max-h-[calc(100vh-230px)] overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = adminTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setAdminTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-sm transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#182F23] text-[#DFCAAB] font-bold border-l-2 border-[#C5A880]'
                      : 'text-[#FAF8F5]/80 hover:bg-[#182F23]/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${item.highlight ? 'text-[#C5A880]' : ''}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-1.5 py-0.2 bg-[#C5A880] text-[#12231A] text-[9px] font-bold rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Footer & Switch to Store */}
        <div className="p-4 border-t border-[#182F23] space-y-2 bg-[#0E1D15]">
          <div
            onClick={openAuthModal}
            className="flex items-center justify-between text-xs p-1.5 rounded hover:bg-white/5 cursor-pointer transition-colors"
            title="Click to manage account or switch roles"
          >
            <div className="truncate">
              <span className="block font-bold text-white truncate text-[11px]">
                {user?.displayName || 'Super Admin'}
              </span>
              <span className="block text-[10px] text-[#C5A880] truncate font-mono">
                {user?.email || 'shuvendu.dhenki@gmail.com'}
              </span>
            </div>
            <ShieldCheck className="w-4 h-4 text-[#C5A880] shrink-0" />
          </div>

          <button
            onClick={() => setCurrentView('storefront')}
            className="w-full py-2 px-3 bg-[#182F23] hover:bg-[#12231A] text-[#DFCAAB] text-[10px] tracking-wider uppercase font-semibold border border-[#C5A880]/40 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Switch to Customer Storefront</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-[#E6DFD5] px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-mono tracking-wider text-[#717A75]">
              HIFFYY OS &gt;
            </span>
            <h1 className="text-sm font-bold text-[#12231A] uppercase tracking-wider font-mono">
              {navItems.find((n) => n.id === adminTab)?.label || 'Administration'}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-xs text-[#717A75] font-mono">
              Active Store: <strong className="text-[#12231A]">All Channels Consolidated</strong>
            </span>
            <button
              onClick={() => setCurrentView('pos')}
              className="px-3 py-1.5 bg-[#FAF8F5] border border-[#12231A] text-[#12231A] text-xs font-semibold hover:bg-[#12231A] hover:text-[#DFCAAB] transition-colors cursor-pointer"
            >
              Launch POS Terminal
            </button>
          </div>
        </header>

        {/* Tab Content */}
        <div className="p-8 flex-1">{children}</div>
      </main>
    </div>
  );
};
