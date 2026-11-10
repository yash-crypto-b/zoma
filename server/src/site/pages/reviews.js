import {
  DINER_JOIN_URL,
  PARTNER_JOIN_URL,
  REVIEWS,
  REVIEW_SUMMARY,
  absoluteUrl,
  siteOrigin,
} from "../data.js";
import { renderPage } from "../layout.js";
import { ctaBand, icon, reviewCard, sectionHead, stars } from "../ui.js";

export function renderReviews(req, res) {
  const origin = siteOrigin(req);

  const body = `
    <section class="page-hero page-hero-short">
      <div class="hero-glow" aria-hidden="true"></div>
      <div class="wrap narrow">
        <p class="eyebrow"><span class="dot"></span>Reviews</p>
        <h1>Straight from the tables and the pass.</h1>
        <p class="lede">
          Zomareel is built for two people: the one deciding where to eat and the one
          deciding what to cook. Here is what both of them said.
        </p>
      </div>
    </section>

    <section class="section section-reviews-page">
      <div class="wrap">
        <div class="rating-summary">
          <div class="rating-summary-score">
            <p class="rating-value">${REVIEW_SUMMARY.rating}<span>/5</span></p>
            ${stars(REVIEW_SUMMARY.rating, `Rated ${REVIEW_SUMMARY.rating} out of 5`)}
            <p class="muted">${REVIEW_SUMMARY.count} reviews</p>
          </div>

          <div class="rating-bars" aria-label="Rating distribution">
            ${REVIEW_SUMMARY.breakdown
              .map(
                (row) => `
              <div class="rating-row">
                <span class="rating-row-label">${row.stars} star</span>
                <span class="rating-bar"><span style="width:${row.percent}%"></span></span>
                <span class="rating-row-value">${row.percent}%</span>
              </div>`
              )
              .join("")}
          </div>

          <div class="rating-summary-note">
            <span class="feature-icon">${icon("shield", 20)}</span>
            <p>
              Reviews come from diner and kitchen accounts. We publish the
              constructive ones too — a four-star note about weekly view counts is
              already on the roadmap.
            </p>
          </div>
        </div>

        <div class="review-grid review-grid-three">
          ${REVIEWS.map((review) => reviewCard(review)).join("")}
        </div>

        <p class="fine-print fine-print-center">
          Sample review content is shown while Zomareel is in early access. Replace it
          with verified customer reviews before launch.
        </p>
      </div>
    </section>

    <section class="section section-principles">
      <div class="wrap">
        ${sectionHead({
          eyebrow: "What people mention most",
          title: "The same three things, every time.",
          lede: "Across diner and kitchen feedback, the pattern is consistent.",
        })}
        <div class="principle-grid principle-grid-three">
          <article class="principle-card">
            <span class="principle-num">01</span>
            <h3>“I can see the actual dish.”</h3>
            <p>Current food, not a stock photo or a menu description. It is the thing diners bring up first.</p>
          </article>
          <article class="principle-card">
            <span class="principle-num">02</span>
            <h3>“Posting took minutes.”</h3>
            <p>Upload a video, add the dish name and price, and publish. Simple tools leave more time for cooking.</p>
          </article>
          <article class="principle-card">
            <span class="principle-num">03</span>
            <h3>“The feed is quiet.”</h3>
            <p>No ads, no autoplay sound, no engagement bait. Just food and the kitchens behind it.</p>
          </article>
        </div>
      </div>
    </section>

    <div class="wrap">
      ${ctaBand({
        eyebrow: "Join them",
        title: "See what the fuss tastes like.",
        text: "Make a free diner account and scroll the feed, or put your own dish in front of the people reviewing it.",
        primary: { href: DINER_JOIN_URL, label: "Create a free account" },
        secondary: { href: PARTNER_JOIN_URL, label: "List your kitchen" },
      })}
    </div>
  `;

  return renderPage({
    req,
    res,
    pathname: "/reviews",
    bodyClass: "reviews-page",
    title: "Zomareel reviews from diners and kitchens",
    description:
      "Read what diners and independent food partners say about discovering dishes, posting reels, and filling tables with Zomareel.",
    schemaType: "CollectionPage",
    schema: {
      "@type": "Organization",
      "@id": `${origin}/#organization`,
      name: "Zomareel",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: REVIEW_SUMMARY.rating,
        reviewCount: REVIEW_SUMMARY.count,
        bestRating: 5,
        worstRating: 1,
      },
      review: REVIEWS.map((review) => ({
        "@type": "Review",
        author: { "@type": "Person", name: review.name },
        datePublished: review.date,
        name: `${review.role} review of Zomareel`,
        reviewBody: review.quote,
        reviewRating: {
          "@type": "Rating",
          ratingValue: review.rating,
          bestRating: 5,
          worstRating: 1,
        },
      })),
      url: absoluteUrl(origin, "/reviews"),
    },
    breadcrumb: [
      { label: "Home", href: "/" },
      { label: "Reviews", href: "/reviews" },
    ],
    body,
  });
}
