/* Loads third-party libraries only on the pages that need them (all MIT/Apache-2.0). */
import { UserError } from './errors.js';

export const LIBS = {
  pdfLib: 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js',
  pdfjs: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  pdfjsWorker: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  jszip: 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
  qrcode: 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
};

const cache = {};
export function loadScript(src) {
  if (cache[src]) return cache[src];
  cache[src] = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = () => { delete cache[src]; reject(new UserError('A required component could not load. Check your internet connection and try again.')); };
    document.head.appendChild(s);
  });
  return cache[src];
}

export async function loadPdfLib() { await loadScript(LIBS.pdfLib); return window.PDFLib; }
export async function loadPdfJs() {
  await loadScript(LIBS.pdfjs);
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = LIBS.pdfjsWorker;
  return window.pdfjsLib;
}
