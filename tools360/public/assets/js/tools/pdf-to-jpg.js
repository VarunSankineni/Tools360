/* PDF to JPG: each page becomes one JPG image. */
import { createTool } from '../tool-core.js';
import { loadPdfJs } from '../utils/libs.js';
import { toBlob, baseName } from '../utils/image.js';

createTool({
  id: 'pdf-to-jpg', accept: ['.pdf'], multiple: false,
  async run(files, ctx) {
    const pdfjs = await loadPdfJs();
    const scale = +ctx.opt('quality').value;
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(await files[0].arrayBuffer()) }).promise;
    const base = baseName(files[0].name), results = [];
    for (let n = 1; n <= pdf.numPages; n++) {
      const page = await pdf.getPage(n);
      const vp = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(vp.width); canvas.height = Math.ceil(vp.height);
      const c = canvas.getContext('2d'); c.fillStyle = '#fff'; c.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: c, viewport: vp }).promise;
      results.push({ name: base + '-page-' + n + '.jpg', blob: await toBlob(canvas, 'image/jpeg', 0.92) });
      canvas.width = canvas.height = 0;
      ctx.progress((n / pdf.numPages) * 100, 'Page ' + n + ' of ' + pdf.numPages);
    }
    return results;
  }
});
