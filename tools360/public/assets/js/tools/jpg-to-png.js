/* JPG to PNG: lossless PNG output. */
import { createTool } from '../tool-core.js';
import { transformImage, swapExt } from '../utils/image.js';

createTool({
  id: 'jpg-to-png', accept: ['.jpg', '.jpeg'], multiple: true,
  async run(files, ctx) {
    const results = [];
    for (let i = 0; i < files.length; i++) {
      results.push({ name: swapExt(files[i].name, 'png'), blob: await transformImage(files[i], { type: 'image/png' }) });
      ctx.progress(((i + 1) / files.length) * 100, 'Converted ' + (i + 1) + ' of ' + files.length);
    }
    return results;
  }
});
