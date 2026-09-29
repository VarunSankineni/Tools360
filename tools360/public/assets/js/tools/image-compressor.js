/* Image compressor: lower quality, optional max width, optional WebP output. */
import { createTool } from '../tool-core.js';
import { transformImage, swapExt, extOf, MIME } from '../utils/image.js';
import { formatSize } from '../utils/format-size.js';

createTool({
  id: 'image-compressor', accept: ['.jpg', '.jpeg', '.png', '.webp'], multiple: true,
  async run(files, ctx) {
    const q = +ctx.opt('quality').value / 100;
    const keep = ctx.opt('format').value === 'keep';
    const maxWidth = +ctx.opt('maxwidth').value || 0;
    const results = []; let before = 0, after = 0;
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const type = keep ? MIME[extOf(f.name)] : 'image/webp';
      const blob = await transformImage(f, { type, quality: q, maxWidth });
      before += f.size;
      if (blob.size >= f.size && !maxWidth && keep) { after += f.size; results.push({ name: f.name, blob: f }); }
      else { after += blob.size; results.push({ name: keep ? f.name : swapExt(f.name, 'webp'), blob }); }
      ctx.progress(((i + 1) / files.length) * 100, 'Compressed ' + (i + 1) + ' of ' + files.length);
    }
    const saved = Math.max(0, Math.round((1 - after / before) * 100));
    return { results, note: formatSize(before) + ' \u2192 ' + formatSize(after) + ' (' + saved + '% smaller). Images that could not shrink are returned unchanged.' };
  }
});
