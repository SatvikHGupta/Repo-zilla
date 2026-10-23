import { ACCENTS, MODES } from '../../theme/registry.js';
import { themeStore, useTheme } from '../../theme/store.js';
import { withThemeTransition } from '../../theme/animate.js';
import { usePrefs } from '../../store/prefs.store.js';
import Segmented from '../ui/Segmented/Segmented.jsx';
import Icon from '../ui/Icon/Icon.jsx';
import styles from './AppearancePanel.module.css';

// content shared by the navbar popover (desktop) and the bottom sheet (phone)
export default function AppearancePanel() {
  const { mode, accent, partner } = useTheme();
  const resetPrefs = usePrefs((s) => s.resetPrefs);
  const swatch = (a) => a[mode].primary;
  return (
    <div className={styles.panel}>
      <section>
        <h3 className={styles.h}>Mode</h3>
        <Segmented label="Colour mode" value={mode} onChange={(v) => withThemeTransition(() => themeStore.setMode(v))} options={MODES.map((m) => ({ value: m.id, label: m.label, icon: m.id === 'dark' ? 'moon' : 'sun' }))} />
      </section>
      <section>
        <h3 className={styles.h}>Accent</h3>
        <div className={styles.swatches} role="radiogroup" aria-label="Accent colour">
          {ACCENTS.map((a) => (
            <button key={a.id} type="button" role="radio" aria-checked={accent === a.id} aria-label={a.label} title={a.label} className={styles.swatch} style={{ '--sw': swatch(a) }} onClick={() => withThemeTransition(() => themeStore.setAccent(a.id))}>
              {accent === a.id && <Icon name="check" size={15} />}
            </button>
          ))}
        </div>
      </section>
      <section>
        <h3 className={styles.h}>Secondary colour</h3>
        <div className={styles.swatches} role="radiogroup" aria-label="Secondary colour">
          <button type="button" role="radio" aria-checked={partner === null} className={`${styles.swatch} ${styles.auto}`} title="Matched to the accent" onClick={() => withThemeTransition(() => themeStore.setPartner(null))}>
            {partner === null ? <Icon name="check" size={15} /> : <span>Auto</span>}
          </button>
          {ACCENTS.map((a) => (
            <button key={a.id} type="button" role="radio" aria-checked={partner === a.id} aria-label={a.label} title={a.label} className={`${styles.swatch} ${styles.small}`} style={{ '--sw': swatch(a) }} onClick={() => withThemeTransition(() => themeStore.setPartner(a.id))}>
              {partner === a.id && <Icon name="check" size={13} />}
            </button>
          ))}
        </div>
      </section>
      <button type="button" className={styles.reset} onClick={() => { withThemeTransition(() => { themeStore.setMode('dark'); themeStore.setAccent('amber'); themeStore.setPartner(null); }); resetPrefs(); }}>Reset appearance and view options</button>
    </div>
  );
}
