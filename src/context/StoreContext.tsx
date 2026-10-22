import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Order,
  InventoryMovement,
  SalesChannel,
  MediaItem,
  CmsPage,
  BlogPost,
  KnowledgeDoc,
  PosSession,
  Warehouse,
  CustomerAddress,
  HeroCarouselProduct,
  AppUser,
  BrandLogosSettings,
} from '../types';

import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_SALES_CHANNELS,
  INITIAL_MEDIA_ITEMS,
  INITIAL_CMS_PAGES,
  INITIAL_BLOG_POSTS,
  INITIAL_KNOWLEDGE_DOCS,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_WAREHOUSES,
  INITIAL_HERO_SLIDES,
} from '../data/initialData';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  testConnection,
  ensureAdminRecord,
} from '../firebase';
import { User } from 'firebase/auth';

export interface CartItem {
  product: Product;
  variantSize: '30ml' | '50ml' | '100ml';
  quantity: number;
  unitPrice: number;
}

interface StoreContextType {
  // Navigation & View
  currentView: 'storefront' | 'admin' | 'pos';
  setCurrentView: (view: 'storefront' | 'admin' | 'pos') => void;
  adminTab: string;
  setAdminTab: (tab: string) => void;

  // Catalog
  products: Product[];
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;
  addProduct: (p: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, variantSize: '30ml' | '50ml' | '100ml', quantity?: number) => void;
  removeFromCart: (productId: string, variantSize: string) => void;
  updateCartQuantity: (productId: string, variantSize: string, qty: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartDiscount: number;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => boolean;
  cartTax: number;
  cartShipping: number;
  cartTotal: number;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;

  // Orders
  orders: Order[];
  createOrder: (orderData: Partial<Order>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: Order['status'], note?: string) => void;

  // Inventory & Ledger
  stockMovements: InventoryMovement[];
  warehouses: Warehouse[];
  recordStockMovement: (
    sku: string,
    delta: number,
    type: InventoryMovement['type'],
    reason: string,
    warehouseId: string,
    performedBy: string,
    referenceId?: string
  ) => void;

  // POS
  posSession: PosSession;
  openPosSession: (openingCash: number, cashierName: string) => void;
  closePosSession: (actualCashCounted: number) => void;
  completePosSale: (items: CartItem[], paymentMethod: 'Cash' | 'UPI' | 'Card', customerInfo?: { name: string; phone: string }) => Promise<Order>;

  // Channels
  salesChannels: SalesChannel[];
  updateSalesChannel: (id: string, updates: Partial<SalesChannel>) => void;
  triggerChannelSync: (id: string) => Promise<boolean>;

  // CMS & Media
  cmsPages: CmsPage[];
  updateCmsPage: (id: string, updates: Partial<CmsPage>) => void;
  mediaItems: MediaItem[];
  addMediaItem: (item: Omit<MediaItem, 'id'>) => void;
  updateMediaItem: (id: string, updates: Partial<MediaItem>) => void;
  deleteMediaItem: (id: string) => void;
  heroSlides: HeroCarouselProduct[];
  addHeroSlide: (slide: HeroCarouselProduct) => void;
  updateHeroSlide: (id: string, updates: Partial<HeroCarouselProduct>) => void;
  deleteHeroSlide: (id: string) => void;
  resetHeroSlides: () => Promise<void>;

  // Knowledge Base & RAG
  knowledgeDocs: KnowledgeDoc[];
  addKnowledgeDoc: (doc: Omit<KnowledgeDoc, 'id' | 'updatedAt'>) => void;
  updateKnowledgeDoc: (id: string, updates: Partial<KnowledgeDoc>) => void;
  deleteKnowledgeDoc: (id: string) => void;

  // Blog
  blogPosts: BlogPost[];
  addBlogPost: (post: Omit<BlogPost, 'id'>) => void;
  updateBlogPost: (id: string, updates: Partial<BlogPost>) => void;

  // Customer Addresses
  addresses: CustomerAddress[];
  defaultAddress: CustomerAddress | undefined;
  addAddress: (addr: Omit<CustomerAddress, 'id'>) => void;
  updateAddress: (id: string, addr: Partial<CustomerAddress>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;

  // Auth & Permissions
  user: User | AppUser | null;
  isSuperAdmin: boolean;
  loginWithGoogle: (preferredAccount?: { email: string; displayName: string }) => Promise<void>;
  loginWithGoogleRedirect: () => Promise<void>;
  loginAsDevUser: (devUser: AppUser) => void;
  logout: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  dbConnected: boolean;
  mongoConnected: boolean;
  syncWithMongoDB: () => Promise<void>;

  // Brand Logos & Assets
  brandLogos: BrandLogosSettings;
  updateBrandLogos: (settings: Partial<BrandLogosSettings>) => void;
  resetBrandLogos: () => void;
}

export const DEFAULT_BRAND_LOGOS: BrandLogosSettings = {
  headerLogo: '',
  footerLogo: '',
  floatingLogo: '',
  faviconIcon: '',
  headerLogoHeight: 32,
  footerLogoHeight: 40,
  floatingLogoSize: 34,
  logoAltText: 'HIFFYY Haute Parfumerie Royale',
  enableCustomHeaderLogo: false,
  enableCustomFooterLogo: false,
  enableCustomFloatingLogo: false,
  enableCustomFavicon: false,
};


const StoreContext = createContext<StoreContextType | null>(null);

// Safe LocalStorage wrapper to prevent QuotaExceededError crashes

const safeSetItem = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    console.warn(`localStorage quota exceeded for "${key}", skipping storage write to prevent browser crash.`, err);
  }
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [currentView, setCurrentView] = useState<'storefront' | 'admin' | 'pos'>('storefront');
  const [adminTab, setAdminTab] = useState<string>('overview');

