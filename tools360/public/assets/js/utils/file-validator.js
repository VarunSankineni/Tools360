/* Checks file type (by extension), emptiness and size. Returns {ok, errors}. */
export function validateFiles(files, { accept, maxMB }) {
  const ok = [], errors = [], max = maxMB * 1024 * 1024;
  for (const f of files) {
    const ext = '.' + f.name.split('.').pop().toLowerCase();
    if (!accept.includes(ext)) { errors.push('"' + f.name + '" is not a supported file type.'); continue; }
    if (f.size === 0) { errors.push('"' + f.name + '" is empty.'); continue; }
    if (f.size > max) { errors.push('"' + f.name + '" is larger than ' + maxMB + ' MB.'); continue; }
    ok.push(f);
  }
  return { ok, errors };
}
