import type {
  CollectionStory,
  CustomerProfile,
  FAQItem,
  HomePageContent,
  LookbookEntry,
  NavItem,
  OrderSummary,
  ProductDetail,
  StoreSettings,
} from "@/lib/types";

export const announcement =
  "First drop coming soon.";

export const storefrontNavigation: NavItem[] = [
  { label: "Men", href: "/products?category=Men" },
  { label: "Women", href: "/products?category=Women" },
  { label: "All", href: "/products" },
  { label: "New Arrivals", href: "/products?sort=new" },
  { label: "Collection", href: "/collections" },
  { label: "Accessories", href: "/products?subcategory=Accessories" },
];

export const customerNavigation: NavItem[] = [{ label: "Profile", href: "/account" }];

export const adminNavigation: NavItem[] = [
  { label: "Dashboard", href: "/admin" },
  { label: "Inventory", href: "/admin/products" },
];

export const homePageContent: HomePageContent = {
  heroTitle: "Minimalist premium. Loud identity.",
  heroCopy:
    "A premium fashion storefront built for campaign-led drops, elevated essentials, and a sharp brand world.",
  heroCta: "Shop",
  heroSecondaryCta: "View Collections",
  marquee: [
    "First drop coming soon",
    "Campaign-led collections",
    "UPI, cards, wallets at checkout",
    "India-first premium storefront",
  ],
};

export const defaultStoreSettings: StoreSettings = {
  brandName: "Noir Chapter",
  logoText: "Noir",
  brandTagline: "",
  announcement: "First drop coming soon.",
  heroTitle: homePageContent.heroTitle,
  heroCopy: homePageContent.heroCopy,
  heroCta: homePageContent.heroCta,
  heroSecondaryCta: homePageContent.heroSecondaryCta,
  marquee: homePageContent.marquee,
  newsletterHeading: "First access to drops and collection launches.",
  newsletterPlaceholder: "Email for launch updates",
  aboutHeadline:
    "A premium fashion label shaped by restraint, form, and image.",
  aboutBody:
    "The label story, philosophy, and milestones are configured during brand handover and launch preparation.",
  laboratoryTitle: "Laboratory",
  laboratoryBody:
    "A space for prototype drops, unreleased experiments, and future collection directions.",
  faqTitle: "Frequently asked questions",
  shippingTitle: "Shipping and service",
  contactEmail: "",
  contactPhone: "",
  contactHours: "",
  brandCanvas: "#0f0c0b",
  brandInk: "#f5efe8",
  brandAccent: "#f1ddc7",
  paymentMethods: [
    {
      id: "razorpay-test",
      label: "Razorpay test",
      description: "Card, UPI, and wallet checkout in test mode.",
      enabled: true,
    },
    {
      id: "cod",
      label: "Cash on delivery",
      description: "Accept orders first and collect payment on delivery.",
      enabled: true,
    },
    {
      id: "bank-transfer",
      label: "Bank transfer",
      description: "Accept orders and follow up with payment instructions.",
      enabled: false,
    },
  ],
  freeShippingThreshold: 6500,
  standardShippingFee: 250,
  expressShippingFee: 350,
};

export const products: ProductDetail[] = [];

export const collectionStories: CollectionStory[] = [];

export const lookbookEntries: LookbookEntry[] = [];

export const faqs: FAQItem[] = [];

export const accountProfile: CustomerProfile = {
  name: "",
  email: "",
  phone: "",
  addresses: [],
};

export const orderHistory: OrderSummary[] = [];
