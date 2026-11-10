import {
  ALL_FAQS,
  DINER_JOIN_URL,
  PARTNER_JOIN_URL,
  REELS,
  REVIEWS,
  REVIEW_SUMMARY,
  TRUST_POINTS,
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
  stars,
  trustBar,
} from "../ui.js";

function reelSchema(origin) {
  return {
    "@type": "ItemList",
    "@id": `${origin}/#featured-reels`,
    name: "Featured food reels on Zomareel",
    itemListElement: REELS.map((reel, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "VideoObject",
        name: `${reel.dish} at ${reel.kitchen}`,
        description: reel.caption,
        thumbnailUrl: [absoluteUrl(origin, reel.poster)],
        uploadDate: reel.uploadDate,
        duration: "PT6S",
        contentUrl: absoluteUrl(origin, reel.mp4),
        width: reel.width,
        height: reel.height,
        inLanguage: "en",
        isFamilyFriendly: true,
      },
    })),
  };
}

export function renderHome(req, res) {
  const origin = siteOrigin(req);

  const body = `
    <section class="hero">
      <div class="hero-glow" aria-hidden="true"></div>
      <div class="wrap hero-grid">
        <div class="hero-copy">
          <p class="eyebrow"><span class="dot"></span>Independent kitchens · Real plates</p>
          <h1>Food worth <span class="grad">reeling</span> about.</h1>
          <p class="lede">
            Discover dishes from independent kitchens. Watch their food reels,
            check prices and locations, and save the dishes you want to try.
          </p>
          <div class="hero-actions">
            <a class="btn btn-primary btn-lg" href="/diners" data-track="cta" data-cta="Find your next plate">
              Find your next plate ${icon("arrow", 18)}
            </a>
            <a class="btn btn-ghost btn-lg" href="/restaurants" data-track="cta" data-cta="I run a kitchen">
              I run a kitchen
            </a>
          </div>
          <p class="hero-note">
            ${stars(REVIEW_SUMMARY.rating, `Rated ${REVIEW_SUMMARY.rating} out of 5`)}
            <span><strong>${REVIEW_SUMMARY.rating}/5</strong> from ${REVIEW_SUMMARY.count} diners &amp; kitchens</span>
          </p>
        </div>

        <div class="hero-visual">
          <div class="hero-reel-stack" aria-label="A sample of reels on the Zomareel feed">
            ${REELS.slice(0, 3).map(heroReel).join("")}
          </div>
        </div>
      </div>

      <div class="wrap">
        ${trustBar()}
      </div>
    </section>

    <section class="section section-how">
      <div class="wrap">
        ${sectionHead({
          eyebrow: "How it works",
          title: "Find a meal. Share a dish.",
          lede: "Diners browse and save dishes. Kitchens post what they serve, with prices and locations.",
        })}

        <div class="how-grid">
          <article class="how-card">
            <header class="how-head">
              <span class="how-icon">${icon("user", 22)}</span>
              <div>
                <p class="how-kicker">For hungry people</p>
                <h3>Scroll. Spot it. Go eat it.</h3>
              </div>
            </header>
            <ol class="steps">
              <li><span class="step-num">1</span><div><strong>Open the feed</strong><p>Fresh reels from kitchens near you, newest first. No pre-roll, no pop-ups.</p></div></li>
              <li><span class="step-num">2</span><div><strong>Watch the plate</strong><p>Dish name, price and the kitchen it came from, right on the reel.</p></div></li>
              <li><span class="step-num">3</span><div><strong>Like what you'd order</strong><p>Keep a shortlist in your account and go find the real thing.</p></div></li>
            </ol>
            <a class="text-link" href="/diners">See the diner guide ${icon("arrow", 16)}</a>
          </article>

          <article class="how-card how-card-partner">
            <header class="how-head">
              <span class="how-icon">${icon("store", 22)}</span>
              <div>
                <p class="how-kicker">For kitchens</p>
                <h3>Post a dish. Get on the feed.</h3>
              </div>
            </header>
            <ol class="steps">
              <li><span class="step-num">1</span><div><strong>Create a kitchen account</strong><p>Your name, your email, your kitchen. Takes about a minute.</p></div></li>
              <li><span class="step-num">2</span><div><strong>Paste a photo or reel link</strong><p>Add the dish name, price, location and a caption worth reading.</p></div></li>
              <li><span class="step-num">3</span><div><strong>Get discovered</strong><p>Your reel lands at the top of the diner feed the moment you publish.</p></div></li>
            </ol>
            <a class="text-link" href="/restaurants">See the kitchen guide ${icon("arrow", 16)}</a>
          </article>
        </div>
      </div>
    </section>

    <section class="section section-feed" id="feed">
      <div class="wrap">
        ${sectionHead({
          eyebrow: "Tonight on the feed",
          title: "Take a look at the feed.",
          lede: "Example dishes from the Zomareel demo. Sign in to explore kitchen posts.",
        })}

        <div class="reel-grid">
          ${REELS.map(reelCard).join("")}
        </div>

        <div class="section-foot">
          <a class="btn btn-ghost" href="/app#/login" data-track="cta" data-cta="Open the full feed">
            Open the full feed ${icon("arrow", 16)}
          </a>
          <p class="muted">Reels shown are sample content from the Zomareel demo feed.</p>
        </div>
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
            alt="A table of diners sharing plates at a warmly lit restaurant"
            loading="lazy"
            decoding="async"
          />
          <span class="media-badge">${icon("tag", 14)} Prices on every reel</span>
        </div>
        <div class="split-copy">
          <p class="eyebrow"><span class="dot"></span>For diners</p>
          <h2>See something you want to try?</h2>
          <p class="section-lede">
            Get a closer look at a dish, check where it is served, and save it
            for later. Visit the kitchen or contact it directly when you are ready.
          </p>
          <ul class="check-list">
            <li>${icon("check", 18)} A feed of dishes, not sponsored posts</li>
            <li>${icon("check", 18)} Price and neighbourhood attached to every reel</li>
            <li>${icon("check", 18)} Like the plates you would order and keep them in one place</li>
            <li>${icon("check", 18)} Free account, no card, no delivery markup</li>
          </ul>
          <div class="split-actions">
            <a class="btn btn-primary" href="/diners" data-track="cta" data-cta="Explore the diner guide">Explore the diner guide ${icon("arrow", 16)}</a>
          </div>
        </div>
      </div>
    </section>

    <section class="section section-split section-split-alt">
      <div class="wrap split split-reverse">
        <div class="split-media">
          <img
            src="/assets/img/kitchen-1200.webp"
            srcset="/assets/img/kitchen-800.webp 800w, /assets/img/kitchen-1200.webp 1200w"
            sizes="(max-width: 900px) 92vw, 48vw"
            width="1200"
            height="900"
            alt="Two chefs preparing a salad together in a bright restaurant kitchen"
            loading="lazy"
            decoding="async"
          />
          <span class="media-badge">${icon("clock", 14)} A reel takes about two minutes</span>
        </div>
        <div class="split-copy">
          <p class="eyebrow"><span class="dot"></span>For kitchens</p>
          <h2>Put your kitchen on the feed.</h2>
          <p class="section-lede">
            Add a photo or video link, a dish name, a price and your location.
            Publish from your kitchen dashboard so diners can find your food.
          </p>
          <ul class="check-list">
            <li>${icon("check", 18)} Post a photo or vertical video as often as you like</li>
            <li>${icon("check", 18)} Show the price and where the dish is served</li>
            <li>${icon("check", 18)} Keep your kitchen profile and reel history in one place</li>
            <li>${icon("check", 18)} No commission on the feed, no bidding for attention</li>
          </ul>
          <div class="split-actions">
            <a class="btn btn-primary" href="/restaurants" data-track="cta" data-cta="See the kitchen guide">See the kitchen guide ${icon("arrow", 16)}</a>
          </div>
        </div>
      </div>
    </section>

    <section class="section section-reviews">
      <div class="wrap">
        <div class="reviews-head">
          ${sectionHead({
            eyebrow: "Word of mouth",
            title: "From diners and kitchens.",
            lede: "Example feedback included in the Zomareel demo.",
          })}
          <div class="rating-card">
            <p class="rating-value">${REVIEW_SUMMARY.rating}<span>/5</span></p>
            ${stars(REVIEW_SUMMARY.rating, `Rated ${REVIEW_SUMMARY.rating} out of 5`)}
            <p class="muted">${REVIEW_SUMMARY.count} reviews from diners and food partners</p>
          </div>
        </div>

        <div class="review-grid">
          ${REVIEWS.slice(0, 3).map((review) => reviewCard(review)).join("")}
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
            eyebrow: "Before you ask",
            title: "The short answers.",
            lede: "Pricing, posting, privacy and the one about ordering delivery. The full FAQ has the rest.",
          })}
          <a class="btn btn-ghost" href="/faq">Read the full FAQ ${icon("arrow", 16)}</a>
        </div>
        <div>
          ${faqList(ALL_FAQS.slice(0, 4), { openFirst: true })}
        </div>
      </div>
    </section>

    <div class="wrap">
      ${ctaBand({
        eyebrow: "Dinner is one scroll away",
        title: "Hungry yet?",
        text: "Find the dish first, then find the kitchen. Zomareel is free to browse and takes about a minute to join.",
        primary: { href: DINER_JOIN_URL, label: "Create a free account" },
        secondary: { href: PARTNER_JOIN_URL, label: "List your kitchen" },
      })}
    </div>
  `;

  return renderPage({
    req,
    res,
    pathname: "/",
    title: "Zomareel — Food reels from real kitchens",
    description:
      "Discover what local kitchens are cooking through short food reels. Like the plates you love, see prices before you go, and skip the endless menu scroll.",
    schema: [reelSchema(origin)],
    image: "/assets/img/og-cover.jpg",
    body,
  });
}
