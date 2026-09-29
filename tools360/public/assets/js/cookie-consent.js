/* Cookie banner. Ids: cookie-banner, cookie-accept-btn, cookie-reject-btn, cookie-settings-link. */
import { initAnalytics } from './analytics.js';
const KEY = 'tools360-consent';

function save(analytics) {
  try { localStorage.setItem(KEY, JSON.stringify({ analytics, at: Date.now() })); } catch (e) {}
  const b = document.getElementById('cookie-banner');
  if (b) b.remove();
  initAnalytics();
}

function show() {
  const old = document.getElementById('cookie-banner');
  if (old) old.remove();
  const root = document.body.dataset.root || '';
  const b = document.createElement('div');
  b.id = 'cookie-banner';
  b.setAttribute('role', 'dialog');
  b.setAttribute('aria-label', 'Cookie preferences');
  b.innerHTML =
    '<p>We store your theme choice so the site looks right. With your OK, we also count which tools are used, anonymously. <a href="' + root + 'pages/cookies.html">Details</a></p>' +
    '<div class="cookie-actions"><button type="button" class="btn btn-ghost small" id="cookie-reject-btn">Essential only</button>' +
    '<button type="button" class="btn btn-primary small" id="cookie-accept-btn">Accept analytics</button></div>';
  document.body.appendChild(b);
  document.getElementById('cookie-accept-btn').addEventListener('click', () => save(true));
  document.getElementById('cookie-reject-btn').addEventListener('click', () => save(false));
}

export function initConsent() {
  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (saved) initAnalytics(); else show();
  const link = document.getElementById('cookie-settings-link');
  if (link) link.addEventListener('click', (e) => { e.preventDefault(); show(); });
}
