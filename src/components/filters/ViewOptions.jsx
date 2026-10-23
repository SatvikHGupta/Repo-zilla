import { usePrefs } from '../../store/prefs.store.js';
import { PAGE_SIZES } from '../../lib/filters.js';
import Segmented from '../ui/Segmented/Segmented.jsx';
import Switch from '../ui/Switch/Switch.jsx';
import styles from './ViewOptions.module.css';

// how results look: layout, density, page size and which fields each result shows. Saved on this device.
export default function ViewOptions() {
  const p = usePrefs();
  return (
    <div className={styles.panel}>
      <div className={styles.group}>
        <h3 className={styles.h}>Layout</h3>
        <Segmented label="Result layout" value={p.layout} onChange={(v) => p.setPref('layout', v)} options={[{ value: 'cards', label: 'Cards', icon: 'grid' }, { value: 'rows', label: 'Rows', icon: 'rows' }]} />
      </div>
      <div className={styles.group}>
        <h3 className={styles.h}>Density</h3>
        <Segmented label="Result density" value={p.density} onChange={(v) => p.setPref('density', v)} options={[{ value: 'comfortable', label: 'Comfortable' }, { value: 'compact', label: 'Compact' }]} />
      </div>
      <div className={styles.group}>
        <h3 className={styles.h}>Results per page</h3>
        <Segmented label="Results per page" value={String(p.pageSize)} onChange={(v) => p.setPref('pageSize', Number(v))} options={PAGE_SIZES.map((n) => ({ value: String(n), label: String(n) }))} />
      </div>
      <div className={styles.group}>
        <h3 className={styles.h}>Show on each result</h3>
        <Switch label="Description" checked={p.show.description} onChange={(v) => p.setShow('description', v)} />
        <Switch label="Tags" checked={p.show.tags} onChange={(v) => p.setShow('tags', v)} />
        <Switch label="Stars and forks" checked={p.show.stats} onChange={(v) => p.setShow('stats', v)} />
        <Switch label="Last commit and activity" checked={p.show.activity} onChange={(v) => p.setShow('activity', v)} />
        <Switch label="Domain" checked={p.show.domain} onChange={(v) => p.setShow('domain', v)} />
        <Switch label="Owner avatars" help="Loaded from GitHub. Off shows initials instead." checked={p.avatars} onChange={(v) => p.setPref('avatars', v)} />
      </div>
    </div>
  );
}
