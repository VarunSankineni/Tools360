/* Compress PDF: re-renders each page as a JPEG and rebuilds the PDF. Best for scans and photos. */
import { createTool } from '../tool-core.js';
import { loadPdfLib, loadPdfJs } from '../utils/libs.js';
import { toBlob } from '../utils/image.js';
import { formatSize } from '../utils/format-size.js';

const PRESETS = { best: { scale: 2, q: 0.85 }, balanced: { scale: 1.5, q: 0.7 }, small: { scale: 1.1, q: 0.5 } };

createTool({
  id: 'compress-pdf', accept: ['.pdf'], multiple: true,
  async run(files, ctx) {
    const pdfjs = await loadPdfJs();
    const { PDFDocument } = await loadPdfLib();
    const preset = PRESETS[ctx.opt('quality').value];
    const results = []; let before = 0, after = 0;
    for (let f = 0; f < files.length; f++) {
      const file = files[f];
      const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
      const out = await PDFDocument.create();
      for (let n = 1; n <= pdf.numPages; n++) {
        const page = await pdf.getPage(n);
        const base = page.getViewport({ scale: 1 });
        const vp = page.getViewport({ scale: preset.scale });
        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(vp.width); canvas.height = Math.ceil(vp.height);
        const c = canvas.getContext('2d'); c.fillStyle = '#fff'; c.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: c, viewport: vp }).promise;
        const jpg = await toBlob(canvas, 'image/jpeg', preset.q);
        const img = await out.embedJpg(await jpg.arrayBuffer());
        out.addPage([base.width, base.height]).drawImage(img, { x: 0, y: 0, width: base.width, height: base.height });
        canvas.width = canvas.height = 0;
        ctx.progress(((f + n / pdf.numPages) / files.length) * 100, 'File ' + (f + 1) + ' of ' + files.length + ', page ' + n + ' of ' + pdf.numPages);
      }
      const bytes = await out.save();
      before += file.size;
      if (bytes.length < file.size) {
        after += bytes.length;
        results.push({ name: file.name.replace(/\.pdf$/i, '') + '-compressed.pdf', blob: new Blob([bytes], { type: 'application/pdf' }) });
      } else { after += file.size; results.push({ name: file.name, blob: file }); }
    }
    const saved = Math.max(0, Math.round((1 - after / before) * 100));
    return { results, note: formatSize(before) + ' \u2192 ' + formatSize(after) + ' (' + saved + '% smaller). Files that could not be made smaller are returned unchanged.' };
  }
});
