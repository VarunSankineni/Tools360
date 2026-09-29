/* Image to Base64: gives you a text string you can paste into HTML, CSS or JSON. */
import { createTool } from '../tool-core.js';
import { UserError } from '../utils/errors.js';

const readDataUrl = (f) => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(r.result);
  r.onerror = () => rej(new UserError('"' + f.name + '" could not be read.'));
  r.readAsDataURL(f);
});

createTool({
  id: 'image-to-base64', accept: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'], multiple: true, maxMB: 10,
  async run(files, ctx) {
    const withPrefix = ctx.opt('prefix').checked, results = [];
    for (let i = 0; i < files.length; i++) {
      const url = await readDataUrl(files[i]);
      results.push({ name: files[i].name, text: withPrefix ? url : url.split(',')[1] });
      ctx.progress(((i + 1) / files.length) * 100, 'Encoded ' + (i + 1) + ' of ' + files.length);
    }
    return results;
  }
});
