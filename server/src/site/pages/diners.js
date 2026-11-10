import {
  DINER_JOIN_URL,
  FAQ_GROUPS,
  PARTNER_JOIN_URL,
  REELS,
  REVIEWS,
  absoluteUrl,
  siteOrigin,
} from "../data.js";
import { renderPage } from "../layout.js";
import {
  ctaBand,
  faqList,
  heroReel,
  icon,
  reelCard,
  reviewCard,
  sectionHead,
  trustBar,
} from "../ui.js";

const dinerFaqs = FAQ_GROUPS.find((group) => group.id === "diners").items;

export function renderDiners(req, res) {
  const origin = siteOrigin(req);

  const body = `
    <section class="page-hero diner-hero">
      <div class="hero-glow" aria-hidden="true"></div>
      <div class="wrap page-hero-grid">
        <div class="hero-copy">
          <p class="eyebrow"><span class="dot"></span>For diners</p>
          <h1>Find your next meal.</h1>
          <p class="lede">
            Browse dishes from independent kitchens. See the price and location,
            save what you like, and decide where to eat.
          </p>
          <div class="hero-actions">
            <a class="btn btn-primary btn-lg" href="${DINER_JOIN_URL}" data-track="cta" data-cta="Create a free diner account">
              Find your next plate <span class="diner-cta-arrow">${icon("arrow", 18)}</span>
            </a>
            <a class="btn btn-ghost btn-lg" href="#how-it-works">${icon("play", 16)} How it works</a>
          </div>
          <ul class="hero-chips">
            <li>${icon("check", 15)} Free diner account</li>
            <li>${icon("shield", 15)} No ads in the feed</li>
            <li>${icon("clock", 15)} One-minute signup</li>
          </ul>
        </div>

        <div class="page-hero-reels" aria-label="Sample reels from the Zomareel feed">
          ${REELS.slice(0, 2).map(heroReel).join("")}
        </div>
      </div>
      <div class="wrap">${trustBar()}</div>
    </section>

    <section class="section">
      <div class="wrap">
        ${sectionHead({
          eyebrow: "What you get",
          title: "See the dish before you choose.",
          lede: "Browse kitchen posts with the details you need to plan a meal.",
        })}

        <div class="feature-grid">
          <article class="feature-card">
            <span class="feature-icon">${icon("film", 22)}</span>
            <h3>Watch the dish</h3>
            <p>Photos and short videos give you a closer look at what a kitchen serves.</p>
          </article>
          <article class="feature-card">
            <span class="feature-icon">${icon("tag", 22)}</span>
            <h3>Check the details</h3>
            <p>Find the dish price, kitchen name and neighbourhood alongside each post.</p>
          </article>
          <article class="feature-card">
            <span class="feature-icon">${icon("heart", 22)}</span>
            <h3>Like what you'd order</h3>
            <p>Tap the heart to keep dishes you want to try together in your account.</p>
          </article>
          <article class="feature-card">
            <span class="feature-icon">${icon("spark", 22)}</span>
            <h3>Browse without ads</h3>
            <p>Explore kitchen posts without sponsored placements interrupting the feed.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="section section-how" id="how-it-works">
      <div class="wrap">
        ${sectionHead({
          eyebrow: "How it works",
          title: "Three steps between you and dinner.",
          lede: "Find a dish on Zomareel, then visit the kitchen or contact it directly to order.",
        })}

        <ol class="step-row">
          <li class="step-card">
            <span class="step-num">1</span>
            <h3>Make an account</h3>
            <p>Sign up with your name, email and password to browse and like dishes.</p>
          </li>
          <li class="step-card">
            <span class="step-num">2</span>
            <h3>Scroll the feed</h3>
            <p>Explore kitchen posts and save the dishes you want to try.</p>
          </li>
          <li class="step-card">
            <span class="step-num">3</span>
            <h3>Visit or order direct</h3>
            <p>Check the kitchen and location, then arrange your meal directly with them.</p>
          </li>
        </ol>
      </div>
    </section>

    <section class="section section-split">
      <div class="wrap split">
        <div class="split-media">
          <img
            src="/assets/img/diners-1200.webp"
            srcset="/assets/img/diners-800.webp 800w, /assets/img/diners-1200.webp 1200w"
            sizes="(max-width: 900px) 92vw, 48vw"
            width="1200"
            height="750"
            alt="Friends sharing a meal at a restaurant table"
            loading="lazy"
            decoding="async"
          />
          <span class="media-badge">${icon("heart", 14)} Built around the plate</span>
        </div>
        <div class="split-copy">
          <p class="eyebrow"><span class="dot"></span>Why diners stay</p>
          <h2>Keep your next meal in mind.</h2>
          <p class="section-lede">
            Browse posts from independent kitchens and keep the dishes you like
            in one place. When you are ready to eat, the kitchen details are there.
          </p>
          <ul class="check-list">
            <li>${icon("check", 18)} See the current dish, not a stock photo</li>
            <li>${icon("check", 18)} Find independent kitchens you would otherwise walk past</li>
            <li>${icon("check", 18)} Keep a like-list instead of eleven open tabs</li>
            <li>${icon("check", 18)} Decide in a scroll, not a twenty-minute search</li>
          </ul>
          <p class="fine-print">
            Zomareel does not take orders or payments. Your account is for discovery
            and likes only.
          </p>
        </div>
      </div>
    </section>

    <section class="section section-feed">
      <div class="wrap">
        ${sectionHead({
          eyebrow: "A taste of the feed",
          title: "This is what dinner looks like.",
          lede: "A few example dishes from the demo feed.",
          align: "left",
        })}
        <div class="reel-grid reel-grid-three">
          ${REELS.slice(0, 3).map((reel) => reelCard(reel)).join("")}
        </div>
      </div>
    </section>

    <section class="section section-reviews">
      <div class="wrap">
        ${sectionHead({
          eyebrow: "From the table",
          title: "Diners, on the record.",
          lede: "Example diner feedback from the Zomareel demo.",
        })}
        <div class="review-grid review-grid-two">
          ${REVIEWS.filter((review) => review.role === "Diner")
            .slice(0, 2)
            .map((review) => reviewCard(review))
            .join("")}
        </div>
        <div class="section-foot">
          <a class="text-link" href="/reviews">Read all reviews ${icon("arrow", 16)}</a>
        </div>
      </div>
    </section>

    <section class="section section-faq">
      <div class="wrap faq-preview">
        <div class="faq-preview-copy">
          ${sectionHead({
            eyebrow: "Good to know",
            title: "Diner questions, answered.",
            lede: "Free accounts, delivery, deleting your data. The details matter.",
          })}
          <a class="btn btn-ghost" href="/faq">Full FAQ ${icon("arrow", 16)}</a>
        </div>
        <div>${faqList(dinerFaqs.slice(0, 4), { openFirst: true })}</div>
      </div>
    </section>

    <div class="wrap">
      ${ctaBand({
        eyebrow: "Free diner account",
        title: "See what's cooking near you.",
        text: "Make an account, scroll the feed and find the plate you will be thinking about tomorrow.",
        primary: { href: DINER_JOIN_URL, label: "Create a free account" },
        secondary: { href: PARTNER_JOIN_URL, label: "I run a kitchen" },
        note: "No card · No ads in the feed · Delete your account any time",
      })}
    </div>
  `;

  return renderPage({
    req,
    res,
    pathname: "/diners",
    title: "Food reels near you — find your next plate | Zomareel",
    description:
      "Scroll real dishes from local kitchens, see prices before you go, and like the plates you'd order. Create a free Zomareel diner account in under a minute.",
    schemaName: "Zomareel for diners — discover food reels near you",
    schema: {
      "@type": "Service",
      "@id": `${origin}/diners#service`,
      name: "Zomareel diner feed",
      serviceType: "Local food discovery through short food reels",
      description:
        "A free feed of short vertical food reels from independent kitchens, with dish names, prices and locations.",
      provider: { "@id": `${origin}/#organization` },
      audience: { "@type": "Audience", audienceType: "Diners and food lovers" },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Free diner account",
      },
      url: absoluteUrl(origin, "/diners"),
    },
    breadcrumb: [
      { label: "Home", href: "/" },
      { label: "For diners", href: "/diners" },
    ],
    image: "/assets/img/og-cover.jpg",
    body,
  });
}
