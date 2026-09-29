/* PNG to JPG: transparent areas become white. */
import { createTool } from '../tool-core.js';
import { transformImage, swapExt } from '../utils/image.js';

createTool({
  id: 'png-to-jpg', accept: ['.png'], multiple: true,
  async run(files, ctx) {
    const q = +ctx.opt('quality').value / 100, results = [];
    for (let i = 0; i < files.length; i++) {
      results.push({ name: swapExt(files[i].name, 'jpg'), blob: await transformImage(files[i], { type: 'image/jpeg', quality: q }) });
      ctx.progress(((i + 1) / files.length) * 100, 'Converted ' + (i + 1) + ' of ' + files.length);
    }
    return results;
  }
});
