/* Drag-and-drop plus click-to-choose, keyboard accessible. */
export function initDropzone({ zone, input, button, onFiles }) {
  const open = () => input.click();
  button.addEventListener('click', (e) => { e.stopPropagation(); open(); });
  zone.addEventListener('click', open);
  zone.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  ['dragenter', 'dragover'].forEach((t) => zone.addEventListener(t, (e) => { e.preventDefault(); zone.classList.add('is-over'); }));
  ['dragleave', 'drop'].forEach((t) => zone.addEventListener(t, (e) => { e.preventDefault(); zone.classList.remove('is-over'); }));
  zone.addEventListener('drop', (e) => onFiles(Array.from(e.dataTransfer.files)));
  input.addEventListener('change', () => { onFiles(Array.from(input.files)); input.value = ''; });
}
