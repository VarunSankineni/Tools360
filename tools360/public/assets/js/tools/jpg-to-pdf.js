/* JPG to PDF: one image per page, in the order shown. */
import { createTool } from '../tool-core.js';
import { UserError } from '../utils/errors.js';
import { loadPdfLib } from '../utils/libs.js';
import { makeCanvas, toBlob } from '../utils/image.js';

createTool({
  id: 'jpg-to-pdf', accept: ['.jpg', '.jpeg', '.png', '.webp'], multiple: true, sortable: true,
  async run(files, ctx) {
    const { PDFDocument } = await loadPdfLib();
    const out = await PDFDocument.create();
    const mode = ctx.opt('size').value;
    for (let i = 0; i < files.length; i++) {
      let bmp;
      try { bmp = await createImageBitmap(files[i]); } catch (e) { throw new UserError('"' + files[i].name + '" could not be read as an image.'); }
      const [canvas, c] = makeCanvas(bmp.width, bmp.height, '#fff');
      c.drawImage(bmp, 0, 0); bmp.close();
      const img = await out.embedJpg(await (await toBlob(canvas, 'image/jpeg', 0.92)).arrayBuffer());
      if (mode === 'fit') {
        out.addPage([img.width, img.height]).drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
      } else {
        const land = img.width > img.height, pw = land ? 841.89 : 595.28, ph = land ? 595.28 : 841.89, m = 28;
        const s = Math.min((pw - 2 * m) / img.width, (ph - 2 * m) / img.height);
        const w = img.width * s, h = img.height * s;
        out.addPage([pw, ph]).drawImage(img, { x: (pw - w) / 2, y: (ph - h) / 2, width: w, height: h });
      }
      canvas.width = canvas.height = 0;
      ctx.progress(((i + 1) / files.length) * 100, 'Added image ' + (i + 1) + ' of ' + files.length);
    }
    return [{ name: 'images.pdf', blob: new Blob([await out.save()], { type: 'application/pdf' }) }];
  }
});
