// Activity bands follow the catalog's own act:* facet (months between last commit and the snapshot), so badges agree with the filter.
import { activityBand } from '../data/catalog_core.js';

export const ACTIVITY = {
  a3: { label: 'Active', hint: 'Last commit within 3 months of the snapshot', tone: 'good' },
  a12: { label: 'Recent', hint: 'Last commit 3 to 12 months before the snapshot', tone: 'ok' },
  a36: { label: 'Slow', hint: 'Last commit 1 to 3 years before the snapshot', tone: 'warn' },
  old: { label: 'Stale', hint: 'Last commit more than 3 years before the snapshot', tone: 'muted' },
  none: { label: 'No commit data', hint: 'GitHub reported no commit date', tone: 'muted' },
};
export const ACTIVITY_ORDER = ['a3', 'a12', 'a36', 'old', 'none'];

// full records carry an exact timestamp
export const bandOf = (lastCommit, snapshotDate) => activityBand(lastCommit, Date.parse(snapshotDate));
// list rows only carry "YYYY-MM": use mid-month, which can differ from the exact facet band for a repo right on a boundary
export const bandOfMonth = (ym, snapshotDate) => (/^\d{4}-\d{2}$/.test(ym || '') ? bandOf(`${ym}-15T00:00:00Z`, snapshotDate) : 'none');
