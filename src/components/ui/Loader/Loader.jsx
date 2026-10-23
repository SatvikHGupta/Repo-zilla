import Mark from '../Mark/Mark.jsx';
import styles from './Loader.module.css';

// One loading family, all themed. boot: full area with the animated mark. inline: small bar + label. panel: centred inside a panel.
export default function Loader({ variant = 'inline', label = 'Loading', hint }) {
  if (variant === 'boot') {
    return (
      <div className={styles.boot} role="status" aria-live="polite">
        <Mark size={60} draw />
        <p className={styles.bootLabel}>{label}</p>
        {hint && <p className={styles.hint}>{hint}</p>}
        <span className={styles.bar} aria-hidden="true"><i /></span>
      </div>
    );
  }
  if (variant === 'panel') {
    return (
      <div className={styles.panel} role="status" aria-live="polite">
        <Mark size={36} draw />
        <p className={styles.hint}>{label}</p>
      </div>
    );
  }
  return (
    <span className={styles.inline} role="status" aria-live="polite">
      <span className={styles.dots} aria-hidden="true"><i /><i /><i /></span>
      <span>{label}</span>
    </span>
  );
}

// thin accent line pinned to the top of the viewport while a query is in flight
export function TopProgress({ active }) {
  return <div className={`${styles.top} ${active ? styles.topOn : ''}`} aria-hidden="true"><i /></div>;
}

const Line = ({ w = '100%', h = 12, r }) => <span className={styles.sk} style={{ width: w, height: h, borderRadius: r }} />;

// placeholders with the exact footprint of a result, so the page does not jump when data arrives
export function RepoSkeleton({ layout = 'cards', count = 8 }) {
  return (
    <ul className={layout === 'cards' ? styles.skGrid : styles.skRows} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className={layout === 'cards' ? styles.skCard : styles.skRow}>
          <div className={styles.skHead}><Line w={36} h={36} r="10px" /><div className={styles.skCol}><Line w="40%" h={11} /><Line w="70%" h={15} /></div></div>
          <Line w="95%" /><Line w={`${60 + ((i * 13) % 30)}%`} />
          {layout === 'cards' && <div className={styles.skTags}><Line w={64} h={22} r="999px" /><Line w={80} h={22} r="999px" /><Line w={52} h={22} r="999px" /></div>}
          <div className={styles.skFoot}><Line w={70} h={12} /><Line w={50} h={12} /><Line w={90} h={12} /></div>
        </li>
      ))}
    </ul>
  );
}

export function ReadmeSkeleton() {
  return (
    <div className={styles.skReadme} aria-hidden="true">
      <Line w="45%" h={26} />
      <Line /><Line w="92%" /><Line w="78%" />
      <Line w="30%" h={20} />
      <span className={styles.skCode}><Line w="60%" /><Line w="80%" /><Line w="50%" /></span>
      <Line /><Line w="85%" />
    </div>
  );
}
