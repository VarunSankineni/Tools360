/* Consent-aware analytics. Nothing is sent until the visitor accepts. */
import { CONFIG } from './config.js';

export function hasConsent() {
  try { return JSON.parse(localStorage.getItem('tools360-consent') || '{}').analytics === true; }
  catch (e) { return false; }
}

export function initAnalytics() {
  if (!hasConsent() || !CONFIG.GA_ID || document.getElementById('ga-script')) return;
  const s = document.createElement('script');
  s.id = 'ga-script'; s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(CONFIG.GA_ID);
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', CONFIG.GA_ID, { anonymize_ip: true });
}

function post(path, body) {
  if (!CONFIG.API_BASE) return;
  fetch(CONFIG.API_BASE + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).catch(() => {});
}

/* Anonymous usage count: tool name only, no file data. */
export function trackUsage(tool) { if (hasConsent()) post('/api/stats', { tool }); }
export function sendFeedback(tool, helpful) { post('/api/feedback', { tool, helpful }); }
