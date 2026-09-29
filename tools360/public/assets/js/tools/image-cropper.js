/* Image cropper: crops to a chosen shape (aspect ratio), keeping the focus area you pick. */
import { createTool } from '../tool-core.js';
import { transformImage, extOf, MIME, baseName } from '../utils/image.js';

createTool({
  id: 'image-cropper', accept: ['.jpg', '.jpeg', '.png', '.webp'], multiple: true,
  async run(files, ctx) {
    const [a, b] = ctx.opt('ratio').value.split(':').map(Number);
    const pos = ctx.opt('position').value, results = [];
    const crop = (bw, bh) => {
      let sw = bw, sh = bw * b / a;
      if (sh > bh) { sh = bh; sw = bh * a / b; }
      let sx = (bw - sw) / 2, sy = (bh - sh) / 2;
      if (pos === 'top') sy = 0; else if (pos === 'bottom') sy = bh - sh;
      else if (pos === 'left') sx = 0; else if (pos === 'right') sx = bw - sw;
      return { sx, sy, sw, sh };
    };
    for (let i = 0; i < files.length; i++) {
      const ext = extOf(files[i].name);
      results.push({ name: baseName(files[i].name) + '-cropped.' + ext, blob: await transformImage(files[i], { type: MIME[ext], quality: 0.92, crop }) });
      ctx.progress(((i + 1) / files.length) * 100, 'Cropped ' + (i + 1) + ' of ' + files.length);
    }
    return results;
  }
});
