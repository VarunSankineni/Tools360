/* Canvas helpers shared by all image tools. */
import { UserError } from './errors.js';

export const MIME = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
export const extOf = (name) => name.split('.').pop().toLowerCase();
export const swapExt = (name, ext) => name.replace(/\.[^.]+$/, '') + '.' + ext;
export const baseName = (name) => name.replace(/\.[^.]+$/, '');

export function makeCanvas(w, h, bg) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const x = c.getContext('2d');
  if (bg) { x.fillStyle = bg; x.fillRect(0, 0, w, h); }
  return [c, x];
}

export function toBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => {
      if (!b) return reject(new UserError('Your browser could not create that image. Try a smaller image.'));
      if (type !== 'image/png' && b.type !== type) return reject(new UserError('Your browser cannot create this format. Try Chrome, Edge or Firefox.'));
      resolve(b);
    }, type, quality);
  });
}

/* Decode an image, optionally crop/resize, and re-encode it.
   opts: type, quality, width, height, keepAspect, maxWidth, crop(bw,bh)->{sx,sy,sw,sh} */
export async function transformImage(file, opts) {
  let bmp;
  try { bmp = await createImageBitmap(file); }
  catch (e) { throw new UserError('"' + file.name + '" could not be read as an image. It may be damaged.'); }
  let src = { sx: 0, sy: 0, sw: bmp.width, sh: bmp.height };
  if (opts.crop) src = opts.crop(bmp.width, bmp.height);
  let tw = opts.width || 0, th = opts.height || 0;
  if (!tw && !th) { tw = src.sw; th = src.sh; }
  else if (opts.keepAspect !== false) {
    if (tw && th) { const s = Math.min(tw / src.sw, th / src.sh); tw = src.sw * s; th = src.sh * s; }
    else if (tw) th = src.sh * tw / src.sw;
    else tw = src.sw * th / src.sh;
  } else { tw = tw || src.sw; th = th || src.sh; }
  if (opts.maxWidth && tw > opts.maxWidth) { th = th * opts.maxWidth / tw; tw = opts.maxWidth; }
  tw = Math.max(1, Math.round(tw)); th = Math.max(1, Math.round(th));
  const [c, x] = makeCanvas(tw, th, opts.type === 'image/jpeg' ? '#ffffff' : null);
  x.imageSmoothingQuality = 'high';
  x.drawImage(bmp, src.sx, src.sy, src.sw, src.sh, 0, 0, tw, th);
  bmp.close();
  const blob = await toBlob(c, opts.type, opts.quality);
  c.width = c.height = 0;
  return blob;
}
