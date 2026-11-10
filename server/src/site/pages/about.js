import {
  DINER_JOIN_URL,
  PARTNER_JOIN_URL,
  absoluteUrl,
  siteOrigin,
} from "../data.js";
import { renderPage } from "../layout.js";
import { ctaBand, icon, sectionHead } from "../ui.js";

export function renderAbout(req, res) {
  const origin = siteOrigin(req);

  const body = `
    <section class="page-hero page-hero-about">
      <div class="hero-glow" aria-hidden="true"></div>
      <div class="wrap page-hero-grid">
        <div class="hero-copy">
          <p class="eyebrow"><span class="dot"></span>About Zomareel</p>
          <h1>Good food.<br />Real kitchens.<br /><em>A closer connection.</em></h1>
          <p class="lede">
            Discover the dishes worth stepping out for. Zomareel brings food lovers
            and independent kitchens together through short videos, honest details,
            and a shared love of a good plate.
          </p>
          <div class="hero-actions">
            <a class="btn btn-primary btn-lg" href="/diners" data-track="cta" data-cta="See the diner guide">
              See the diner guide ${icon("arrow", 18)}
            </a>
            <a class="btn btn-ghost btn-lg" href="/restaurants">For kitchens</a>
          </div>
        </div>

        <div class="page-hero-photo">
          <img
            src="/assets/img/about-1200.webp"
            srcset="/assets/img/about-800.webp 800w, /assets/img/about-1200.webp 1200w"
            sizes="(max-width: 900px) 92vw, 46vw"
            width="1200"
            height="800"
            alt="Three freshly plated dishes on a rustic table, surrounded by herbs and chillies"
            fetchpriority="high"
            decoding="async"
          />
          <div class="photo-card">
            <span class="photo-card-icon">${icon("spark", 18)}</span>
            <span><strong>Food first</strong><em>Every reel is a kitchen's own dish</em></span>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap story-grid">
        <div class="story-copy">
          <p class="eyebrow"><span class="dot"></span>Why we built this</p>
          <h2>A feed that starts with the food.</h2>
          <p>Choosing your next meal should feel inspiring. We make it easier to see
            what kitchens are cooking, learn about the dish, and find something you want to try.</p>
          <p>For independent kitchens, it is a simple way to be seen. Upload a video,
            add a name, price, and caption, and publish directly to the customer feed.</p>
          <p>One shared space for the people who love making food and the people who love discovering it.</p>
        </div>

        <aside class="story-quote">
          <span class="story-quote-mark" aria-hidden="true">${icon("quote", 26)}</span>
          <blockquote>
            The best restaurants are rarely the loudest. They are the ones with a
            queue at 12:30 and a dish the neighbourhood orders by name.
          </blockquote>
          <p class="muted">The idea Zomareel is built around</p>
        </aside>
      </div>
    </section>

    <section class="section section-principles">
      <div class="wrap">
        ${sectionHead({
          eyebrow: "What we believe",
          title: "Thoughtful by design.",
          lede: "A few simple principles guide what we build and how it feels to use.",
        })}

        <div class="principle-grid">
          <article class="principle-card">
            <span class="principle-num">01</span>
            <h3>The plate is the pitch</h3>
            <p>See the dish first, with its kitchen, price, and location clearly alongside it.</p>
          </article>
          <article class="principle-card">
            <span class="principle-num">02</span>
            <h3>No pay-to-win feed</h3>
            <p>Discover posts from kitchens in one shared feed, with no ads between the dishes.</p>
          </article>
          <article class="principle-card">
            <span class="principle-num">03</span>
            <h3>Small kitchens first</h3>
            <p>Simple publishing tools help independent kitchens share their food straight from a phone.</p>
          </article>
          <article class="principle-card">
            <span class="principle-num">04</span>
            <h3>Privacy comes standard</h3>
            <p>Essential session data by default. Optional analytics with your consent. Clear choices, always.</p>
          </article>
        </div>
      </div>
    </section>



    <section class="section">
      <div class="wrap">
        ${sectionHead({
          eyebrow: "Who it is for",
          title: "Two sides. One table.",
          lede: "Zomareel only works if it is good for both the person eating and the person cooking.",
        })}

        <div class="audience-grid">
          <a class="audience-card" href="/diners">
            <span class="audience-icon">${icon("user", 24)}</span>
            <h3>Diners who care what arrives</h3>
            <p>Watch food reels, explore dishes and prices, and find your next favourite plate.</p>
            <span class="text-link">Explore the diner guide ${icon("arrow", 16)}</span>
          </a>
          <a class="audience-card" href="/restaurants">
            <span class="audience-icon">${icon("store", 24)}</span>
            <h3>Kitchens with something to show</h3>
            <p>Upload your video, add the details, and reach food lovers through the customer feed.</p>
            <span class="text-link">Explore the kitchen guide ${icon("arrow", 16)}</span>
          </a>
        </div>
      </div>
    </section>

    <div class="wrap">
      ${ctaBand({
        eyebrow: "Pull up a chair",
        title: "Good food deserves a better feed.",
        text: "Browse the plates, follow your appetite, or put your own kitchen in front of the people who will love it.",
        primary: { href: DINER_JOIN_URL, label: "Find your next plate" },
        secondary: { href: PARTNER_JOIN_URL, label: "List your kitchen" },
      })}
    </div>
  `;

  return renderPage({
    req,
    res,
    pathname: "/about",
    bodyClass: "about-page",
    title: "About Zomareel — built for independent kitchens",
    description:
      "Zomareel is a food-first feed where real kitchens show what they're cooking. Meet the idea, the principles, and the people we build for.",
    schemaType: "AboutPage",
    schema: {
      "@type": "AboutPage",
      "@id": `${origin}/about#aboutpage`,
      name: "About Zomareel",
      url: absoluteUrl(origin, "/about"),
      isPartOf: { "@id": `${origin}/#website` },
      about: { "@id": `${origin}/#organization` },
      mainEntity: { "@id": `${origin}/#organization` },
    },
    breadcrumb: [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
    ],
    image: "/assets/img/about-1200.webp",
    body,
  });
}
