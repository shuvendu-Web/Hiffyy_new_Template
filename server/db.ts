import mongoose from 'mongoose';

// Connect to MongoDB
export async function connectMongo(uri?: string) {
  const mongoUri = uri || process.env.MONGODB_URI;
  if (!mongoUri) {
    console.warn('[MongoDB] No MONGODB_URI provided in environment. Skipping database connection.');
    return false;
  }

  try {
    if (mongoose.connection.readyState === 1) {
      return true;
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected successfully to: ${mongoose.connection.name || 'database'}`);
    return true;
  } catch (error: unknown) {
    console.error('[MongoDB] Connection error:', (error as Error)?.message || error);
    return false;
  }
}

// 1. Product Schema
const ProductSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, index: true },
    sku: { type: String, required: true },
    fragranceFamily: { type: String, required: true },
    concentration: { type: String, required: true },
    notes: {
      top: [String],
      heart: [String],
      base: [String],
    },
    description: String,
    olfactoryStory: String,
    longevity: String,
    sillage: String,
    status: { type: String, default: 'active' },
    sellingPrice: Number,
    compareAtPrice: Number,
    costPrice: Number,
    stockOnHand: Number,
    stockReserved: Number,
    availableStock: Number,
    reorderThreshold: Number,
    images: [String],
    variants: [
      {
        size: String,
        sku: String,
        barcode: String,
        sellingPrice: Number,
        compareAtPrice: Number,
        costPrice: Number,
        stock: Number,
      },
    ],
    isBestseller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    rating: { type: Number, default: 5 },
    reviewCount: { type: Number, default: 0 },
    bottleColor: String,
  },
  { timestamps: true, strict: false }
);

// 2. Order Schema
const OrderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    orderNumber: { type: String, required: true, unique: true },
    channel: { type: String, default: 'website' },
    status: { type: String, default: 'confirmed' },
    customer: {
      uid: String,
      name: String,
      email: String,
      phone: String,
    },
    items: [
      {
        productId: String,
        title: String,
        variantSize: String,
        sku: String,
        quantity: Number,
        unitPrice: Number,
        subtotal: Number,
        image: String,
      },
    ],
    subtotal: Number,
    discount: Number,
    discountCode: String,
    tax: Number,
    shippingFee: Number,
    total: Number,
    paymentMethod: String,
    paymentStatus: String,
    shippingAddress: {
      id: String,
      fullName: String,
      street: String,
      apartment: String,
      landmark: String,
      city: String,
      state: String,
      pinCode: String,
      phone: String,
      addressType: String,
      isDefault: Boolean,
    },
    trackingNumber: String,
    carrier: String,
    sourceStore: String,
    notes: String,
  },
  { timestamps: true, strict: false }
);

// 3. Inventory Movement Schema
const InventoryMovementSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    sku: { type: String, required: true, index: true },
    delta: { type: Number, required: true },
    type: { type: String, required: true },
    reason: String,
    warehouseId: String,
    performedBy: String,
    referenceId: String,
    timestamp: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true, strict: false }
);

// 4. Sales Channel Schema
const SalesChannelSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    code: String,
    status: { type: String, default: 'active' },
    type: String,
    apiKey: String,
    apiEndpoint: String,
    syncIntervalMinutes: Number,
    lastSyncTime: String,
    totalOrdersToday: { type: Number, default: 0 },
    revenueToday: { type: Number, default: 0 },
    pendingSyncCount: { type: Number, default: 0 },
  },
  { timestamps: true, strict: false }
);

// 5. Media Item Schema
const MediaItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    type: String,
    title: String,
    caption: String,
    mediaUrl: String,
    embedId: String,
    videoUrl: String,
    thumbnailUrl: String,
    ctaLabel: String,
    ctaLink: String,
    displayOrder: Number,
    isActive: Boolean,
    placement: String,
    duration: String,
  },
  { timestamps: true, strict: false }
);

// 6. CMS Page Schema
const CmsPageSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: String,
    slug: { type: String, required: true, unique: true },
    content: String,
    metaTitle: String,
    metaDescription: String,
    status: { type: String, default: 'published' },
  },
  { timestamps: true, strict: false }
);

// 7. Hero Slide Schema
const HeroSlideSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: String,
    subtitle: String,
    headlineFirst: String,
    headlineSecond: String,
    description: String,
    variantSize: String,
    volumeLabel: String,
    priceUSD: Number,
    priceINR: Number,
    cardImage: String,
    heroModelImage: String,
    statBadge: String,
    cardImageObjectFit: String,
    heroModelObjectFit: String,
    heroModelObjectPosition: String,
    customCardGlass: Boolean,
    cardGlassColor: String,
    cardGlassOpacity: Number,
    cardGlassBlur: Number,
    cardBorderColor: String,
    cardBorderOpacity: Number,
    cardGlowColor: String,
    cardGlassTextColor: String,
    canvasBgColor: String,
    titleStyle: Object,
    subtitleStyle: Object,
    headlineFirstStyle: Object,
    headlineSecondStyle: Object,
    descriptionStyle: Object,
    order: { type: Number, default: 0 },
  },
  { timestamps: true, strict: false }
);

// 8. Knowledge Doc Schema (for AI RAG)
const KnowledgeDocSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: String,
    category: String,
    content: String,
  },
  { timestamps: true, strict: false }
);

// 9. Blog Post Schema
const BlogPostSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: String,
    slug: String,
    excerpt: String,
    content: String,
    coverImage: String,
    author: String,
    tags: [String],
    publishedAt: String,
    readTimeMinutes: Number,
  },
  { timestamps: true, strict: false }
);

// 10. Customer Address Schema
const CustomerAddressSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: String, index: true },
    fullName: String,
    street: String,
    apartment: String,
    landmark: String,
    city: String,
    state: String,
    pinCode: String,
    phone: String,
    addressType: String,
    isDefault: Boolean,
  },
  { timestamps: true, strict: false }
);

// 11. POS Session Schema
const PosSessionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    status: { type: String, default: 'open' },
    cashierName: String,
    openedAt: String,
    closedAt: String,
    openingCash: Number,
    closingCash: Number,
    totalSales: Number,
    totalOrders: Number,
  },
  { timestamps: true, strict: false }
);

// 12. YouPI Payment Gateway Config Schema
const YoupiConfigSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'default', unique: true },
    merchantPhone: { type: String, default: '9804523216' },
    merchantVpa: { type: String, default: '9804523216@upi' },
    businessName: { type: String, default: 'HIFFYY LUXURY PERFUMES' },
    gatewayActive: { type: Boolean, default: true },
    portalUrl: { type: String, default: 'http://localhost:7000' },
    apiUrl: { type: String, default: 'http://localhost:6100' },
    adminUrl: { type: String, default: 'http://localhost:6001' },
    webhookSecret: { type: String, default: 'youpi_sec_9804523216_hiffyy' },
    testMode: { type: Boolean, default: false },
    autoVerifySim: { type: Boolean, default: true },
  },
  { timestamps: true, strict: false }
);

// 13. YouPI Transaction Log Schema
const YoupiTransactionSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { type: String, default: 'PENDING' },
    utr: { type: String, default: '' },
    merchantPhone: { type: String, default: '9804523216' },
    merchantVpa: { type: String, default: '9804523216@upi' },
    customerName: String,
    customerPhone: String,
    customerEmail: String,
    verifiedAt: Date,
    source: { type: String, default: 'upi_intent_or_qr' },
    paymentMode: { type: String, default: 'UPI' },
  },
  { timestamps: true, strict: false }
);

// Models
export const ProductModel = mongoose.models.Product || mongoose.model('Product', ProductSchema);
export const OrderModel = mongoose.models.Order || mongoose.model('Order', OrderSchema);
export const InventoryMovementModel = mongoose.models.InventoryMovement || mongoose.model('InventoryMovement', InventoryMovementSchema);
export const SalesChannelModel = mongoose.models.SalesChannel || mongoose.model('SalesChannel', SalesChannelSchema);
export const MediaItemModel = mongoose.models.MediaItem || mongoose.model('MediaItem', MediaItemSchema);
export const CmsPageModel = mongoose.models.CmsPage || mongoose.model('CmsPage', CmsPageSchema);
export const HeroSlideModel = mongoose.models.HeroSlide || mongoose.model('HeroSlide', HeroSlideSchema);
export const KnowledgeDocModel = mongoose.models.KnowledgeDoc || mongoose.model('KnowledgeDoc', KnowledgeDocSchema);
export const BlogPostModel = mongoose.models.BlogPost || mongoose.model('BlogPost', BlogPostSchema);
export const CustomerAddressModel = mongoose.models.CustomerAddress || mongoose.model('CustomerAddress', CustomerAddressSchema);
export const PosSessionModel = mongoose.models.PosSession || mongoose.model('PosSession', PosSessionSchema);
export const YoupiConfigModel = mongoose.models.YoupiConfig || mongoose.model('YoupiConfig', YoupiConfigSchema);
export const YoupiTransactionModel = mongoose.models.YoupiTransaction || mongoose.model('YoupiTransaction', YoupiTransactionSchema);

