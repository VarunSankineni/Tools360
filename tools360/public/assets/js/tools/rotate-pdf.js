/* Rotate PDF: turns every page by 90, 180 or 270 degrees. */
import { createTool } from '../tool-core.js';
import { loadPdfLib } from '../utils/libs.js';

createTool({
  id: 'rotate-pdf', accept: ['.pdf'], multiple: true,
  async run(files, ctx) {
    const { PDFDocument, degrees } = await loadPdfLib();
    const angle = +ctx.opt('angle').value;
    const results = [];
    for (let i = 0; i < files.length; i++) {
      const doc = await PDFDocument.load(await files[i].arrayBuffer());
      doc.getPages().forEach((pg) => pg.setRotation(degrees((pg.getRotation().angle + angle) % 360)));
      results.push({ name: files[i].name.replace(/\.pdf$/i, '') + '-rotated.pdf', blob: new Blob([await doc.save()], { type: 'application/pdf' }) });
      ctx.progress(((i + 1) / files.length) * 100, 'Rotated ' + (i + 1) + ' of ' + files.length);
    }
    return results;
  }
});
