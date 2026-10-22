export type FragranceFamily =
  | 'Oriental Woody'
  | 'Fresh Citrus'
  | 'Amber Gourmand'
  | 'Floral Attar'
  | 'Smoky Leather'
  | 'Aquatic Aromatic';

export interface ProductVariant {
  size: '30ml' | '50ml' | '100ml';
  sku: string;
  barcode: string;
  sellingPrice: number; // in INR
  compareAtPrice: number;
  costPrice: number;
  stock: number;
}

export interface FragranceNotes {
  top: string[];
  heart: string[];
  base: string[];
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  sku: string;
  fragranceFamily: FragranceFamily;
  concentration: 'Extrait de Parfum' | 'Eau de Parfum' | 'Pure Perfume Oil';
  notes: FragranceNotes;
  description: string;
  olfactoryStory: string;
  longevity: string; // e.g. "12-14 hours on skin"
  sillage: 'Intimate' | 'Moderate' | 'Enormous' | 'Imperial';
  status: 'active' | 'draft' | 'archived';
  sellingPrice: number;
  compareAtPrice: number;
  costPrice: number;
  stockOnHand: number;
  stockReserved: number;
  availableStock: number;
  reorderThreshold: number;
  images: string[];
  variants: ProductVariant[];
  isBestseller: boolean;
  isNewArrival: boolean;
  rating: number;
  reviewCount: number;
  bottleColor: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderChannel = 'website' | 'pos' | 'amazon' | 'flipkart' | 'meesho';

export type OrderStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'return_requested'
  | 'returned'
  | 'partially_refunded'
  | 'refunded';

export interface OrderItem {
  productId: string;
  title: string;
  variantSize: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  image: string;
}

export interface CustomerAddress {
  id?: string;
  fullName: string;
  street: string;
  apartment?: string;
  landmark?: string;
  city: string;
  state: string;
  pinCode: string;
  phone: string;
  addressType?: 'home' | 'work' | 'other';
  isDefault?: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  channel: OrderChannel;
  status: OrderStatus;
  customer: {
    uid?: string;
    name: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  discountCode?: string;
  tax: number; // 18% GST
  shippingFee: number;
  total: number;
  paymentMethod: 'UPI' | 'Card' | 'NetBanking' | 'Cash' | 'Marketplace Escrow' | 'COD';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: CustomerAddress;
  trackingNumber?: string;
  carrier?: string;
  sourceStore?: string;
  notes?: string;
  timeline: {
    status: OrderStatus;
    timestamp: string;
    note: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface InventoryMovement {
  id: string;
  sku: string;
  productTitle: string;
  type: 'sale' | 'restock' | 'adjustment' | 'transfer' | 'damage' | 'return';
  delta: number;
  reason: string;
  warehouseId: string;
  performedBy: string;
  referenceId?: string; // Order ID or Transfer ID
  createdAt: string;
}

export interface Warehouse {
  id: string;
  name: string;
  city: string;
  isPrimary: boolean;
  contactPerson: string;
  totalSkus: number;
}

export interface SalesChannel {
  id: string;
  name: string;
  type: OrderChannel | 'custom';
  status: 'active' | 'pending_setup' | 'error' | 'paused';
  sellerId: string;
  apiKeyConfigured: boolean;
  warehouseMapping: string;
  syncInventory: boolean;
  syncOrders: boolean;
  lastSyncAt?: string;
  lastError?: string;
  totalOrders: number;
  totalGrossSales: number;
  commissionRate: number; // percentage e.g. 18 for Amazon
  adSpend: number;
}

export interface MediaItem {
  id: string;
  type: 'youtube' | 'instagram' | 'image_banner';
  title: string;
  caption: string;
  mediaUrl: string;
  embedId: string;
  thumbnailUrl: string;
  ctaLabel?: string;
  ctaLink?: string;
  displayOrder: number;
  isActive: boolean;
  placement: 'homepage_carousel' | 'brand_story' | 'campaign';
  duration?: string;
}

export interface CmsSection {
  id: string;
  type: 'hero' | 'social_carousel' | 'bestsellers' | 'fragrance_notes' | 'discovery_set' | 'brand_story' | 'testimonials' | 'newsletter';
  title: string;
  subtitle?: string;
  isActive: boolean;
  order: number;
  settings: Record<string, string | boolean | number>;
}

export interface CmsPage {
  id: string;
  slug: string;
  title: string;
  template: string;
  status: 'published' | 'draft' | 'scheduled';
  sections: CmsSection[];
  seoTitle: string;
  metaDescription: string;
  ogImage: string;
  updatedAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: string;
  youtubeUrl?: string;
  status: 'published' | 'draft';
  publishedAt: string;
  readTime: string;
}

export interface KnowledgeDoc {
  id: string;
  title: string;
  category: 'faq' | 'policy' | 'fragrance_guide' | 'product_care' | 'shipping';
  content: string;
  isActive: boolean;
  updatedAt: string;
}

export interface PosSession {
  id: string;
  storeName: string;
  cashierName: string;
  openedAt: string;
  closedAt?: string;
  openingCash: number;
  closingCash?: number;
  actualCashCounted?: number;
  cashSales: number;
  upiSales: number;
  cardSales: number;
  totalSales: number;
  status: 'open' | 'closed';
}

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'super_admin' | 'admin' | 'catalog_manager' | 'pos_cashier' | 'support_agent';
  permissions: string[];
  createdAt: string;
}

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  emailVerified?: boolean;
  isAnonymous?: boolean;
}

export interface HeroCarouselProduct {
  id: string;
  title: string;
  subtitle: string;
  headlineFirst: string;
  headlineSecond: string;
  description: string;
  variantSize: '30ml' | '50ml' | '100ml';
  volumeLabel: string;
  priceUSD: number;
  priceINR: number;
  cardImage: string;
  heroModelImage: string;
  statBadge: string;
}

export interface BrandLogosSettings {
  headerLogo: string;
  footerLogo: string;
  floatingLogo: string;
  faviconIcon?: string;
  headerLogoHeight: number;
  footerLogoHeight: number;
  floatingLogoSize: number;
  logoAltText: string;
  enableCustomHeaderLogo: boolean;
  enableCustomFooterLogo: boolean;
  enableCustomFloatingLogo: boolean;
  enableCustomFavicon?: boolean;
}



