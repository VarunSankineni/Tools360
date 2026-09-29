/* Split PDF: by page ranges (1-3, 5) or every page as its own file. */
import { createTool } from '../tool-core.js';
import { UserError } from '../utils/errors.js';
import { loadPdfLib } from '../utils/libs.js';

const modeEl = document.getElementById('split-pdf-mode');
const rangesRow = document.getElementById('split-pdf-ranges-row');
modeEl.addEventListener('change', () => { rangesRow.hidden = modeEl.value === 'each'; });

function parseRanges(text, total) {
  const parts = text.split(',').map((s) => s.trim()).filter(Boolean);
  if (!parts.length) throw new UserError('Enter at least one page range, for example 1-3, 5.');
  return parts.map((part) => {
    const m = part.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!m) throw new UserError('"' + part + '" is not a valid range. Use numbers like 1-3 or 5.');
    const a = +m[1], b = m[2] ? +m[2] : a;
    if (a < 1 || b < a || b > total) throw new UserError('Range "' + part + '" is outside this document, which has ' + total + ' pages.');
    return [a, b];
  });
}

createTool({
  id: 'split-pdf', accept: ['.pdf'], multiple: false,
  async onFilesChange(files) {
    const { PDFDocument } = await loadPdfLib();
    const doc = await PDFDocument.load(await files[0].arrayBuffer());
    document.getElementById('split-pdf-info').textContent = 'This PDF has ' + doc.getPageCount() + ' pages.';
  },
  async run(files, ctx) {
    const { PDFDocument } = await loadPdfLib();
    const src = await PDFDocument.load(await files[0].arrayBuffer());
    const total = src.getPageCount();
    const ranges = modeEl.value === 'each'
      ? Array.from({ length: total }, (_, i) => [i + 1, i + 1])
      : parseRanges(ctx.opt('ranges').value, total);
    const base = files[0].name.replace(/\.pdf$/i, '');
    const results = [];
    for (let i = 0; i < ranges.length; i++) {
      const [a, b] = ranges[i];
      const out = await PDFDocument.create();
      const idx = []; for (let n = a - 1; n < b; n++) idx.push(n);
      (await out.copyPages(src, idx)).forEach((pg) => out.addPage(pg));
      results.push({ name: base + (a === b ? '-page-' + a : '-pages-' + a + '-' + b) + '.pdf', blob: new Blob([await out.save()], { type: 'application/pdf' }) });
      ctx.progress(((i + 1) / ranges.length) * 100, 'Creating file ' + (i + 1) + ' of ' + ranges.length);
    }
    return results;
  }
});
