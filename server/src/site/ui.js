/** Server-rendered UI pieces for the public marketing site. */

const ICON_PATHS = {
  arrow: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  check: '<path d="m4.5 12.5 5 5L20 6.5"/>',
  star: '<path d="m12 2.6 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.4l6.5-.9z" fill="currentColor" stroke="none"/>',
  play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none"/>',
  menu: '<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/>',
  close: '<path d="m6 6 12 12"/><path d="m18 6-12 12"/>',
  store: '<path d="M4 9h16v11H4z"/><path d="M7 9V5h10v4"/><path d="M10 20v-6h4v6"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5c.8-3.5 3.9-5.5 7.5-5.5s6.7 2 7.5 5.5"/>',
  spark: '<path d="M12 3.2 14 9l5.8 2-5.8 2-2 5.8-2-5.8L4.2 11 10 9z"/>',
  shield: '<path d="M12 3.2 20 6v6c0 5-3.4 8.2-8 9.8C7.4 20.2 4 17 4 12V6z"/><path d="m8.5 12 2.5 2.5 4.5-4.5"/>',
  heart: '<path d="M12 20.5S3.5 15.4 3.5 9.9A4.6 4.6 0 0 1 12 6.9a4.6 4.6 0 0 1 8.5 3c0 5.5-8.5 10.6-8.5 10.6z"/>',
  tag: '<path d="M3.5 12V4.5H11l9.5 9.5-6.5 6.5z"/><circle cx="7.6" cy="7.6" r="1.4"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.2v5.3l3.4 2"/>',
  map: '<path d="M12 20.7s6.7-5.4 6.7-10.2a6.7 6.7 0 1 0-13.4 0C5.3 15.3 12 20.7 12 20.7z"/><circle cx="12" cy="10.3" r="2.4"/>',
  mail: '<rect x="3" y="5.5" width="18" height="13" rx="2.4"/><path d="m3.8 7.4 8.2 5.8 8.2-5.8"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.4"/><path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5"/>',
  film: '<rect x="3.2" y="4" width="17.6" height="16" rx="3"/><path d="M8 4v16"/><path d="M16 4v16"/><path d="M3.2 12h17.6"/>',
  quote: '<path d="M9.5 6.5H5v6.2h4.2c0 2.6-1.4 3.8-3.4 4.3M19.5 6.5H15v6.2h4.2c0 2.6-1.4 3.8-3.4 4.3"/>',
  link: '<path d="M10 14a4.5 4.5 0 0 1 0-6.4l2.2-2.2a4.5 4.5 0 0 1 6.4 6.4l-2.2 2.2"/><path d="M14 10a4.5 4.5 0 0 1 0 6.4l-2.2 2.2a4.5 4.5 0 0 1-6.4-6.4l2.2-2.2"/>',
  sparkle: '<path d="M12 4v4M12 16v4M4 12h4M16 12h4"/><path d="m7 7 2 2M15 15l2 2M17 7l-2 2M9 15l-2 2"/>',
};

