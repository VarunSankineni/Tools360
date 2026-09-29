/* tool-core.js: the engine behind every tool page.
   A tool page calls createTool({...}) with its id, accepted types and a run() function.
   Element ids follow the pattern "<tool-id>-<part>", for example merge-pdf-dropzone. */
import { validateFiles } from './utils/file-validator.js';
import { formatSize } from './utils/format-size.js';
import { downloadBlob, downloadZip } from './utils/download.js';
import { initDropzone } from './utils/dropzone.js';
import { UserError } from './utils/errors.js';
import { trackUsage, sendFeedback } from './analytics.js';

export { UserError };

function friendly(e) {
  if (e instanceof UserError) return e.message;
  const m = String((e && e.message) || '').toLowerCase();
  if (m.includes('encrypt') || m.includes('password')) return 'This file is password-protected. Remove the password, then try again.';
  return 'Something went wrong while processing your file. It may be damaged or too large for this device. Try another file.';
}

function uniqueNames(items) {
  const seen = {};
  return items.map((it) => {
    const n = it.name; seen[n] = (seen[n] || 0) + 1;
    if (seen[n] > 1) { const i = n.lastIndexOf('.'); it = { ...it, name: i > 0 ? n.slice(0, i) + '-' + seen[n] + n.slice(i) : n + '-' + seen[n] }; }
    return it;
  });
}

function mk(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; }

