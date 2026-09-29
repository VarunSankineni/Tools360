/* Loaded on every page. Home page: search and category filter. */
import './ui.js';
import { initConsent } from './cookie-consent.js';

initConsent();

const grid = document.getElementById('tool-grid');
if (grid) {
  const tiles = Array.from(grid.querySelectorAll('.tool-tile'));
  const chips = Array.from(document.querySelectorAll('#category-chips .chip'));
  const input = document.getElementById('tool-search-input');
  const empty = document.getElementById('tool-empty-msg');
  let cat = 'all';

  const apply = () => {
    const q = input.value.trim().toLowerCase();
    let shown = 0;
    tiles.forEach((t) => {
      const ok = (cat === 'all' || t.dataset.cat === cat) && (!q || t.dataset.search.includes(q));
      t.hidden = !ok;
      if (ok) shown++;
    });
    empty.hidden = shown > 0;
  };
  chips.forEach((c) => c.addEventListener('click', () => {
    cat = c.dataset.cat;
    chips.forEach((x) => x.setAttribute('aria-pressed', String(x === c)));
    apply();
  }));
  input.addEventListener('input', apply);
}

if (document.getElementById('contact-form')) import('./contact.js');
