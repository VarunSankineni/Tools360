/* Shared interface behavior: mobile menu, theme toggle, footer year. */
const nav = document.getElementById('site-nav');
const navBtn = document.getElementById('nav-toggle-btn');
if (nav && navBtn) {
  navBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    navBtn.setAttribute('aria-expanded', String(open));
    navBtn.textContent = open ? 'Close' : 'Menu';
  });
}

const themeBtn = document.getElementById('theme-toggle-btn');
if (themeBtn) {
  const sync = () => {
    const dark = document.documentElement.dataset.theme === 'dark';
    themeBtn.setAttribute('aria-pressed', String(dark));
    themeBtn.textContent = dark ? 'Light' : 'Dark';
  };
  sync();
  themeBtn.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('tools360-theme', next); } catch (e) {}
    sync();
  });
}

const year = document.getElementById('footer-year');
if (year) year.textContent = new Date().getFullYear();
