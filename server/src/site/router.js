import express from "express";
import { CONTENT_UPDATED, absoluteUrl, siteOrigin } from "./data.js";
import { renderNotFound } from "./layout.js";
import { renderHome } from "./pages/home.js";
import { renderDiners } from "./pages/diners.js";
import { renderRestaurants } from "./pages/restaurants.js";
import { renderAbout } from "./pages/about.js";
import { renderReviews } from "./pages/reviews.js";
import { renderFaq } from "./pages/faq.js";
import { renderPrivacy } from "./pages/privacy.js";

const router = express.Router();

const PAGES = [
  { path: "/", render: renderHome, changefreq: "weekly", priority: "1.0" },
  { path: "/diners", render: renderDiners, changefreq: "monthly", priority: "0.9" },
  {
    path: "/restaurants",
    render: renderRestaurants,
    changefreq: "monthly",
    priority: "0.9",
  },
  { path: "/about", render: renderAbout, changefreq: "yearly", priority: "0.6" },
  { path: "/reviews", render: renderReviews, changefreq: "monthly", priority: "0.7" },
  { path: "/faq", render: renderFaq, changefreq: "monthly", priority: "0.7" },
  { path: "/privacy", render: renderPrivacy, changefreq: "yearly", priority: "0.3" },
];

const sendPage = (render) => (req, res) => {
  res.type("html").send(render(req, res).replaceAll("<script", `<script nonce="${res.locals.nonce}"`));
};

for (const page of PAGES) {
  router.get(page.path, sendPage(page.render));
}

router.get("/sitemap.xml", (req, res) => {
  const origin = siteOrigin(req);

  const urls = PAGES.map(
    (page) => `  <url>
    <loc>${absoluteUrl(origin, page.path)}</loc>
    <lastmod>${CONTENT_UPDATED}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  ).join("\n");

  res
    .type("application/xml")
    .set("Cache-Control", "public, max-age=3600")
    .send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`);
});

router.get("/robots.txt", (req, res) => {
  const origin = siteOrigin(req);

  res
    .type("text/plain")
    .set("Cache-Control", "public, max-age=3600")
    .send(`# Zomareel — public marketing site
User-agent: *
Allow: /
Disallow: /app
Disallow: /index.html
Disallow: /api/

Sitemap: ${absoluteUrl(origin, "/sitemap.xml")}
`);
});

export function siteNotFound(req, res) {
  res.status(404).type("html").send(renderNotFound(req).replaceAll("<script", `<script nonce="${res.locals.nonce}"`));
}

export default router;
