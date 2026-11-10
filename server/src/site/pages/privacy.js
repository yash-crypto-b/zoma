import { CONTACT_EMAIL, PRIVACY_UPDATED } from "../data.js";
import { renderPage } from "../layout.js";
import { icon } from "../ui.js";

const SECTIONS = [
  { id: "who-we-are", label: "Who we are" },
  { id: "what-we-collect", label: "What we collect" },
  { id: "how-we-use-it", label: "How we use it" },
  { id: "legal-bases", label: "Legal bases" },
  { id: "cookies", label: "Cookies & analytics" },
  { id: "sharing", label: "Sharing" },
  { id: "retention", label: "Retention" },
  { id: "security", label: "Security" },
  { id: "your-rights", label: "Your rights" },
  { id: "children", label: "Children" },
  { id: "transfers", label: "International transfers" },
  { id: "changes", label: "Changes" },
  { id: "contact", label: "Contact" },
];

export function renderPrivacy(req, res) {
  const body = `
    <section class="page-hero page-hero-short">
      <div class="hero-glow" aria-hidden="true"></div>
      <div class="wrap narrow">
        <p class="eyebrow"><span class="dot"></span>Legal</p>
        <h1>Privacy policy</h1>
        <p class="lede">
          What Zomareel collects, why we collect it, how long we keep it and the
          choices you have. Written to be read, not to be survived.
        </p>
        <p class="legal-updated">Last updated ${PRIVACY_UPDATED}</p>
      </div>
    </section>

    <section class="section section-legal">
      <div class="wrap legal-layout">
        <aside class="legal-toc">
          <p class="legal-toc-title">On this page</p>
          <nav aria-label="Privacy policy sections">
            ${SECTIONS.map(
              (section) => `<a href="#${section.id}">${section.label}</a>`
            ).join("")}
          </nav>
        </aside>

        <article class="legal-body">
          <div class="legal-summary">
            <h2>The short version</h2>
            <ul class="check-list">
              <li>${icon("check", 17)} We collect the account details you give us and the dishes you like or post.</li>
              <li>${icon("check", 17)} We use them to run the feed and keep your account secure, not to sell profiles.</li>
              <li>${icon("check", 17)} Google Analytics only loads if you accept analytics in the banner.</li>
              <li>${icon("check", 17)} We do not sell personal information or run third-party ad tracking.</li>
              <li>${icon("check", 17)} You can ask for a copy or deletion of your data at ${CONTACT_EMAIL}.</li>
            </ul>
          </div>

          <section id="who-we-are">
            <h2>1. Who we are</h2>
            <p>
              Zomareel (“Zomareel”, “we”, “us”) operates this website and the Zomareel
              diner and food-partner applications. For the purposes of the EU/UK
              General Data Protection Regulation, Zomareel is the controller of the
              personal data described here.
            </p>
            <p>
              Questions about this policy or your data can go to
              <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.
            </p>
          </section>

          <section id="what-we-collect">
            <h2>2. What we collect</h2>
            <p>We try to collect as little as the product can work with.</p>

            <h3>Account data</h3>
            <ul>
              <li><strong>Diners:</strong> your email address, an optional display name and a hashed password. We never store your password in plain text.</li>
              <li><strong>Food partners:</strong> your business name, email address and hashed password, plus a partner account identifier.</li>
            </ul>

            <h3>Activity data</h3>
            <ul>
              <li><strong>Likes:</strong> which reels a diner likes, so the heart stays filled when you come back.</li>
              <li><strong>Reel posts:</strong> the dish name, price, location, caption, media type, poster URL and the public media URL a partner submits.</li>
              <li><strong>Session data:</strong> a signed session token for diners kept in your browser's local storage, and a secure HttpOnly cookie for partner sessions.</li>
            </ul>

            <h3>Technical data</h3>
            <ul>
              <li>Server logs containing request paths, timestamps, response status and IP address, used for security and debugging.</li>
              <li>Aggregated analytics about page views and referral sources — only if you accept analytics.</li>
            </ul>

            <h3>What we do not collect</h3>
            <ul>
              <li>No payment card details. Zomareel does not process orders or payments.</li>
              <li>No precise location tracking. “Location” on a reel is the neighbourhood text a partner types in.</li>
              <li>No contact lists, address books, microphone or camera access.</li>
            </ul>
          </section>

          <section id="how-we-use-it">
            <h2>3. How we use it</h2>
            <ul>
              <li>To create and authenticate your account and keep you signed in.</li>
              <li>To publish partner reels in the diner feed and record likes.</li>
              <li>To protect the service: rate limiting, abuse prevention, debugging and security monitoring.</li>
              <li>To answer support requests and honour data rights requests.</li>
              <li>To understand, in aggregate, which pages and features are useful, if you consent to analytics.</li>
            </ul>
            <p>
              We do not use your data to build advertising profiles, and we do not
              make automated decisions that have a legal or similarly significant
              effect on you.
            </p>
          </section>

          <section id="legal-bases">
            <h2>4. Legal bases</h2>
            <p>Where GDPR applies, we rely on:</p>
            <ul>
              <li><strong>Contract</strong> — to provide the account, feed and reel posting you asked for.</li>
              <li><strong>Legitimate interests</strong> — to secure the service, prevent abuse and fix bugs, balanced against your rights.</li>
              <li><strong>Consent</strong> — for optional analytics cookies. You can withdraw consent at any time.</li>
              <li><strong>Legal obligation</strong> — where we must keep records or respond to lawful requests.</li>
            </ul>
          </section>

          <section id="cookies">
            <h2 id="analytics">5. Cookies and analytics</h2>
            <p>
              Zomareel uses the minimum storage needed to keep you signed in. Optional
              analytics is off until you accept it.
            </p>

            <div class="table-wrap">
              <table class="legal-table">
                <caption>Storage used by Zomareel</caption>
                <thead>
                  <tr><th scope="col">Name</th><th scope="col">Type</th><th scope="col">Purpose</th><th scope="col">Set when</th></tr>
                </thead>
                <tbody>
                  <tr><td>Partner session cookie</td><td>Essential cookie</td><td>Keeps a kitchen signed in. HttpOnly and unreadable by page scripts.</td><td>Partner signs in</td></tr>
                  <tr><td>zomareel.session</td><td>Essential local storage</td><td>Keeps a diner signed in on that device.</td><td>Diner signs in</td></tr>
                  <tr><td>zomareel.analytics-consent</td><td>Essential local storage</td><td>Remembers your analytics choice so we do not ask every visit.</td><td>You accept or decline</td></tr>
                  <tr><td>_ga, _ga_*</td><td>Analytics cookies</td><td>Google Analytics 4 measures aggregate page views and traffic sources. IP addresses are truncated by Google.</td><td>Only after you accept analytics</td></tr>
                </tbody>
              </table>
            </div>

            <p>
              Google Analytics is provided by Google Ireland Limited / Google LLC. We
              configure it with advertising features off and do not send names, email
              addresses or free-text captions to it. See Google's
              <a href="https://policies.google.com/privacy" rel="noopener noreferrer" target="_blank">privacy policy</a>
              for how Google handles analytics data.
            </p>
            <p>
              You can change your mind by clearing this site's storage in your browser
              settings. The consent banner will then appear again on your next visit.
              Declining does not limit any part of the feed or your account.
            </p>
          </section>

          <section id="sharing">
            <h2>6. Sharing</h2>
            <p>
              We do not sell personal information, and we do not share it for
              cross-context behavioural advertising. We share limited data with
              service providers who help us run Zomareel:
            </p>
            <ul>
              <li><strong>Hosting and database providers</strong> that store the application and its PostgreSQL database.</li>
              <li><strong>Google Analytics</strong>, only when you have accepted analytics.</li>
              <li><strong>Professional advisers and authorities</strong>, where required by law or to protect the rights and safety of users.</li>
            </ul>
            <p>
              Public partner content — dish name, price, location, caption and media
              URL — is visible to anyone using the feed by design. Do not put private
              information in a reel caption.
            </p>
          </section>

          <section id="retention">
            <h2>7. How long we keep it</h2>
            <ul>
              <li><strong>Account data:</strong> while your account is open, then deleted within 30 days of a verified deletion request.</li>
              <li><strong>Likes:</strong> while the account is open, or until you unlike the reel.</li>
              <li><strong>Reel posts:</strong> while the partner account is open, or until the reel is removed.</li>
              <li><strong>Server logs:</strong> up to 30 days, unless retained longer for an active security investigation.</li>
              <li><strong>Analytics:</strong> up to 14 months in Google Analytics, in aggregate.</li>
            </ul>
          </section>

          <section id="security">
            <h2>8. Security</h2>
            <p>
              Passwords are hashed before storage. Diner sessions use a signed token,
              and partner sessions use an HttpOnly cookie that page scripts cannot
              read. Access to the database is restricted to the application and
              authorised operators. Traffic is encrypted in transit when served over
              HTTPS.
            </p>
            <p>
              No service is perfectly secure. If you believe your account has been
              compromised, email us immediately and change your password from a device
              you trust.
            </p>
          </section>

          <section id="your-rights">
            <h2>9. Your rights</h2>
            <p>Depending on where you live, you may have the right to:</p>
            <ul>
              <li>Access the personal data we hold about you and receive a copy.</li>
              <li>Correct inaccurate details such as your name or email.</li>
              <li>Delete your account and the data attached to it.</li>
              <li>Restrict or object to certain processing, including direct marketing.</li>
              <li>Receive your data in a portable, machine-readable format.</li>
              <li>Withdraw analytics consent at any time.</li>
              <li>Complain to your local data protection authority.</li>
            </ul>
            <p>
              Email <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a> from the
              address on your account. We respond within 30 days and may ask for
              verification so we do not hand your data to someone else.
            </p>
            <p>
              California residents: we do not sell or share personal information as
              those terms are defined by the CCPA/CPRA. You will not be discriminated
              against for exercising a privacy right.
            </p>
          </section>

          <section id="children">
            <h2>10. Children</h2>
            <p>
              Zomareel is not intended for children under 16. We do not knowingly
              collect personal data from children. If you believe a child has created
              an account, contact us and we will delete it.
            </p>
          </section>

          <section id="transfers">
            <h2>11. International transfers</h2>
            <p>
              Our providers may process data in countries outside your own. Where data
              leaves the EEA or UK, we rely on appropriate safeguards such as Standard
              Contractual Clauses or an adequacy decision. Contact us if you want more
              detail about the safeguards for a specific provider.
            </p>
          </section>

          <section id="changes">
            <h2>12. Changes to this policy</h2>
            <p>
              If we materially change how we handle personal data, we will update this
              page and change the date at the top. Where the change is significant, we
              will also notify account holders by email or in the app before it takes
              effect.
            </p>
          </section>

          <section id="contact">
            <h2>13. Contact</h2>
            <p>
              Privacy questions and requests:
              <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.
              We aim to reply within five working days, and always within the period
              required by law.
            </p>
          </section>
        </article>
      </div>
    </section>
  `;

  return renderPage({
    req,
    res,
    pathname: "/privacy",
    title: "Privacy policy — how Zomareel handles your data",
    description:
      "What Zomareel collects, why, how long we keep it, and the choices you have. Plain-English privacy policy covering accounts, reels, cookies and analytics.",
    schemaType: "PrivacyPolicy",
    schemaName: "Zomareel privacy policy",
    pageNode: {
      datePublished: "2026-01-12",
      dateModified: "2026-11-09",
      inLanguage: "en",
    },
    breadcrumb: [
      { label: "Home", href: "/" },
      { label: "Privacy policy", href: "/privacy" },
    ],
    body,
  });
}
