import {
  DINER_JOIN_URL,
  FAQ_GROUPS,
  PARTNER_JOIN_URL,
  PARTNER_SIGNIN_URL,
  REELS,
  REVIEWS,
  absoluteUrl,
  siteOrigin,
} from "../data.js";
import { renderPage } from "../layout.js";
import {
  ctaBand,
  faqList,
  icon,
  reelCard,
  reviewCard,
  sectionHead,
} from "../ui.js";

const kitchenFaqs = FAQ_GROUPS.find((group) => group.id === "kitchens").items;

export function renderRestaurants(req, res) {
  const origin = siteOrigin(req);

  const body = `
    <section class="page-hero page-hero-partner">
      <div class="hero-glow" aria-hidden="true"></div>
      <div class="wrap page-hero-grid">
        <div class="hero-copy">
          <p class="eyebrow"><span class="dot"></span>For kitchens</p>
          <h1>Put your kitchen on the feed.</h1>
          <p class="lede">
            A menu photo says what you serve. A thirty-second reel shows why it is
            worth leaving the house for. Post your best dish in about two minutes and
            get in front of local diners who are deciding right now.
          </p>
          <div class="hero-actions">
            <a class="btn btn-primary btn-lg" href="${PARTNER_JOIN_URL}" data-track="cta" data-cta="Create a kitchen account">
              Create a kitchen account ${icon("arrow", 18)}
            </a>
            <a class="btn btn-ghost btn-lg" href="#how-it-works">See how posting works</a>
          </div>
          <ul class="hero-chips">
            <li>${icon("check", 15)} Free in early access</li>
            <li>${icon("check", 15)} No commission</li>
            <li>${icon("clock", 15)} Live in minutes</li>
          </ul>
        </div>

        <div class="page-hero-photo">
          <img
            src="/assets/img/kitchen-1200.webp"
            srcset="/assets/img/kitchen-800.webp 800w, /assets/img/kitchen-1200.webp 1200w"
            sizes="(max-width: 900px) 92vw, 46vw"
            width="1200"
            height="900"
            alt="Chefs plating food together in an independent restaurant kitchen"
            fetchpriority="high"
            decoding="async"
          />
          <div class="photo-card">
            <span class="photo-card-icon">${icon("film", 18)}</span>
            <span><strong>Reel published</strong><em>Charred chilli chicken pizza · $16</em></span>
            <span class="photo-card-live">Live</span>
          </div>
        </div>
      </div>
      <div class="wrap">
        <div class="trust-bar">
          <span class="trust-chip">${icon("shield", 16)} Verified kitchen accounts</span>
          <span class="trust-chip">${icon("store", 16)} Your name, your dish</span>
          <span class="trust-chip">${icon("lock", 16)} Secure partner sessions</span>
          <span class="trust-chip">${icon("link", 16)} Your media stays yours</span>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        ${sectionHead({
          eyebrow: "Why Zomareel",
          title: "Discovery without the ad spend.",
          lede: "You are not buying impressions. You are showing a plate you are proud of to people who are already hungry, on a feed that is nothing but food.",
        })}

        <div class="feature-grid">
          <article class="feature-card">
            <span class="feature-icon">${icon("film", 22)}</span>
            <h3>Your dish, front and centre</h3>
            <p>Full-bleed vertical media with your kitchen name, dish name and price. No banner fighting for space.</p>
          </article>
          <article class="feature-card">
            <span class="feature-icon">${icon("tag", 22)}</span>
            <h3>Price and place included</h3>
            <p>Tell diners what it costs and where it is served before they make the trip. Fewer tyre-kickers, more orders.</p>
          </article>
          <article class="feature-card">
            <span class="feature-icon">${icon("clock", 22)}</span>
            <h3>Two minutes to publish</h3>
            <p>Paste a link to a photo or vertical video, add the details, hit publish. No editor, no render queue, no approval maze.</p>
          </article>
          <article class="feature-card">
            <span class="feature-icon">${icon("store", 22)}</span>
            <h3>A dashboard, not a project</h3>
            <p>Your kitchen profile, posted reels and likes in one place. Sign in with a secure HttpOnly session and get back to service.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="section section-how" id="how-it-works">
      <div class="wrap">
        ${sectionHead({
          eyebrow: "How posting works",
          title: "One dish. Three fields. On the feed.",
          lede: "Choose your video, add the dish details, and publish it straight to the customer feed.",
        })}

        <ol class="step-row">
          <li class="step-card">
            <span class="step-num">1</span>
            <h3>Add your video</h3>
            <p>Upload an MP4 video from your device, then publish it to show customers what you are cooking.</p>
          </li>
          <li class="step-card">
            <span class="step-num">2</span>
            <h3>Add the detail</h3>
            <p>Add the dish name, price, where it is served, and a caption.</p>
          </li>
          <li class="step-card">
            <span class="step-num">3</span>
            <h3>Publish to the feed</h3>
            <p>Your reel goes live immediately. Post again whenever the specials board changes.</p>
          </li>
        </ol>

        <p class="fine-print fine-print-center">
          Upload MP4 videos up to 50 MB directly from your device. Published videos appear in the customer feed immediately.
        </p>
      </div>
    </section>

    <section class="section section-feed">
      <div class="wrap">
        ${sectionHead({
          eyebrow: "What a good reel looks like",
          title: "Show the thing you would order twice.",
          lede: "One dish, shot close, described honestly. These are sample partner reels — your kitchen name sits at the top of every one.",
        })}

        <div class="reel-grid reel-grid-two">
          ${REELS.slice(2, 4).map((reel) => reelCard(reel)).join("")}
        </div>

        <div class="tips-grid">
          <article class="tip">
            <span class="tip-num">01</span>
            <h3>Shoot vertical, shoot close</h3>
            <p>A phone at arm's length beats a wide shot of the room. Fill the frame with the plate and keep the light coming from behind you.</p>
          </article>
          <article class="tip">
            <span class="tip-num">02</span>
            <h3>Name the dish properly</h3>
            <p>“Prawn shoyu ramen” gets remembered. “Chef's special” does not. Put the words diners would say out loud.</p>
          </article>
          <article class="tip">
            <span class="tip-num">03</span>
            <h3>Use a real price</h3>
            <p>The feed works because the details are trustworthy. Update the reel when the price or the dish changes.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="section section-split section-split-alt">
      <div class="wrap split split-reverse">
        <div class="split-media">
          <img
            src="/assets/img/about-1200.webp"
            srcset="/assets/img/about-800.webp 800w, /assets/img/about-1200.webp 1200w"
            sizes="(max-width: 900px) 92vw, 48vw"
            width="1200"
            height="800"
            alt="Three plates of food on a wooden table with herbs and chilli"
            loading="lazy"
            decoding="async"
          />
          <span class="media-badge">${icon("store", 14)} Built for independent kitchens</span>
        </div>
        <div class="split-copy">
          <p class="eyebrow"><span class="dot"></span>Who it is for</p>
          <h2>Small kitchens. Big plates. No marketing department.</h2>
          <p class="section-lede">
            Zomareel is for the counter with eight stools, the bakery that sells out
            by noon, the food truck that moves with the weather. If a dish is worth
            cooking, it is worth a reel.
          </p>
          <ul class="check-list">
            <li>${icon("check", 18)} Restaurants, cafés, bakeries, food trucks and food makers</li>
            <li>${icon("check", 18)} One account per kitchen, one profile, one feed</li>
            <li>${icon("check", 18)} No minimum spend, no long contract, no exclusivity</li>
            <li>${icon("check", 18)} Free while Zomareel is in early access</li>
          </ul>
          <div class="split-actions">
            <a class="btn btn-primary" href="${PARTNER_JOIN_URL}" data-track="cta" data-cta="Start posting free">Start posting free ${icon("arrow", 16)}</a>
            <a class="text-link" href="${PARTNER_SIGNIN_URL}">Already a partner? Sign in</a>
          </div>
        </div>
      </div>
    </section>

    <section class="section section-reviews">
      <div class="wrap">
        ${sectionHead({
          eyebrow: "From behind the pass",
          title: "Kitchens that tried it.",
          lede: "Honest notes from owners who posted their first reel and watched what happened.",
        })}
        <div class="review-grid review-grid-two">
          ${REVIEWS.filter((review) => review.role !== "Diner")
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
            eyebrow: "Kitchen questions",
            title: "The practical bits.",
            lede: "Hosting, pricing, posting frequency and what makes a reel work.",
          })}
          <a class="btn btn-ghost" href="/faq">Full FAQ ${icon("arrow", 16)}</a>
        </div>
        <div>${faqList(kitchenFaqs.slice(0, 4), { openFirst: true })}</div>
      </div>
    </section>

    <div class="wrap">
      ${ctaBand({
        eyebrow: "Free in early access",
        title: "Your next regular is already scrolling.",
        text: "Create a kitchen account, post the dish you are proudest of, and let the plate do the selling.",
        primary: { href: PARTNER_JOIN_URL, label: "Create a kitchen account" },
        secondary: { href: DINER_JOIN_URL, label: "I'm here to eat" },
        note: "No commission · No contract · Your media stays yours",
      })}
    </div>
  `;

  return renderPage({
    req,
    res,
    pathname: "/restaurants",
    title: "Restaurant reels that get you discovered | Zomareel",
    description:
      "Put your best dish in front of local diners with a short vertical reel. Post in minutes, show your price and location, and get discovered by people ready to eat.",
    schemaName: "Zomareel for restaurants and food partners",
    schema: {
      "@type": "Service",
      "@id": `${origin}/restaurants#service`,
      name: "Zomareel for food partners",
      serviceType: "Restaurant discovery and short-form food video marketing",
      description:
        "Food partners post short vertical reels of their dishes to Zomareel's diner feed, with dish names, prices and locations.",
      provider: { "@id": `${origin}/#organization` },
      audience: {
        "@type": "Audience",
        audienceType: "Independent restaurants, cafés, bakeries and food trucks",
      },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Free kitchen account and reel posting during early access",
      },
      url: absoluteUrl(origin, "/restaurants"),
    },
    breadcrumb: [
      { label: "Home", href: "/" },
      { label: "For kitchens", href: "/restaurants" },
    ],
    image: "/assets/img/kitchen-1200.webp",
    body,
  });
}
