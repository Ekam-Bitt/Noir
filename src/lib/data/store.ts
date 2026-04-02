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
  "Complimentary India shipping above Rs. 6,500. New chapter now live.";

export const storefrontNavigation: NavItem[] = [
  { label: "Men", href: "/products?category=Men" },
  { label: "Women", href: "/products?category=Women" },
  { label: "All", href: "/products" },
  { label: "New Arrivals", href: "/products?sort=new" },
  { label: "Collection", href: "/collections/winter-chapter" },
  { label: "Accessories", href: "/products?subcategory=Accessories" },
];

export const customerNavigation: NavItem[] = [{ label: "Profile", href: "/account" }];

export const adminNavigation: NavItem[] = [
  { label: "Dashboard", href: "/admin" },
  { label: "Inventory", href: "/admin/products" },
];

export const homePageContent: HomePageContent = {
  heroTitle: "Quiet power, cut for the city after dark.",
  heroCopy:
    "A premium clothing label blending noir tailoring, elevated street silhouettes, and cinematic drop storytelling for modern wardrobes.",
  heroCta: "Shop The Drop",
  heroSecondaryCta: "Discover Winter Chapter",
  marquee: [
    "New chapter: Winter 2026",
    "Limited run essentials",
    "UPI, cards, wallets at checkout",
    "Editorial storytelling meets commerce",
  ],
};

export const defaultStoreSettings: StoreSettings = {
  brandName: "Noir Chapter",
  logoText: "Noir",
  brandTagline: "Premium chapterwear",
  announcement: "Complimentary India shipping above Rs. 6,500. New chapter now live.",
  heroTitle: homePageContent.heroTitle,
  heroCopy: homePageContent.heroCopy,
  heroCta: homePageContent.heroCta,
  heroSecondaryCta: homePageContent.heroSecondaryCta,
  marquee: homePageContent.marquee,
  newsletterHeading: "First access to drops, chapter releases, and archive reissues.",
  newsletterPlaceholder: "Email for drops, early access, and archives",
  aboutHeadline:
    "A premium fashion language built on restraint, texture, and story.",
  aboutBody:
    "We design elevated essentials and limited capsules that feel cinematic without losing wearability, with each collection treated like a chapter in a larger brand world.",
  laboratoryTitle: "Laboratory",
  laboratoryBody:
    "A space for prototype drops, experimental capsules, material studies, and future brand directions.",
  faqTitle: "Answers for sizing, shipping, care, and checkout.",
  shippingTitle: "Premium service, clear expectations.",
  contactEmail: "support@noirchapter.example",
  contactPhone: "+91 98765 43210",
  contactHours: "Monday to Saturday, 10 AM to 7 PM IST",
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

export const collectionStories: CollectionStory[] = [
  {
    slug: "winter-chapter",
    title: "Winter 2026: The Shadow Realm",
    eyebrow: "CHAPTER ONE",
    intro: "A collection born in the cold and the dark.",
    narrative: "The Winter Chapter explores the intersection of thermal protection and cinematic noir. Each piece is built to withstand the elements without sacrificing the silhouette.",
    mood: "Cinematic, Dark, Precise",
    palette: ["#0f0c0b", "#1a1614", "#f1ddc7"],
    featuredProductSlugs: [],
    isVisible: true,
    isFeatured: true,
  }
];

export const lookbookEntries: LookbookEntry[] = [
  {
    slug: "shadow-look-01",
    title: "Night Navigator",
    season: "Winter 26",
    caption: "Layering the Phantom Parka with the Vesper Vest for ultimate urban utility.",
    palette: ["#0a0a0a", "#1a1a1a", "#2a2a2a"],
  }
];

export const faqs: FAQItem[] = [
  {
    question: "Do you ship worldwide?",
    answer: "Currently we only ship within India. Worldwide shipping is planned for Late 2026.",
  },
  {
    question: "How do I care for my Noir pieces?",
    answer: "Most of our outerwear requires dry cleaning. Please refer to the specific care instructions on each product page.",
  }
];

export const accountProfile: CustomerProfile = {
  name: "",
  email: "",
  phone: "",
  addresses: [],
};

export const orderHistory: OrderSummary[] = [];
