/* Image resizer: set width and/or height in pixels. */
import { createTool } from '../tool-core.js';
import { UserError } from '../utils/errors.js';
import { transformImage, extOf, MIME, baseName } from '../utils/image.js';

createTool({
  id: 'image-resizer', accept: ['.jpg', '.jpeg', '.png', '.webp'], multiple: true,
  async run(files, ctx) {
    const width = +ctx.opt('width').value || 0, height = +ctx.opt('height').value || 0;
    if (!width && !height) throw new UserError('Enter a width, a height, or both.');
    if (width > 10000 || height > 10000) throw new UserError('Maximum size is 10,000 pixels per side.');
    const keepAspect = ctx.opt('keep').checked, results = [];
    for (let i = 0; i < files.length; i++) {
      const ext = extOf(files[i].name);
      const blob = await transformImage(files[i], { type: MIME[ext], quality: 0.92, width, height, keepAspect });
      results.push({ name: baseName(files[i].name) + '-resized.' + ext, blob });
      ctx.progress(((i + 1) / files.length) * 100, 'Resized ' + (i + 1) + ' of ' + files.length);
    }
    return results;
  }
});
