/* Merge PDF: combines several PDFs into one, in the order shown. */
import { createTool } from '../tool-core.js';
import { loadPdfLib } from '../utils/libs.js';

createTool({
  id: 'merge-pdf', accept: ['.pdf'], multiple: true, minFiles: 2, sortable: true,
  async run(files, ctx) {
    const { PDFDocument } = await loadPdfLib();
    const out = await PDFDocument.create();
    for (let i = 0; i < files.length; i++) {
      const src = await PDFDocument.load(await files[i].arrayBuffer());
      (await out.copyPages(src, src.getPageIndices())).forEach((pg) => out.addPage(pg));
      ctx.progress(((i + 1) / files.length) * 100, 'Merged ' + (i + 1) + ' of ' + files.length);
    }
    return [{ name: 'merged.pdf', blob: new Blob([await out.save()], { type: 'application/pdf' }) }];
  }
});
