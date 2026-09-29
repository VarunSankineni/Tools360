/* Runs in <head> before paint so the page never flashes the wrong theme. */
(function () {
  var t = null;
  try { t = localStorage.getItem('tools360-theme'); } catch (e) {}
  if (!t) t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', t);
})();
