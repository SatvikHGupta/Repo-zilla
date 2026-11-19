import Loader from '../ui/Loader/Loader.jsx';
import styles from './PanelSkeleton.module.css';

// shown for the instant it takes to fetch the panel code the first time a repository is opened
export default function PanelSkeleton() {
  return (
    <div className={styles.root} aria-hidden="true">
      <div className={styles.scrim} />
      <aside className={styles.panel}><Loader variant="panel" label="Opening repository" /></aside>
    </div>
  );
}
