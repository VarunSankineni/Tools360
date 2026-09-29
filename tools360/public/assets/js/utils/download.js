/* Saving files from the browser. */
import { loadScript, LIBS } from './libs.js';

export function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export async function downloadZip(items, zipName = 'tools360-files.zip') {
  await loadScript(LIBS.jszip);
  const zip = new window.JSZip();
  items.forEach((i) => zip.file(i.name, i.blob));
  downloadBlob(await zip.generateAsync({ type: 'blob' }), zipName);
}