export function icon(name, size = 20) {
  const paths = ICON_PATHS[name] || ICON_PATHS.spark;
  return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths}</svg>`;
}

export function stars(rating = 5, label = "") {
  const rounded = Math.round(rating);
  const icons = Array.from({ length: 5 }, (_, index) =>
    `<span class="star${index < rounded ? " is-on" : ""}">${icon("star", 15)}</span>`
  ).join("");

  return `<span class="stars" role="img" aria-label="${label || `${rating} out of 5 stars`}">${icons}</span>`;
}

export function formatPrice(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function formatLikes(value) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value) || 0);
}

function videoMarkup(reel, className = "reel-video") {
  return `<video
    class="${className}"
    poster="${reel.poster}"
    width="${reel.width}"
    height="${reel.height}"
    muted
    loop
    playsinline
    preload="none"
    data-reel-video
    data-mp4="${reel.mp4}"
    data-webm="${reel.webm}"
    aria-hidden="true"
  ></video>`;
}

export function heroReel(reel, index) {
  return `
    <figure class="hero-reel" style="--i:${index}">
      <div class="hero-reel-frame">
        <img src="${reel.poster}" width="540" height="960" alt="${reel.dish}" decoding="async" />
        <figcaption class="hero-reel-caption">
          <strong>${reel.dish}</strong>
          <span>${reel.kitchen} · ${reel.location}</span>
        </figcaption>
      </div>
    </figure>
  `;
}

export function reelCard(reel) {
  return `
    <figure class="reel-card">
      <div class="reel-card-frame">
        <img src="${reel.poster}" width="540" height="960" alt="${reel.dish}" loading="lazy" decoding="async" />
      </div>
      <figcaption class="reel-card-body">
        <p class="reel-kitchen">${reel.kitchen}<span>${reel.location}</span></p>
        <h3 class="reel-dish">${reel.dish}</h3>
        <p class="reel-caption">${reel.caption}</p>
        <p class="reel-meta">
          <span class="reel-price">${formatPrice(reel.price)}</span>
          <span class="reel-likes">${icon("heart", 14)} ${formatLikes(reel.likes)}</span>
        </p>
      </figcaption>
    </figure>
  `;
}

export function sectionHead({ eyebrow, title, lede, id, align = "left" }) {
  return `
    <div class="section-head section-head-${align}">
      ${eyebrow ? `<p class="eyebrow"><span class="dot"></span>${eyebrow}</p>` : ""}
      <h2${id ? ` id="${id}"` : ""}>${title}</h2>
      ${lede ? `<p class="section-lede">${lede}</p>` : ""}
    </div>
  `;
}

export function ctaBand({
  eyebrow = "Your table is waiting",
  title = "Hungry yet?",
  text = "Find the dish first, then find the kitchen. Zomareel is free to browse and takes about a minute to join.",
  primary = { href: "/diners", label: "Find your next plate" },
  secondary = { href: "/restaurants", label: "I run a kitchen" },
  note = "No ads in the feed · Free diner accounts · Verified kitchens",
}) {
  return `
    <section class="cta-band" aria-labelledby="cta-title">
      <div class="cta-band-glow" aria-hidden="true"></div>
      <div class="cta-band-inner">
        <p class="eyebrow eyebrow-light"><span class="dot"></span>${eyebrow}</p>
        <h2 id="cta-title">${title}</h2>
        <p class="cta-band-text">${text}</p>
        <div class="cta-band-actions">
          <a class="btn btn-primary btn-lg" href="${primary.href}" data-track="cta" data-cta="${primary.label}">
            ${primary.label} ${icon("arrow", 18)}
          </a>
          <a class="btn btn-ghost btn-lg" href="${secondary.href}" data-track="cta" data-cta="${secondary.label}">
            ${secondary.label}
          </a>
        </div>
        <p class="cta-band-note">${note}</p>
      </div>
    </section>
  `;
}

export function reviewCard(review, { compact = false } = {}) {
  return `
    <article class="review-card${compact ? " review-card-compact" : ""}">
      <div class="review-top">
        ${stars(review.rating, `${review.rating} out of 5 stars`)}
        <time datetime="${review.date}">${new Date(review.date).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}</time>
      </div>
      <blockquote>“${review.quote}”</blockquote>
      <footer class="review-foot">
        <span class="avatar" aria-hidden="true">${review.name
          .split(" ")
          .map((part) => part.replace(/[^A-Za-z]/g, "").charAt(0))
          .join("")
          .slice(0, 2)}</span>
        <span>
          <strong>${review.name}</strong>
          <em>${review.role} · ${review.location}</em>
        </span>
      </footer>
    </article>
  `;
}

export function faqList(items, { openFirst = false } = {}) {
  return `<div class="faq-list">${items
    .map(
      (item, index) => `
      <details class="faq-item"${openFirst && index === 0 ? " open" : ""}>
        <summary>
          <span>${item.q}</span>
          <span class="faq-icon" aria-hidden="true"></span>
        </summary>
        <div class="faq-answer"><p>${item.a}</p></div>
      </details>`
    )
    .join("")}</div>`;
}

export function trustBar() {
  return `
    <div class="trust-bar">
      ${[
        { icon: "shield", label: "Verified kitchens" },
        { icon: "spark", label: "No ads in the feed" },
        { icon: "tag", label: "Prices on every reel" },
        { icon: "lock", label: "Secure sign-in" },
      ]
        .map(
          (item) => `<span class="trust-chip">${icon(item.icon, 16)}${item.label}</span>`
        )
        .join("")}
    </div>
  `;
}

export function eyebrow(text) {
  return `<p class="eyebrow"><span class="dot"></span>${text}</p>`;
}
