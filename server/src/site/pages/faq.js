import { ALL_FAQS, FAQ_GROUPS, CONTACT_EMAIL, DINER_JOIN_URL } from "../data.js";
import { renderPage } from "../layout.js";
import { ctaBand, faqList, icon, sectionHead } from "../ui.js";

export function renderFaq(req, res) {
  const body = `
    <section class="page-hero page-hero-short">
      <div class="hero-glow" aria-hidden="true"></div>
      <div class="wrap narrow">
        <p class="eyebrow"><span class="dot"></span>FAQ</p>
        <h1>Questions, answered.</h1>
        <p class="lede">
          Everything about diner accounts, posting reels as a kitchen, session
          security and the data we keep. If your question is not here, email
          <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a> and a human will
          answer.
        </p>
        <nav class="jump-links" aria-label="FAQ sections">
          ${FAQ_GROUPS.map(
            (group) => `<a href="#${group.id}" class="jump-link">${group.title}</a>`
          ).join("")}
        </nav>
      </div>
    </section>

    <section class="section section-faq-page">
      <div class="wrap narrow">
        ${FAQ_GROUPS.map(
          (group) => `
          <section class="faq-block" id="${group.id}" aria-labelledby="${group.id}-title">
            <h2 id="${group.id}-title">${group.title}</h2>
            ${faqList(group.items, { openFirst: group.id === "diners" })}
          </section>`
        ).join("")}

        <aside class="faq-help">
          <div>
            <h2>Still stuck?</h2>
            <p>Tell us what you are trying to do. We answer every message from a real inbox.</p>
          </div>
          <a class="btn btn-ghost" href="mailto:${CONTACT_EMAIL}">${icon("mail", 16)} Email Zomareel</a>
        </aside>
      </div>
    </section>

    <div class="wrap">
      ${ctaBand({
        eyebrow: "Enough reading",
        title: "Go see what's cooking.",
        text: "The feed is the best explanation of Zomareel. Make a free account and scroll for a minute.",
        primary: { href: DINER_JOIN_URL, label: "Create a free account" },
        secondary: { href: "/restaurants", label: "I run a kitchen" },
      })}
    </div>
  `;

  return renderPage({
    req,
    res,
    pathname: "/faq",
    bodyClass: "faq-page",
    title: "Zomareel FAQ — accounts, reels & privacy",
    description:
      "Answers about diner accounts, posting food reels as a kitchen, pricing, session security, analytics, and deleting your Zomareel account.",
    schemaType: "FAQPage",
    schemaName: "Zomareel frequently asked questions",
    pageNode: {
      mainEntity: ALL_FAQS.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
    breadcrumb: [
      { label: "Home", href: "/" },
      { label: "FAQ", href: "/faq" },
    ],
    body,
  });
}
