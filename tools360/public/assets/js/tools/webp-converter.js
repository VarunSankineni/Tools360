/* WebP converter: WebP, JPG and PNG in any direction. */
import { createTool } from '../tool-core.js';
import { transformImage, swapExt, MIME } from '../utils/image.js';

createTool({
  id: 'webp-converter', accept: ['.webp', '.jpg', '.jpeg', '.png'], multiple: true,
  async run(files, ctx) {
    const fmt = ctx.opt('format').value, q = +ctx.opt('quality').value / 100, results = [];
    for (let i = 0; i < files.length; i++) {
      results.push({ name: swapExt(files[i].name, fmt), blob: await transformImage(files[i], { type: MIME[fmt], quality: q }) });
      ctx.progress(((i + 1) / files.length) * 100, 'Converted ' + (i + 1) + ' of ' + files.length);
    }
    return results;
  }
});
