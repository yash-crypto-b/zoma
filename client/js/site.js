const config = window.ZOMA_CONFIG || {};
const consent = document.getElementById('consent');
const consentKey = config.consentKey || 'zomareel.analytics-consent';

function applyConsent(choice) {
  if (consent) consent.hidden = true;
  if (choice !== 'granted' || !config.gaId) return;
  window.gtag?.('consent', 'update', { analytics_storage: 'granted' });
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.gaId)}`;
  document.head.append(script);
  window.gtag?.('js', new Date());
  window.gtag?.('config', config.gaId);
}

let choice;
try { choice = localStorage.getItem(consentKey); } catch {}
if (choice) applyConsent(choice);
else if (consent) consent.hidden = false;

document.querySelectorAll('[data-consent]').forEach(button => {
  button.addEventListener('click', () => {
    const choice = button.dataset.consent;
    try { localStorage.setItem(consentKey, choice); } catch {}
    applyConsent(choice);
  });
});

const toggle = document.getElementById('nav-toggle');
toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  document.getElementById('site-header')?.classList.toggle('nav-open', open);
});
