export type NavItem = {
  label: string;
  href: string;
};

export type ProductImage = {
  id: string;
  label: string;
  palette: [string, string, string];
  url?: string;
  path?: string;
  alt?: string;
};

export type ProductVariant = {
  id: string;
  size: string;
  color: string;
  stock: number;
  sku: string;
};

export type ProductCard = {
  id: string;
  slug: string;
  name: string;
  category: "Men" | "Women" | "Unisex";
  subcategory: "Tops" | "Bottoms" | "Accessories";
  collection: string;
  status: "draft" | "active" | "hidden";
  launchAt?: string;
  price: number;
  compareAtPrice?: number;
  accent: [string, string, string];
  primaryImage?: ProductImage;
  soldOut: boolean;
  tags: string[];
};

export type ProductDetail = ProductCard & {
  description: string;
  fit: "Oversized" | "Regular" | "Relaxed";
  fabric: string;
  care: string[];
  story: string;
  modelInfo: string;
  shippingNote: string;
  images: ProductImage[];
  variants: ProductVariant[];
  sizes: string[];
  colors: string[];
};

export type CartLine = {
  id: string;
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  accent: [string, string, string];
  maxQuantity: number;
  image?: string;
};

export type Cart = {
  id: string;
  currency: "INR";
  lines: CartLine[];
  promoCode?: string;
  discountTotal: number;
  shippingFee: number;
  taxTotal: number;
  subtotal: number;
  grandTotal: number;
};

export type Address = {
  id?: string;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
};

export type OrderSummary = {
  id: string;
  orderNumber: string;
  createdAt: string;
  expectedAt?: string;
  paymentStatus: "paid" | "pending" | "failed" | "refunded";
  fulfillmentStatus: "processing" | "shipped" | "delivered" | "returned";
  total: number;
  subtotal?: number;
  shippingFee?: number;
  taxTotal?: number;
  discountTotal?: number;
  paymentProvider?: string;
  paymentReference?: string;
  shippingMethod?: string;
  contactName?: string;
  contactPhone?: string;
  shippingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: Array<{
    productName: string;
    productSlug: string;
    productImage?: ProductImage;
    size: string;
    color: string;
    quantity: number;
    unitPrice?: number;
  }>;
};

export type CollectionStory = {
  slug: string;
  title: string;
  chapterNumber: string;
  intro: string;
  narrative: string;
  mood: string;
  featuredProductSlugs: string[];
  image?: string;
  launchAt?: string;
  isVisible?: boolean;
  isFeatured?: boolean;
  isArchived?: boolean;
};

export type LookbookEntry = {
  slug: string;
  title: string;
  season: string;
  caption: string;
  palette: [string, string, string];
};

export type FAQItem = {
  question: string;
  answer: string;
};

export type HomePageContent = {
  heroTitle: string;
  heroCopy: string;
  heroCta: string;
  heroSecondaryCta: string;
  marquee: string[];
};

export type CheckoutSession = {
  id: string;
  paymentProvider: string;
  shippingOptions: Array<{
    id: string;
    label: string;
    price: number;
    eta: string;
  }>;
  paymentOptions?: Array<{
    id: string;
    label: string;
    description: string;
  }>;
  note: string;
};

export type CustomerProfile = {
  name: string;
  email: string;
  phone: string;
  addresses: Address[];
};

export type StoreSettings = {
  brandName: string;
  logoText: string;
  brandTagline: string;
  announcement: string;
  heroTitle: string;
  heroCopy: string;
  heroCta: string;
  heroSecondaryCta: string;
  marquee: string[];
  newsletterHeading: string;
  newsletterPlaceholder: string;
  aboutHeadline: string;
  aboutBody: string;
  laboratoryTitle: string;
  laboratoryBody: string;
  faqTitle: string;
  shippingTitle: string;
  contactEmail: string;
  contactPhone: string;
  contactHours: string;
  brandCanvas: string;
  brandInk: string;
  brandAccent: string;
  paymentMethods: Array<{
    id: "razorpay-test" | "cod" | "bank-transfer";
    label: string;
    description: string;
    enabled: boolean;
  }>;
  freeShippingThreshold: number;
  standardShippingFee: number;
  expressShippingFee: number;
};