export function createTool(cfg) {
  const p = cfg.id;
  const $ = (s) => document.getElementById(p + '-' + s);
  const maxMB = cfg.maxMB || 50;
  const minFiles = cfg.minFiles || 1;
  const el = { list: $('file-list'), err: $('error-msg'), opts: $('options'), start: $('start-btn'), reset: $('reset-btn'), prog: $('progress'), track: $('progress-track'), bar: $('progress-bar'), ptext: $('progress-text'), res: $('result') };
  let files = [], busy = false, urls = [];

  const showError = (m) => { el.err.textContent = m; el.err.hidden = !m; };
  const setProgress = (pct, text) => {
    el.prog.hidden = false;
    const v = Math.max(2, Math.min(100, Math.round(pct)));
    el.bar.style.width = v + '%';
    el.track.setAttribute('aria-valuenow', String(v));
    el.ptext.textContent = text || '';
  };
  const clearResult = () => { urls.forEach((u) => URL.revokeObjectURL(u)); urls = []; el.res.hidden = true; el.res.innerHTML = ''; };

  function button(id, label, cls, fn) { const b = mk('button', cls, label); b.type = 'button'; b.id = id; b.addEventListener('click', fn); return b; }
  function iconBtn(id, label, text, enabled, fn) { const b = mk('button', 'icon-btn small', text); b.type = 'button'; b.id = id; b.disabled = !enabled; b.setAttribute('aria-label', label); b.addEventListener('click', fn); return b; }

  function move(i, d) { const j = i + d; [files[i], files[j]] = [files[j], files[i]]; renderList(); }
  function removeAt(i) { files.splice(i, 1); clearResult(); renderList(); if (cfg.onFilesChange && files.length) cfg.onFilesChange(files); }

  function renderList() {
    if (el.list) {
      el.list.innerHTML = '';
      files.forEach((f, i) => {
        const li = mk('li', 'file-item'); li.id = p + '-file-' + i;
        li.append(mk('span', 'file-name', f.name), mk('span', 'file-size', formatSize(f.size)));
        const act = mk('span', 'file-actions');
        if (cfg.sortable && files.length > 1) {
          act.append(iconBtn(p + '-up-' + i, 'Move ' + f.name + ' up', '\u2191', i > 0, () => move(i, -1)),
                     iconBtn(p + '-down-' + i, 'Move ' + f.name + ' down', '\u2193', i < files.length - 1, () => move(i, 1)));
        }
        act.append(iconBtn(p + '-remove-' + i, 'Remove ' + f.name, '\u2715', true, () => removeAt(i)));
        li.append(act); el.list.append(li);
      });
    }
    el.start.disabled = busy || !(cfg.noFiles || files.length >= minFiles);
    if (el.opts) el.opts.hidden = !cfg.noFiles && files.length === 0;
  }

  async function addFiles(list) {
    showError(''); clearResult();
    const { ok, errors } = validateFiles(list, { accept: cfg.accept, maxMB });
    if (errors.length) showError(errors.join(' '));
    if (!ok.length) return;
    files = cfg.multiple ? files.concat(ok) : [ok[0]];
    renderList();
    if (cfg.onFilesChange) { try { await cfg.onFilesChange(files); } catch (e) { showError(friendly(e)); } }
  }

  function resultItem(it, i, single) {
    const li = mk('li', 'result-item'); li.id = p + '-result-' + i;
    if (it.blob && it.blob.type.startsWith('image/') && it.blob.size < 20e6) {
      const img = mk('img', 'result-thumb'); const u = URL.createObjectURL(it.blob); urls.push(u); img.src = u; img.alt = ''; li.append(img);
    }
    const info = mk('div', 'result-info');
    info.append(mk('strong', '', it.name), mk('span', '', formatSize(it.blob ? it.blob.size : new Blob([it.text]).size)));
    li.append(info);
    if (it.text !== undefined) {
      li.append(button(p + '-copy-' + i, 'Copy', 'btn btn-ghost small', async () => {
        try { await navigator.clipboard.writeText(it.text); } catch (e) { ta.select(); document.execCommand('copy'); }
        li.querySelector('#' + p + '-copy-' + i).textContent = 'Copied';
      }));
      li.append(button(p + '-save-' + i, 'Download .txt', single ? 'btn btn-cta' : 'btn btn-primary small', () => downloadBlob(new Blob([it.text], { type: 'text/plain' }), it.name + '.txt')));
      var ta = mk('textarea', 'result-text'); ta.id = p + '-result-text-' + i; ta.readOnly = true; ta.value = it.text; li.append(ta);
    } else {
      li.append(button(p + '-download-' + i, 'Download', single ? 'btn btn-cta' : 'btn btn-primary small', () => downloadBlob(it.blob, it.name)));
    }
    return li;
  }

  function feedback() {
    const d = mk('div', 'feedback'); d.id = p + '-feedback'; d.append('Was this helpful?');
    [['yes', 'Yes', true], ['no', 'No', false]].forEach(([k, l, v]) => d.append(button(p + '-feedback-' + k, l, 'btn btn-ghost small', () => { sendFeedback(p, v); d.textContent = 'Thanks for the feedback!'; })));
    return d;
  }

  function showResults(items, note) {
    clearResult();
    el.res.append(mk('h2', '', items.length > 1 ? 'Done! ' + items.length + ' files are ready' : 'Done! Your file is ready'));
    el.res.querySelector('h2').id = p + '-result-title';
    if (note) { const n = mk('p', 'result-note', note); n.id = p + '-result-note'; el.res.append(n); }
    const ul = mk('ul', 'result-list'); ul.id = p + '-result-list';
    items.forEach((it, i) => ul.append(resultItem(it, i, items.length === 1)));
    el.res.append(ul);
    const blobs = items.filter((i) => i.blob);
    if (blobs.length > 1) {
      const wrap = mk('div', 'result-actions');
      wrap.append(button(p + '-download-all-btn', 'Download all (ZIP)', 'btn btn-cta', async () => { try { await downloadZip(blobs); } catch (e) { showError(friendly(e)); } }));
      el.res.append(wrap);
    }
    el.res.append(feedback());
    el.res.hidden = false;
    el.res.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  async function start() {
    if (busy) return;
    showError(''); clearResult();
    if (!cfg.noFiles && files.length < minFiles) { showError('Add at least ' + minFiles + ' file' + (minFiles > 1 ? 's' : '') + ' first.'); return; }
    busy = true; el.start.disabled = true; el.start.classList.add('is-busy'); setProgress(2, 'Starting…');
    try {
      const out = await cfg.run(files, { progress: setProgress, opt: (n) => $(n) });
      const results = Array.isArray(out) ? out : out.results;
      showResults(uniqueNames(results), Array.isArray(out) ? '' : out.note || '');
      trackUsage(p);
    } catch (e) { console.error(e); showError(friendly(e)); }
    finally { busy = false; el.prog.hidden = true; el.start.classList.remove('is-busy'); renderList(); }
  }

  function reset() { files = []; clearResult(); showError(''); el.prog.hidden = true; renderList(); if (cfg.onReset) cfg.onReset(); }

  if (!cfg.noFiles) initDropzone({ zone: $('dropzone'), input: $('file-input'), button: $('choose-btn'), onFiles: addFiles });
  el.start.addEventListener('click', start);
  el.reset.addEventListener('click', reset);
  if (el.opts) el.opts.querySelectorAll('input[type=range]').forEach((r) => {
    const out = document.getElementById(r.id + '-value');
    if (out) { const upd = () => { out.textContent = r.value + '%'; }; r.addEventListener('input', upd); upd(); }
  });
  renderList();
}
