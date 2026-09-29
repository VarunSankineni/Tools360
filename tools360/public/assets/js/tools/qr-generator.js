/* QR code generator: no file needed, works from text or a link. */
import { createTool } from '../tool-core.js';
import { UserError } from '../utils/errors.js';
import { loadScript, LIBS } from '../utils/libs.js';
import { toBlob } from '../utils/image.js';

createTool({
  id: 'qr-generator', noFiles: true, accept: [], multiple: false,
  async run(_files, ctx) {
    const text = ctx.opt('text').value.trim();
    if (!text) throw new UserError('Type a link or some text first.');
    if (text.length > 1000) throw new UserError('That text is too long for a QR code. Keep it under 1000 characters.');
    await loadScript(LIBS.qrcode);
    const size = +ctx.opt('size').value;
    const holder = document.createElement('div');
    new window.QRCode(holder, { text, width: size, height: size, colorDark: ctx.opt('fg').value, colorLight: ctx.opt('bg').value, correctLevel: window.QRCode.CorrectLevel.M });
    const canvas = holder.querySelector('canvas');
    if (!canvas) throw new UserError('Could not create the QR code in this browser.');
    return [{ name: 'qr-code.png', blob: await toBlob(canvas, 'image/png') }];
  }
});
