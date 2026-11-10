import {
  CONTACT_EMAIL,
  CONTENT_UPDATED,
  DEFAULT_OG_IMAGE,
  GA_MEASUREMENT_ID,
  GOOGLE_SITE_VERIFICATION,
  NAV_LINKS,
  SITE_DESCRIPTION,
  SITE_NAME,
  absoluteUrl,
  siteOrigin,
} from "./data.js";
import { icon } from "./ui.js";

const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%233A4B53'/%3E%3Cstop offset='1' stop-color='%232A3A40'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='64' height='64' rx='18' fill='url(%23g)'/%3E%3Cpath d='M26 20l18 12-18 12z' fill='%23fff'/%3E%3C/svg%3E";

function brandMarkup(size = 38) {
  return `
    <span class="brand-mark" style="--mark-size:${size}px" aria-hidden="true">
      <svg viewBox="0 0 64 64" focusable="false">
        <defs>
          <linearGradient id="brand-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#3A4B53" />
            <stop offset="1" stop-color="#2A3A40" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="18" fill="url(#brand-gradient)" />
        <path d="M26 20l18 12-18 12z" fill="#fff" />
      </svg>
    </span>
  `;
}

function headerMarkup(pathname) {
  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return `
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header" id="site-header">
      <div class="wrap header-inner">
        <a class="brand" href="/" aria-label="${SITE_NAME} home">
          ${brandMarkup()}
          <span class="brand-name">${SITE_NAME}</span>
        </a>

        <nav class="site-nav" id="site-nav" aria-label="Primary">
          ${NAV_LINKS.map(
            (link) => `<a class="nav-link${isActive(link.href) ? " is-active" : ""}" href="${link.href}"${
              isActive(link.href) ? ' aria-current="page"' : ""
            }>${link.label}</a>`
          ).join("")}
          <a class="btn btn-primary btn-sm nav-cta" href="/app#/login" data-track="cta" data-cta="Sign in">
            Sign in ${icon("arrow", 16)}
          </a>
        </nav>

        <div class="header-actions">
          <a class="btn btn-primary btn-sm header-cta" href="/app#/login" data-track="cta" data-cta="Sign in">
            Sign in
          </a>
          <button
            class="nav-toggle"
            type="button"
            id="nav-toggle"
            aria-label="Open menu"
            aria-expanded="false"
            aria-controls="site-nav"
          >
            <span class="nav-toggle-open">${icon("menu", 22)}</span>
            <span class="nav-toggle-close">${icon("close", 22)}</span>
          </button>
        </div>
      </div>
    </header>
  `;
}

function footerMarkup() {
  const year = new Date().getFullYear();

  return `
    <footer class="site-footer">
      <div class="wrap footer-grid">
        <div class="footer-brand">
          <a class="brand" href="/" aria-label="${SITE_NAME} home">
            ${brandMarkup(32)}
            <span class="brand-name">${SITE_NAME}</span>
          </a>
          <p>Food worth reeling about. Real dishes from independent kitchens, one short scroll at a time.</p>
          <a class="footer-mail" href="mailto:${CONTACT_EMAIL}">${icon("mail", 16)} ${CONTACT_EMAIL}</a>
        </div>

        <nav class="footer-col" aria-label="Product">
          <h2 class="footer-title">Product</h2>
          <a href="/diners">For diners</a>
          <a href="/restaurants">For kitchens</a>
          <a href="/app#/login">Open Zomareel</a>
        </nav>

        <nav class="footer-col" aria-label="Company">
          <h2 class="footer-title">Company</h2>
          <a href="/about">About</a>
          <a href="/reviews">Reviews</a>
          <a href="/faq">FAQ</a>
        </nav>

        <nav class="footer-col" aria-label="Legal">
          <h2 class="footer-title">Legal</h2>
          <a href="/privacy">Privacy policy</a>
          <a href="mailto:${CONTACT_EMAIL}">Contact us</a>
        </nav>
      </div>

      <div class="wrap footer-bottom">
        <p>© ${year} ${SITE_NAME}. All rights reserved.</p>
        <p class="footer-credit">
          Food photography via
          <a href="https://unsplash.com" rel="noopener noreferrer" target="_blank">Unsplash</a>.
        </p>
      </div>
    </footer>
  `;
}

function consentMarkup() {
  if (!GA_MEASUREMENT_ID) {
    return "";
  }

  return `
    <aside class="consent" id="consent" aria-label="Analytics consent" hidden>
      <div class="consent-inner">
        <p>
          <strong>A small ask.</strong>
          We would like to use Google Analytics to understand which pages are useful.
          It only loads if you accept, and we never run ad tracking.
          <a href="/privacy#analytics">Read the policy</a>.
        </p>
        <div class="consent-actions">
          <button class="btn btn-ghost btn-sm" type="button" data-consent="denied">Decline</button>
          <button class="btn btn-primary btn-sm" type="button" data-consent="granted">Accept analytics</button>
        </div>
      </div>
    </aside>
  `;
}

