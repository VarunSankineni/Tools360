/* Contact form. Uses the backend when API_BASE is set, otherwise opens the visitor's email app. */
import { CONFIG } from './config.js';

const form = document.getElementById('contact-form');
const status = document.getElementById('contact-status');
const btn = document.getElementById('contact-submit-btn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    name: document.getElementById('contact-name').value.trim(),
    email: document.getElementById('contact-email').value.trim(),
    message: document.getElementById('contact-message').value.trim(),
    website: document.getElementById('contact-website').value
  };
  if (!CONFIG.API_BASE) {
    const body = encodeURIComponent(data.message + '\n\n' + data.name + ' (' + data.email + ')');
    window.location.href = 'mailto:' + CONFIG.CONTACT_EMAIL + '?subject=' + encodeURIComponent('Message from ' + CONFIG.SITE_NAME) + '&body=' + body;
    status.textContent = 'Opening your email app…';
    return;
  }
  btn.disabled = true; status.textContent = 'Sending…';
  try {
    const r = await fetch(CONFIG.API_BASE + '/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!r.ok) throw new Error('bad status');
    status.textContent = 'Thanks! We received your message and will reply by email.';
    form.reset();
  } catch (err) {
    status.textContent = 'We could not send your message. Please email ' + CONFIG.CONTACT_EMAIL + ' instead.';
  } finally { btn.disabled = false; }
});
