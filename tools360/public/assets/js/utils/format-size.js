/* 1536 -> "1.50 KB" */
export function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  const units = ['KB', 'MB', 'GB'];
  let i = -1;
  do { bytes /= 1024; i++; } while (bytes >= 1024 && i < units.length - 1);
  return bytes.toFixed(bytes < 10 ? 2 : 1) + ' ' + units[i];
}