function breadcrumbMarkup(trail) {
  if (!trail?.length) {
    return "";
  }

  return `
    <nav class="crumbs" aria-label="Breadcrumb">
      <ol>
        ${trail
          .map((item, index) => {
            const isLast = index === trail.length - 1;
            return isLast
              ? `<li><span aria-current="page">${item.label}</span></li>`
              : `<li><a href="${item.href}">${item.label}</a></li>`;
          })
          .join("")}
      </ol>
    </nav>
  `;
}

function schemaGraph({
  origin,
  title,
  description,
  pathname,
  schemaType,
  schemaName,
  breadcrumb,
  schema,
  image,
  noindex,
}) {
  const url = absoluteUrl(origin, pathname);
  const pageId = `${url}#webpage`;
  const organizationId = `${origin}/#organization`;
  const websiteId = `${origin}/#website`;

  const graph = [
    {
      "@type": "Organization",
      "@id": organizationId,
      name: SITE_NAME,
      url: `${origin}/`,
      description: SITE_DESCRIPTION,
      email: CONTACT_EMAIL,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl(origin, "/assets/img/logo.png"),
        width: 512,
        height: 512,
      },
      image: absoluteUrl(origin, image),
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: CONTACT_EMAIL,
          availableLanguage: ["English"],
        },
      ],
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      url: `${origin}/`,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      inLanguage: "en",
      publisher: { "@id": organizationId },
    },
    {
      "@type": schemaType || "WebPage",
      "@id": pageId,
      url,
      name: schemaName || title,
      description,
      isPartOf: { "@id": websiteId },
      about: { "@id": organizationId },
      inLanguage: "en",
      dateModified: CONTENT_UPDATED,
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: absoluteUrl(origin, image),
        width: 1200,
        height: 630,
      },
      ...(noindex ? { isAccessibleForFree: false } : {}),
    },
  ];

  if (breadcrumb?.length) {
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: breadcrumb.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.label,
        item: absoluteUrl(origin, item.href),
      })),
    });
  }

  if (schema) {
    graph.push(...(Array.isArray(schema) ? schema : [schema]));
  }

  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
}

export function renderPage({
  req,
  res,
  pathname,
  title,
  description,
  schemaType,
  schemaName,
  schema,
  breadcrumb,
  image = DEFAULT_OG_IMAGE,
  ogType = "website",
  noindex = false,
  status = 200,
  pageNode = {},
  bodyClass = "",
  body,
  head = "",
}) {
  const origin = siteOrigin(req);
  const url = absoluteUrl(origin, pathname);
  const imageUrl = absoluteUrl(origin, image);
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  if (res) {
    res.status(status);
  }

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${fullTitle}</title>
    <meta name="description" content="${description}" />
    <meta name="robots" content="${noindex ? "noindex, follow" : "index, follow, max-image-preview:large"}" />
    <link rel="canonical" href="${url}" />
    <meta name="theme-color" content="#FDFBF7" />
    <meta name="format-detection" content="telephone=no" />
    ${GOOGLE_SITE_VERIFICATION ? `<meta name="google-site-verification" content="${GOOGLE_SITE_VERIFICATION}" />` : ""}

    <meta property="og:type" content="${ogType}" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:title" content="${fullTitle}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${SITE_NAME} — ${description}" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${fullTitle}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${imageUrl}" />
    <meta name="twitter:image:alt" content="${SITE_NAME} — ${description}" />

    <link rel="icon" href="${FAVICON}" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/assets/img/logo.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@400;500;600&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/assets/site.css" />
    ${head}

    <script type="application/ld+json">${schemaGraph({
      origin,
      title: fullTitle,
      description,
      pathname,
      schemaType,
      schemaName,
      breadcrumb,
      schema,
      image,
      noindex,
    })}</script>

    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        window.dataLayer.push(arguments);
      }
      gtag("consent", "default", {
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        analytics_storage: "denied",
        functionality_storage: "granted",
        security_storage: "granted",
      });
      window.ZOMA_CONFIG = {
        gaId: ${JSON.stringify(GA_MEASUREMENT_ID)},
        consentKey: "zomareel.analytics-consent",
      };
      if (/^#\\//.test(window.location.hash)) {
        window.location.replace("/app" + window.location.hash);
      }
    </script>
  </head>
  <body class="${bodyClass}">
    ${headerMarkup(pathname)}
    <main id="main">
      ${breadcrumbMarkup(breadcrumb)}
      ${body}
    </main>
    ${footerMarkup()}
    ${consentMarkup()}
    <script type="module" src="/js/site.js"></script>
  </body>
</html>
`;
}

export function renderNotFound(req) {
  return renderPage({
    req,
    pathname: req.path,
    title: "Page not found",
    description:
      "That page is not on the menu. Head back to the Zomareel home page or browse diner and kitchen guides.",
    body: `
      <section class="section notfound">
        <div class="wrap narrow">
          <p class="eyebrow"><span class="dot"></span>404</p>
          <h1>This plate left the pass.</h1>
          <p class="lede">The page you wanted does not exist, or it moved. The feed, the kitchen guide and the FAQ are all still hot.</p>
          <div class="hero-actions">
            <a class="btn btn-primary btn-lg" href="/">Back to Zomareel ${icon("arrow", 18)}</a>
            <a class="btn btn-ghost btn-lg" href="/faq">Read the FAQ</a>
          </div>
        </div>
      </section>
    `,
    noindex: true,
    status: 404,
  });
}
