/**
 * Shared content for the public marketing site.
 *
 * The reels, reviews and numbers on this site are sample content for the demo.
 * Replace them with real partner posts and verified customer reviews before
 * launching, and keep the JSON-LD rating data in sync with the visible reviews.
 */

export const SITE_NAME = "Zomareel";
export const SITE_TAGLINE = "Food worth reeling about.";
export const SITE_DESCRIPTION =
  "Zomareel is a short-video food feed where independent kitchens show what they are cooking and diners find their next favourite plate.";
export const CONTACT_EMAIL = "hello@zomareel.com";
export const FALLBACK_ORIGIN = "https://zomareel.com";
export const DEFAULT_OG_IMAGE = "/assets/img/og-cover.jpg";
export const PRIVACY_UPDATED = "9 November 2026";
export const CONTENT_UPDATED = "2026-11-09";

export const APP_HOME = "/app";
export const DINER_JOIN_URL = "/app#/login?as=diner&mode=register";
export const DINER_SIGNIN_URL = "/app#/login?as=diner";
export const PARTNER_JOIN_URL = "/app#/login?as=partner&mode=register";
export const PARTNER_SIGNIN_URL = "/app#/login?as=partner";

export const SITE_URL = (process.env.SITE_URL || "").replace(/\/+$/, "");

export const GA_MEASUREMENT_ID = (process.env.GA_MEASUREMENT_ID || "").trim();
export const GOOGLE_SITE_VERIFICATION = (
  process.env.GOOGLE_SITE_VERIFICATION || ""
).trim();

/** Resolve the public origin for canonical URLs, sitemaps and JSON-LD. */
export function siteOrigin(req) {
  if (SITE_URL) {
    return SITE_URL;
  }

  // Canonical metadata must not trust Host or forwarding headers.
  return FALLBACK_ORIGIN;
}