  // Catalog
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('hiffyy_products');
    if (saved) {
      const parsed: Product[] = JSON.parse(saved);
      const existingIds = new Set(parsed.map((p) => p.id));
      const missing = INITIAL_PRODUCTS.filter((p) => !existingIds.has(p.id));
      return [...parsed, ...missing];
    }
    return INITIAL_PRODUCTS;
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Cart & Wishlist
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('hiffyy_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('hiffyy_wishlist');
    return saved ? JSON.parse(saved) : ['prod-oud-royal'];
  });
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscountPercent, setCouponDiscountPercent] = useState<number>(0);

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('hiffyy_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  // Stock movements
  const [stockMovements, setStockMovements] = useState<InventoryMovement[]>(() => {
    const saved = localStorage.getItem('hiffyy_stock_movements');
    return saved ? JSON.parse(saved) : INITIAL_STOCK_MOVEMENTS;
  });
  const [warehouses] = useState<Warehouse[]>(INITIAL_WAREHOUSES);

  // Channels
  const [salesChannels, setSalesChannels] = useState<SalesChannel[]>(() => {
    const saved = localStorage.getItem('hiffyy_channels');
    return saved ? JSON.parse(saved) : INITIAL_SALES_CHANNELS;
  });

  // CMS & Media
  const [cmsPages, setCmsPages] = useState<CmsPage[]>(() => {
    const saved = localStorage.getItem('hiffyy_cms_pages');
    return saved ? JSON.parse(saved) : INITIAL_CMS_PAGES;
  });
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(() => {
    const saved = localStorage.getItem('hiffyy_media_items');
    return saved ? JSON.parse(saved) : INITIAL_MEDIA_ITEMS;
  });
  const [heroSlides, setHeroSlides] = useState<HeroCarouselProduct[]>(() => {
    try {
      const saved = localStorage.getItem('hiffyy_hero_slides');
      if (saved) {
        const parsed: HeroCarouselProduct[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Automatically sanitize any bloated base64 images that caused site freezes
          let needsSanitize = false;
          const sanitized = parsed.map((slide) => {
            const s = { ...slide };
            if (s.heroModelImage && s.heroModelImage.startsWith('data:') && s.heroModelImage.length > 300000) {
              needsSanitize = true;
              s.heroModelImage = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';
            }
            if (s.cardImage && s.cardImage.startsWith('data:') && s.cardImage.length > 300000) {
              needsSanitize = true;
              s.cardImage = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80';
            }
            return s;
          });
          if (needsSanitize) {
            safeSetItem('hiffyy_hero_slides', JSON.stringify(sanitized));
          }
          return sanitized;
        }
      }
    } catch (err) {
      console.warn('Failed to parse hiffyy_hero_slides:', err);
    }
    return INITIAL_HERO_SLIDES;
  });

  // Brand Logos & Assets State
  const [brandLogos, setBrandLogos] = useState<BrandLogosSettings>(() => {
    try {
      const saved = localStorage.getItem('hiffyy_brand_logos');
      return saved ? { ...DEFAULT_BRAND_LOGOS, ...JSON.parse(saved) } : DEFAULT_BRAND_LOGOS;
    } catch {
      return DEFAULT_BRAND_LOGOS;
    }
  });

  const updateBrandLogos = (settings: Partial<BrandLogosSettings>) => {
    setBrandLogos((prev) => {
      const updated = { ...prev, ...settings };
      safeSetItem('hiffyy_brand_logos', JSON.stringify(updated));
      return updated;
    });
  };

  const resetBrandLogos = () => {
    setBrandLogos(DEFAULT_BRAND_LOGOS);
    try {
      localStorage.removeItem('hiffyy_brand_logos');
    } catch (e) {
      console.warn('Failed to reset brand logos in localStorage', e);
    }
  };

  // Dynamically synchronize browser tab favicon with brandLogos favicon setting
  useEffect(() => {
    try {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      if (brandLogos?.enableCustomFavicon && brandLogos.faviconIcon) {
        link.href = brandLogos.faviconIcon;
      } else if (brandLogos?.faviconIcon) {
        link.href = brandLogos.faviconIcon;
      } else {
        // High-end default SVG favicon: Royal Emerald & Gold Flacon Monogram
        const defaultSvgFavicon = `data:image/svg+xml,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="14" fill="#12231A"/>
            <rect x="2" y="2" width="60" height="60" rx="12" fill="none" stroke="#96F816" stroke-width="2" stroke-opacity="0.6"/>
            <path d="M26 12 L38 12 L38 18 L26 18 Z" fill="#96F816" stroke="#96F816" stroke-width="1"/>
            <rect x="29" y="18" width="6" height="4" fill="#C5A880"/>
            <path d="M20 22 L44 22 L48 50 L16 50 Z" fill="#182F23" stroke="#96F816" stroke-width="2"/>
            <text x="32" y="40" font-family="'Oswald', sans-serif" font-size="16" font-weight="900" fill="#96F816" text-anchor="middle" dominant-baseline="central">H</text>
            <circle cx="48" cy="16" r="3" fill="#96F816"/>
          </svg>
        `)}`;
        link.href = defaultSvgFavicon;
      }
    } catch (e) {
      console.warn('Could not update browser favicon', e);
    }
  }, [brandLogos?.faviconIcon, brandLogos?.enableCustomFavicon]);


  // Knowledge docs

  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDoc[]>(() => {
    const saved = localStorage.getItem('hiffyy_kb');
    return saved ? JSON.parse(saved) : INITIAL_KNOWLEDGE_DOCS;
  });

  // Blog
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => {
    const saved = localStorage.getItem('hiffyy_blogs');
    return saved ? JSON.parse(saved) : INITIAL_BLOG_POSTS;
  });

  // Customer Saved Addresses
  const [addresses, setAddresses] = useState<CustomerAddress[]>(() => {
    const saved = localStorage.getItem('hiffyy_addresses');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'addr-1',
        fullName: 'Shuvendu Dhenki',
        street: 'Flat 14B, Sea Green Heights, Worli Sea Face',
        apartment: 'Floor 14, Tower B',
        landmark: 'Near Worli Dairy',
        city: 'Mumbai',
        state: 'Maharashtra',
        pinCode: '400030',
        phone: '+91 98201 44552',
        addressType: 'home',
        isDefault: true,
      },
      {
        id: 'addr-2',
        fullName: 'Shuvendu Dhenki',
        street: 'Maker Chambers VI, 9th Floor, Nariman Point',
        apartment: 'Executive Suite 902',
        landmark: 'Opposite Inox',
        city: 'Mumbai',
        state: 'Maharashtra',
        pinCode: '400021',
        phone: '+91 98201 44552',
        addressType: 'work',
        isDefault: false,
      },
    ];
  });

  // POS Session
  const [posSession, setPosSession] = useState<PosSession>({
    id: 'pos-sess-01',
    storeName: 'HIFFYY Flagship Store, Bandra West',
    cashierName: 'Aarav V.',
    openedAt: new Date().toISOString(),
    openingCash: 5000,
    cashSales: 12400,
    upiSales: 34500,
    cardSales: 21800,
    totalSales: 68700,
    status: 'open',
  });

  // Auth & Connection
  const [user, setUser] = useState<User | AppUser | null>(() => {
    try {
      const saved = localStorage.getItem('hiffyy_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [dbConnected, setDbConnected] = useState<boolean>(true);
  const [mongoConnected, setMongoConnected] = useState<boolean>(false);

  // Synchronize store data with MongoDB
  const syncWithMongoDB = async () => {
    try {
      const res = await fetch('/api/db/status');
      if (!res.ok) {
        setMongoConnected(false);
        return;
      }
      const status = await res.json();
      if (status.connected) {
        setMongoConnected(true);
        const [pRes, oRes, iRes, cRes, mRes, sRes, kRes, bRes, aRes] = await Promise.all([
          fetch('/api/products').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/orders').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/inventory').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/channels').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/cms').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/media').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/hero-slides').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/knowledge').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/blog').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/addresses').then((r) => (r.ok ? r.json() : null)),
        ]);

        if (Array.isArray(pRes) && pRes.length > 0) setProducts(pRes);
        if (Array.isArray(oRes) && oRes.length > 0) setOrders(oRes);
        if (Array.isArray(iRes) && iRes.length > 0) setStockMovements(iRes);
        if (Array.isArray(cRes) && cRes.length > 0) setSalesChannels(cRes);
        if (Array.isArray(mRes) && mRes.length > 0) setMediaItems(mRes);
        if (Array.isArray(sRes) && sRes.length > 0) {
          setHeroSlides(sRes);
        } else {
          resetHeroSlides();
        }
        if (Array.isArray(kRes) && kRes.length > 0) setKnowledgeDocs(kRes);
        if (Array.isArray(bRes) && bRes.length > 0) setBlogPosts(bRes);
        if (Array.isArray(aRes) && aRes.length > 0) setAddresses(aRes);
      } else {
        setMongoConnected(false);
      }
    } catch {
      setMongoConnected(false);
    }
  };

  // Test connection & Auth on mount
  useEffect(() => {
    testConnection().then((connected) => setDbConnected(connected));
    syncWithMongoDB();

    // Handle OAuth redirect return
    getRedirectResult(auth)
      .then(async (cred) => {
        if (cred?.user) {
          const authUser: AppUser = {
            uid: cred.user.uid,
            email: cred.user.email,
            displayName: cred.user.displayName,
            photoURL: cred.user.photoURL,
          };
          setUser(cred.user);
          safeSetItem('hiffyy_user', JSON.stringify(authUser));
          await ensureAdminRecord(cred.user);
        }
      })
      .catch((err: unknown) => {
        console.warn('Firebase Redirect Auth Error:', err);
        const fbErr = err as { code?: string; message?: string };
        if (fbErr.code === 'auth/unauthorized-domain') {
          setAuthError('auth/unauthorized-domain: This domain is not authorized in Firebase Console. Add localhost to Authorized Domains or use Quick Sign-In.');
        } else {
          setAuthError(fbErr.message || 'Redirect authentication failed');
        }
      });

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const authUser: AppUser = {
          uid: u.uid,
          email: u.email,
          displayName: u.displayName,
          photoURL: u.photoURL,
        };
        safeSetItem('hiffyy_user', JSON.stringify(authUser));
        await ensureAdminRecord(u);
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync to local storage safely
  useEffect(() => {
    safeSetItem('hiffyy_products', JSON.stringify(products));
  }, [products]);
  useEffect(() => {
    safeSetItem('hiffyy_orders', JSON.stringify(orders));
  }, [orders]);
  useEffect(() => {
    safeSetItem('hiffyy_cart', JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    safeSetItem('hiffyy_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);
  useEffect(() => {
    safeSetItem('hiffyy_stock_movements', JSON.stringify(stockMovements));
  }, [stockMovements]);
  useEffect(() => {
    safeSetItem('hiffyy_channels', JSON.stringify(salesChannels));
  }, [salesChannels]);
  useEffect(() => {
    safeSetItem('hiffyy_cms_pages', JSON.stringify(cmsPages));
  }, [cmsPages]);
  useEffect(() => {
    safeSetItem('hiffyy_media_items', JSON.stringify(mediaItems));
  }, [mediaItems]);
  useEffect(() => {
    safeSetItem('hiffyy_hero_slides', JSON.stringify(heroSlides));
  }, [heroSlides]);
  useEffect(() => {
    safeSetItem('hiffyy_kb', JSON.stringify(knowledgeDocs));
  }, [knowledgeDocs]);
  useEffect(() => {
    safeSetItem('hiffyy_blogs', JSON.stringify(blogPosts));
  }, [blogPosts]);
  useEffect(() => {
    safeSetItem('hiffyy_addresses', JSON.stringify(addresses));
  }, [addresses]);

  // Customer Address Actions
  const addAddress = (addr: Omit<CustomerAddress, 'id'>) => {
    const newAddr: CustomerAddress = {
      ...addr,
      id: `addr-${Date.now()}`,
      isDefault: addr.isDefault || addresses.length === 0,
    };
    setAddresses((prev) => {
      const updated = addr.isDefault ? prev.map((a) => ({ ...a, isDefault: false })) : prev;
      return [newAddr, ...updated];
    });
    fetch('/api/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAddr),
    }).catch(() => {});
  };

  const updateAddress = (id: string, updates: Partial<CustomerAddress>) => {
    setAddresses((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          return { ...a, ...updates };
        }
        if (updates.isDefault) {
          return { ...a, isDefault: false };
        }
        return a;
      })
    );
    fetch('/api/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    }).catch(() => {});
  };

  const deleteAddress = (id: string) => {
    setAddresses((prev) => {
      const filtered = prev.filter((a) => a.id !== id);
      if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
        filtered[0].isDefault = true;
      }
      return filtered;
    });
    fetch(`/api/addresses/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  const setDefaultAddress = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    );
  };

  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];

  const isSuperAdmin =
    user?.email === 'shuvendu.dhenki@gmail.com' ||
    user?.email?.endsWith('@hiffyy.com') ||
    true; // Admin simulation fallback for platform demonstration

  // Product actions
  const addProduct = (p: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...p,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);

    // Persist to MongoDB
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct),
    }).catch(() => {});

    // Record opening stock
    recordStockMovement(
      newProduct.sku,
      newProduct.stockOnHand,
      'restock',
      'Initial opening stock receipt',
      'Mumbai Central Hub (HQ)',
      user?.displayName || 'Admin'
    );
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item))
    );

    // Persist to MongoDB
    fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(() => {});
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));

    // Persist to MongoDB
    fetch(`/api/products/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  // Cart operations
  const addToCart = (product: Product, variantSize: '30ml' | '50ml' | '100ml', quantity = 1) => {
    const variant = product.variants.find((v) => v.size === variantSize) || product.variants[0];
    const price = variant ? variant.sellingPrice : product.sellingPrice;

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id && item.variantSize === variantSize);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.variantSize === variantSize
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, variantSize, quantity, unitPrice: price }];
    });
  };

  const removeFromCart = (productId: string, variantSize: string) => {
    setCart((prev) => prev.filter((item) => !(item.product.id === productId && item.variantSize === variantSize)));
  };

  const updateCartQuantity = (productId: string, variantSize: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId, variantSize);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.variantSize === variantSize ? { ...item, quantity: qty } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  // Wishlist
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Coupons
  const applyCoupon = (code: string): boolean => {
    const normalized = code.trim().toUpperCase();
    if (normalized === 'FIRSTHIFFYY' || normalized === 'ROYAL10') {
      setAppliedCoupon(normalized);
      setCouponDiscountPercent(10);
      return true;
    }
    if (normalized === 'SILLAGE15') {
      setAppliedCoupon(normalized);
      setCouponDiscountPercent(15);
      return true;
    }
    return false;
  };

  // Financial calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const cartDiscount = Math.round((cartSubtotal * couponDiscountPercent) / 100);
  const cartTax = Math.round((cartSubtotal - cartDiscount) * 0.18); // 18% GST Indian standard
  const cartShipping = cartSubtotal > 1999 || cart.length === 0 ? 0 : 150; // Complimentary shipping above ₹1999
  const cartTotal = cartSubtotal - cartDiscount + cartTax + cartShipping;

  // Stock movement ledger
  const recordStockMovement = (
    sku: string,
    delta: number,
    type: InventoryMovement['type'],
    reason: string,
    warehouseId: string,
    performedBy: string,
    referenceId?: string
  ) => {
    const movement: InventoryMovement = {
      id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sku,
      productTitle: products.find((p) => p.sku === sku || p.variants.some((v) => v.sku === sku))?.title || sku,
      type,
      delta,
      reason,
      warehouseId,
      performedBy,
      referenceId,
      createdAt: new Date().toISOString(),
    };

    setStockMovements((prev) => [movement, ...prev]);

    // Persist movement to MongoDB
    fetch('/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(movement),
    }).catch(() => {});

    // Update product availableStock & stockOnHand
    setProducts((prev) =>
      prev.map((p) => {
        const matchesProduct = p.sku === sku;
        const matchesVariant = p.variants.some((v) => v.sku === sku);
        if (matchesProduct || matchesVariant) {
          const newOnHand = Math.max(0, p.stockOnHand + delta);
          const newAvailable = Math.max(0, newOnHand - p.stockReserved);
          const updated = {
            ...p,
            stockOnHand: newOnHand,
            availableStock: newAvailable,
            variants: p.variants.map((v) => (v.sku === sku ? { ...v, stock: Math.max(0, v.stock + delta) } : v)),
          };
          fetch(`/api/products/${p.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated),
          }).catch(() => {});
          return updated;
        }
        return p;
      })
    );
  };

  // Unified Order Creation
  const createOrder = async (orderData: Partial<Order>): Promise<Order> => {
    const orderNum = `HIF-IN-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      channel: orderData.channel || 'website',
      status: 'confirmed',
      customer: orderData.customer || {
        name: 'Guest Patron',
        email: 'patron@example.com',
        phone: '+91 98000 00000',
      },
      items: orderData.items || [],
      subtotal: orderData.subtotal || cartSubtotal,
      discount: orderData.discount || cartDiscount,
      discountCode: appliedCoupon || undefined,
      tax: orderData.tax || cartTax,
      shippingFee: orderData.shippingFee || cartShipping,
      total: orderData.total || cartTotal,
      paymentMethod: orderData.paymentMethod || 'UPI',
      paymentStatus: 'paid',
      shippingAddress: orderData.shippingAddress || {
        fullName: 'Patron',
        street: '12 Luxury Boulevard',
        city: 'Mumbai',
        state: 'Maharashtra',
        pinCode: '400001',
        phone: '+91 98000 00000',
      },
      trackingNumber: `DELHIVERY-${Math.floor(100000000 + Math.random() * 900000000)}`,
      carrier: 'Delhivery Surface Express',
      timeline: [
        {
          status: 'confirmed',
          timestamp: new Date().toISOString(),
          note: `Order received and confirmed via ${orderData.channel || 'website'}.`,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Persist Order to MongoDB
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder),
    }).catch(() => {});

    // Record stock deduction in ledger
    newOrder.items.forEach((item) => {
      recordStockMovement(
        item.sku,
        -item.quantity,
        'sale',
        `Sale fulfilled for Order #${newOrder.orderNumber}`,
        'Mumbai Central Hub (HQ)',
        'DTC Checkout Bot',
        newOrder.id
      );
    });

    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['status'], note?: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const updatedTimeline = [
            ...order.timeline,
            {
              status,
              timestamp: new Date().toISOString(),
              note: note || `Order status transitioned to ${status}`,
            },
          ];
          const updatedOrder = {
            ...order,
            status,
            timeline: updatedTimeline,
            updatedAt: new Date().toISOString(),
          };
          fetch(`/api/orders/${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedOrder),
          }).catch(() => {});
          return updatedOrder;
        }
        return order;
      })
    );
  };

  // POS
  const openPosSession = (openingCash: number, cashierName: string) => {
    setPosSession({
      id: `pos-${Date.now()}`,
      storeName: 'HIFFYY Flagship Store, Bandra West',
      cashierName,
      openedAt: new Date().toISOString(),
      openingCash,
      cashSales: 0,
      upiSales: 0,
      cardSales: 0,
      totalSales: 0,
      status: 'open',
    });
  };

  const closePosSession = (actualCashCounted: number) => {
    setPosSession((prev) => ({
      ...prev,
      closedAt: new Date().toISOString(),
      actualCashCounted,
      closingCash: prev.openingCash + prev.cashSales,
      status: 'closed',
    }));
  };

  const completePosSale = async (
    items: CartItem[],
    paymentMethod: 'Cash' | 'UPI' | 'Card',
    customerInfo?: { name: string; phone: string }
  ): Promise<Order> => {
    const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + tax;

    const orderNum = `HIF-POS-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: `pos-ord-${Date.now()}`,
      orderNumber: orderNum,
      channel: 'pos',
      status: 'delivered',
      customer: {
        name: customerInfo?.name || 'Walk-in Patron',
        email: 'pos.receipts@hiffyy.com',
        phone: customerInfo?.phone || '+91 99999 99999',
      },
      items: items.map((i) => ({
        productId: i.product.id,
        title: i.product.title,
        variantSize: i.variantSize,
        sku: i.product.variants.find((v) => v.size === i.variantSize)?.sku || i.product.sku,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        subtotal: i.unitPrice * i.quantity,
        image: i.product.images[0],
      })),
      subtotal,
      discount: 0,
      tax,
      shippingFee: 0,
      total,
      paymentMethod,
      paymentStatus: 'paid',
      sourceStore: posSession.storeName,
      shippingAddress: {
        fullName: customerInfo?.name || 'Walk-in Patron',
        street: 'Counter Pickup',
        city: 'Mumbai',
        state: 'Maharashtra',
        pinCode: '400050',
        phone: customerInfo?.phone || '+91 99999 99999',
      },
      timeline: [
        {
          status: 'delivered',
          timestamp: new Date().toISOString(),
          note: `Completed POS in-store sale by ${posSession.cashierName}`,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Persist POS sale order to MongoDB
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder),
    }).catch(() => {});

    // Update POS session statistics
    setPosSession((prev) => {
      const isCash = paymentMethod === 'Cash';
      const isUpi = paymentMethod === 'UPI';
      const isCard = paymentMethod === 'Card';
      const updatedSession = {
        ...prev,
        cashSales: prev.cashSales + (isCash ? total : 0),
        upiSales: prev.upiSales + (isUpi ? total : 0),
        cardSales: prev.cardSales + (isCard ? total : 0),
        totalSales: prev.totalSales + total,
      };
      fetch('/api/pos/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSession),
      }).catch(() => {});
      return updatedSession;
    });

    // Deduct stock from ledger
    newOrder.items.forEach((item) => {
      recordStockMovement(
        item.sku,
        -item.quantity,
        'sale',
        `POS Counter Sale #${orderNum}`,
        'Bangalore Retail Flagship & South Depo',
        posSession.cashierName,
        newOrder.id
      );
    });

    return newOrder;
  };

  // Channels
  const updateSalesChannel = (id: string, updates: Partial<SalesChannel>) => {
    setSalesChannels((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    fetch(`/api/channels/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(() => {});
  };

  const triggerChannelSync = async (id: string): Promise<boolean> => {
    await new Promise((res) => setTimeout(res, 800));
    setSalesChannels((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              lastSyncAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST (Success)',
              lastError: undefined,
            }
          : c
      )
    );
    return true;
  };

  // CMS
  const updateCmsPage = (id: string, updates: Partial<CmsPage>) => {
    setCmsPages((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    fetch(`/api/cms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(() => {});
  };

  // Media
  const addMediaItem = (item: Omit<MediaItem, 'id'>) => {
    const newItem: MediaItem = { ...item, id: `media-${Date.now()}` };
    setMediaItems((prev) => [newItem, ...prev]);
    fetch('/api/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    }).catch(() => {});
  };

  const updateMediaItem = (id: string, updates: Partial<MediaItem>) => {
    setMediaItems((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const deleteMediaItem = (id: string) => {
    setMediaItems((prev) => prev.filter((m) => m.id !== id));
    fetch(`/api/media/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  const addHeroSlide = (slide: HeroCarouselProduct) => {
    setHeroSlides((prev) => [...prev, slide]);
    fetch('/api/hero-slides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slide),
    }).catch(() => {});
  };

  const updateHeroSlide = (id: string, updates: Partial<HeroCarouselProduct>) => {
    setHeroSlides((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    fetch(`/api/hero-slides/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(() => {});
  };

  const deleteHeroSlide = (id: string) => {
    setHeroSlides((prev) => prev.filter((s) => s.id !== id));
    fetch(`/api/hero-slides/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  const resetHeroSlides = async () => {
    setHeroSlides(INITIAL_HERO_SLIDES);
    safeSetItem('hiffyy_hero_slides', JSON.stringify(INITIAL_HERO_SLIDES));
    try {
      const res = await fetch('/api/hero-slides/reset', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setHeroSlides(data);
          safeSetItem('hiffyy_hero_slides', JSON.stringify(data));
        }
      }
    } catch (err) {
      console.warn('Failed to reset hero slides on server:', err);
    }
  };

  // Knowledge base
  const addKnowledgeDoc = (doc: Omit<KnowledgeDoc, 'id' | 'updatedAt'>) => {
    const newDoc: KnowledgeDoc = {
      ...doc,
      id: `kb-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    setKnowledgeDocs((prev) => [newDoc, ...prev]);
    fetch('/api/knowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDoc),
    }).catch(() => {});
  };

  const updateKnowledgeDoc = (id: string, updates: Partial<KnowledgeDoc>) => {
    setKnowledgeDocs((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d))
    );
    fetch(`/api/knowledge/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(() => {});
  };

  const deleteKnowledgeDoc = (id: string) => {
    setKnowledgeDocs((prev) => prev.filter((d) => d.id !== id));
    fetch(`/api/knowledge/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  // Blog
  const addBlogPost = (post: Omit<BlogPost, 'id'>) => {
    const newPost: BlogPost = { ...post, id: `blog-${Date.now()}` };
    setBlogPosts((prev) => [newPost, ...prev]);
    fetch('/api/blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPost),
    }).catch(() => {});
  };

  const updateBlogPost = (id: string, updates: Partial<BlogPost>) => {
    setBlogPosts((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    fetch(`/api/blog/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(() => {});
  };

  // Auth
  const loginWithGoogle = async (preferredAccount?: { email: string; displayName: string }) => {
    setAuthError(null);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const authUser: AppUser = {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName,
        photoURL: cred.user.photoURL,
      };
      setUser(cred.user);
      safeSetItem('hiffyy_user', JSON.stringify(authUser));
      await ensureAdminRecord(cred.user);
      setIsAuthModalOpen(false);
    } catch (err: unknown) {
      console.warn('Google Sign-In Error (Live popup failed):', err);
      const fbErr = err as { code?: string; message?: string };
      // If a preferred account is specified (or when user clicks their account),
      // seamlessly fulfill the Google sign-in on localhost!
      if (preferredAccount) {
        const authUser: AppUser = {
          uid: `google-${preferredAccount.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
          email: preferredAccount.email,
          displayName: preferredAccount.displayName,
          photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(preferredAccount.displayName)}`,
        };
        setUser(authUser);
        safeSetItem('hiffyy_user', JSON.stringify(authUser));
        setIsAuthModalOpen(false);
        setAuthError(null);
        await ensureAdminRecord(authUser);
        return;
      }
      let msg = fbErr.message || 'Google Sign-In failed.';
      if (fbErr.code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
        msg = 'auth/unauthorized-domain: Localhost is not in Firebase Authorized Domains. Choose your account below to sign in instantly.';
      } else if (fbErr.code === 'auth/popup-blocked') {
        msg = 'auth/popup-blocked: Popup was blocked by your browser. Please allow popups or use Quick Sign-In.';
      } else if (fbErr.code === 'auth/popup-closed-by-user') {
        msg = 'auth/popup-closed-by-user: The sign-in popup was closed before completing.';
      }
      setAuthError(msg);
      setIsAuthModalOpen(true);
    }
  };

  const loginWithGoogleRedirect = async () => {
    setAuthError(null);
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (err: unknown) {
      console.error('Google Redirect Error:', err);
      setAuthError((err as Error)?.message || 'Google Redirect failed');
    }
  };

  const loginAsDevUser = (devUser: AppUser) => {
    setUser(devUser);
    safeSetItem('hiffyy_user', JSON.stringify(devUser));
    setAuthError(null);
    setIsAuthModalOpen(false);
    ensureAdminRecord(devUser).catch(() => {});
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {
      // Handled silently
    }
    localStorage.removeItem('hiffyy_user');
    setUser(null);
    setAuthError(null);
  };

  const openAuthModal = () => {
    setAuthError(null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  return (
    <StoreContext.Provider
      value={{
        currentView,
        setCurrentView,
        adminTab,
        setAdminTab,
        products,
        selectedProduct,
        setSelectedProduct,
        addProduct,
        updateProduct,
        deleteProduct,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartSubtotal,
        cartDiscount,
        appliedCoupon,
        applyCoupon,
        cartTax,
        cartShipping,
        cartTotal,
        wishlist,
        toggleWishlist,
        orders,
        createOrder,
        updateOrderStatus,
        stockMovements,
        warehouses,
        recordStockMovement,
        posSession,
        openPosSession,
        closePosSession,
        completePosSale,
        salesChannels,
        updateSalesChannel,
        triggerChannelSync,
        cmsPages,
        updateCmsPage,
        mediaItems,
        addMediaItem,
        updateMediaItem,
        deleteMediaItem,
        heroSlides,
        addHeroSlide,
        updateHeroSlide,
        deleteHeroSlide,
        resetHeroSlides,
        knowledgeDocs,
        addKnowledgeDoc,
        updateKnowledgeDoc,
        deleteKnowledgeDoc,
        blogPosts,
        addBlogPost,
        updateBlogPost,
        addresses,
        defaultAddress,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        user,
        isSuperAdmin,
        loginWithGoogle,
        loginWithGoogleRedirect,
        loginAsDevUser,
        logout,
        authError,
        clearAuthError,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        dbConnected,
        mongoConnected,
        syncWithMongoDB,
        brandLogos,
        updateBrandLogos,
        resetBrandLogos,
      }}

    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
