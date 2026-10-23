// Number, date and size formatting. All dates are formatted in UTC so the snapshot dates never shift with the viewer's time zone.
const NUM = new Intl.NumberFormat('en-US');
export const fmtNum = (n) => (Number.isFinite(n) ? NUM.format(n) : '-');

// 12345 -> 12.3k, 1200000 -> 1.2M (one decimal below 100k/100M, none above)
export function fmtCompact(n) {
  if (!Number.isFinite(n)) return '-';
  const abs = Math.abs(n);
  const unit = (v, s) => (v >= 100 ? Math.round(v) : Math.round(v * 10) / 10) + s;
  if (abs < 1000) return String(n);
  if (abs < 1e6) return unit(n / 1e3, 'k');
  return unit(n / 1e6, 'M');
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// "2026-09" -> "Sep 2026"
export function fmtMonth(ym) {
  const m = /^(\d{4})-(\d{2})/.exec(ym || '');
  if (!m || +m[2] < 1 || +m[2] > 12) return '';
  return `${MONTHS[+m[2] - 1]} ${m[1]}`;
}
// ISO timestamp -> "12 Mar 2023"
export function fmtDate(iso) {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return '';
  const d = new Date(t);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
// size in KB (GitHub's repo size) -> "820 KB", "1.4 MB", "2.1 GB"
export function fmtSize(kb) {
  if (!Number.isFinite(kb) || kb < 0) return '';
  if (kb < 1024) return `${Math.round(kb)} KB`;
  if (kb < 1024 * 1024) return `${(kb / 1024).toFixed(kb < 10240 ? 1 : 0)} MB`;
  return `${(kb / 1048576).toFixed(1)} GB`;
}
// calendar months between creation and the snapshot, as "6 years", "3y 2m" or "5 months"
export function fmtAge(createdIso, snapshotIso) {
  const a = Date.parse(createdIso), b = Date.parse(snapshotIso);
  if (!Number.isFinite(a) || !Number.isFinite(b) || b < a) return '';
  const x = new Date(a), z = new Date(b);
  const months = (z.getUTCFullYear() - x.getUTCFullYear()) * 12 + (z.getUTCMonth() - x.getUTCMonth()) - (z.getUTCDate() < x.getUTCDate() ? 1 : 0);
  const y = Math.floor(months / 12), m = months % 12;
  if (y === 0) return m < 1 ? 'under a month' : `${m} ${m === 1 ? 'month' : 'months'}`;
  return m === 0 ? `${y} ${y === 1 ? 'year' : 'years'}` : `${y}y ${m}m`;
}
export const plural = (n, one, many = one + 's') => `${fmtNum(n)} ${n === 1 ? one : many}`;