export function absoluteUrl(origin, pathname = "/") {
  return `${origin}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

export const NAV_LINKS = [
  { href: "/diners", label: "For diners" },
  { href: "/restaurants", label: "For kitchens" },
  { href: "/about", label: "About" },
  { href: "/reviews", label: "Reviews" },
  { href: "/faq", label: "FAQ" },
];

export const TRUST_POINTS = [
  {
    icon: "shield",
    title: "Verified kitchen accounts",
    text: "Every reel comes from a registered food partner, not an anonymous repost.",
  },
  {
    icon: "spark",
    title: "No ads in the feed",
    text: "The feed is food. You see plates and the kitchens behind them, nothing else.",
  },
  {
    icon: "tag",
    title: "Prices before you go",
    text: "Partners can show the dish price right on the reel, so there are no surprises.",
  },
  {
    icon: "lock",
    title: "Secure, simple sign-in",
    text: "Hashed passwords and scoped sessions. No social logins hoovering up your data.",
  },
];

export const REELS = [
  {
    slug: "pizza",
    dish: "Charred chilli chicken pizza",
    kitchen: "Forno Alto",
    location: "Riverside",
    price: 16,
    likes: 1240,
    caption: "Blistered crust, hot honey, a fistful of coriander.",
    poster: "/assets/img/reel-pizza.webp",
    mp4: "/assets/img/reel-pizza.mp4",
    webm: "/assets/img/reel-pizza.webm",
    width: 720,
    height: 1280,
    uploadDate: "2026-11-04",
  },
  {
    slug: "ramen",
    dish: "Prawn shoyu ramen",
    kitchen: "Noodle Theory",
    location: "Old Town",
    price: 14,
    likes: 987,
    caption: "Twelve-hour broth, jammy eggs, prawns straight from the wok.",
    poster: "/assets/img/reel-ramen.webp",
    mp4: "/assets/img/reel-ramen.mp4",
    webm: "/assets/img/reel-ramen.webm",
    width: 720,
    height: 1280,
    uploadDate: "2026-11-03",
  },
  {
    slug: "dessert",
    dish: "Salted caramel brownie",
    kitchen: "Crumb & Co.",
    location: "Market Lane",
    price: 8,
    likes: 2110,
    caption: "Warm brownie, cold vanilla, caramel poured at the table.",
    poster: "/assets/img/reel-dessert.webp",
    mp4: "/assets/img/reel-dessert.mp4",
    webm: "/assets/img/reel-dessert.webm",
    width: 720,
    height: 1280,
    uploadDate: "2026-11-02",
  },
  {
    slug: "burger",
    dish: "Buttermilk crunch burger",
    kitchen: "Side Street Burgers",
    location: "Docklands",
    price: 12,
    likes: 1630,
    caption: "Buttermilk-brined chicken, pickles, and fries that stay crisp.",
    poster: "/assets/img/reel-burger.webp",
    mp4: "/assets/img/reel-burger.mp4",
    webm: "/assets/img/reel-burger.webm",
    width: 720,
    height: 1280,
    uploadDate: "2026-11-01",
  },
];

export const REVIEWS = [
  {
    name: "Maya R.",
    role: "Diner",
    location: "Riverside",
    rating: 5,
    date: "2026-10-26",
    quote:
      "I found three places within walking distance that I'd never noticed. Seeing the actual plate, with the price, is so much better than another listicle.",
  },
  {
    name: "Dev S.",
    role: "Owner, Forno Alto",
    location: "Riverside",
    rating: 5,
    date: "2026-10-19",
    quote:
      "Our first reel took ten minutes to post. By the weekend people were quoting the dish name at the counter. That has never happened with a photo on our website.",
  },
  {
    name: "Priya N.",
    role: "Diner",
    location: "Old Town",
    rating: 5,
    date: "2026-10-11",
    quote:
      "The feed is calm. No ads, no fifteen-second pre-rolls. Just food and the kitchen it came from, which is all I wanted.",
  },
  {
    name: "Tom A.",
    role: "Chef-owner, Noodle Theory",
    location: "Old Town",
    rating: 4,
    date: "2026-10-03",
    quote:
      "I like that the reel is ours — our dish name, our price, our kitchen. I'd love a way to see weekly views in the dashboard, but the posting flow is painless.",
  },
  {
    name: "Elena C.",
    role: "Diner",
    location: "Market Lane",
    rating: 5,
    date: "2026-09-27",
    quote:
      "Saved myself from a mediocre dinner by watching two reels first. The brownie one was responsible for a very good Friday.",
  },
  {
    name: "Sam K.",
    role: "Owner, Side Street Burgers",
    location: "Docklands",
    rating: 5,
    date: "2026-09-20",
    quote:
      "We're a small counter with no marketing budget. A thirty-second clip of the fry basket did more for us than a month of boosted posts.",
  },
];

export const REVIEW_SUMMARY = {
  rating: 4.8,
  count: 128,
  breakdown: [
    { stars: 5, percent: 82 },
    { stars: 4, percent: 13 },
    { stars: 3, percent: 3 },
    { stars: 2, percent: 1 },
    { stars: 1, percent: 1 },
  ],
};

export const FAQ_GROUPS = [
  {
    id: "diners",
    title: "For diners",
    items: [
      {
        q: "What is Zomareel?",
        a: "Zomareel is a food-first feed of short vertical reels. Independent kitchens post the dishes they are proud of, and diners browse real plates, prices and locations instead of scrolling a static menu. You can like the dishes you would order and keep your saves against one free account.",
      },
      {
        q: "Is Zomareel free for diners?",
        a: "Yes. Creating a diner account, browsing the feed and liking reels are free. You only need an email address and a password of at least six characters. We do not sell your data or run third-party ads in the feed.",
      },
      {
        q: "Do I need the app to use Zomareel?",
        a: "No. Zomareel runs in the browser on your phone, tablet or desktop. Open the site, sign in, and the feed fills your screen. Your session stays on the device you signed in with.",
      },
      {
        q: "Can I order delivery through Zomareel?",
        a: "Not today. Zomareel is a discovery feed: you find the dish and the kitchen, then order directly from the restaurant the way you normally would. Keeping ordering out of the feed is deliberate — it keeps the experience about the food.",
      },
      {
        q: "How do I delete my diner account?",
        a: "Email us from the address on your account and we will delete your profile, likes and saved session data within 30 days. Account self-deletion is on the roadmap. See the privacy policy for the full detail.",
      },
    ],
  },
  {
    id: "kitchens",
    title: "For kitchens",
    items: [
      {
        q: "Who can post reels on Zomareel?",
        a: "Registered food partners: restaurants, cafes, bakeries, food trucks and independent food makers. You create a kitchen account with your business name and email, then post from your partner dashboard.",
      },
      {
        q: "What does a reel need?",
        a: "A public link to a photo or vertical video, plus a dish name. Add the price, where it is served, a caption and a preview image for videos. Zomareel does not host media files yet, so your images and videos stay on your own hosting or CDN.",
      },
      {
        q: "How long does it take to publish a dish?",
        a: "About two minutes once your media link is ready. Choose photo or video, paste the URL, add the dish name and price, write a short caption, and publish. The reel appears at the top of the diner feed immediately.",
      },
      {
        q: "What does Zomareel cost for kitchens?",
        a: "Creating a kitchen account and posting reels is free while we are in early access. If we introduce paid placements later, the main feed will stay uncluttered and any sponsored slot will be labelled. We will never sell your dish data.",
      },
      {
        q: "Do I need professional video equipment?",
        a: "No. A recent phone, daylight and a clean plate are enough. Vertical footage shot at arm's length reads best in the feed. Keep the dish name legible and keep the clip short — a single satisfying pour or first bite beats a long tour of the kitchen.",
      },
    ],
  },
  {
    id: "accounts",
    title: "Accounts, privacy & analytics",
    items: [
      {
        q: "How are my account and session protected?",
        a: "Passwords are hashed before they reach the database. Diner sessions use a signed token kept in your browser, and partner sessions use an HttpOnly cookie that page scripts cannot read. All API requests are authenticated server-side.",
      },
      {
        q: "Does Zomareel use cookies or analytics?",
        a: "Essential cookies and local storage keep you signed in. Google Analytics only loads if you accept analytics in the consent banner, and it stays off if you decline. You can change your mind by clearing this site's storage.",
      },
      {
        q: "Can I request a copy of my data?",
        a: "Yes. Email us from your account address and we will send a machine-readable copy of your profile, likes and reel posts. You can also ask us to correct or delete anything we hold.",
      },
    ],
  },
];

export const ALL_FAQS = FAQ_GROUPS.flatMap((group) => group.items);

export const PAGE_PATHS = [
  "/",
  "/diners",
  "/restaurants",
  "/about",
  "/reviews",
  "/faq",
  "/privacy",
];
