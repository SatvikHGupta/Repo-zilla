import Icon from '../Icon/Icon.jsx';
import { Button } from '../Button/Button.jsx';
import styles from './State.module.css';

export function EmptyState({ icon = 'search', title, children, action }) {
  return (
    <div className={styles.state}>
      <span className={styles.icon}><Icon name={icon} size={22} /></span>
      <h3 className={styles.title}>{title}</h3>
      {children && <p className={styles.text}>{children}</p>}
      {action}
    </div>
  );
}

// error is shown in full because most failures here are setup problems (wrong data URL, data not reachable)
export function ErrorState({ title = 'Something went wrong', error, onRetry }) {
  return (
    <div className={styles.state} role="alert">
      <span className={`${styles.icon} ${styles.bad}`}><Icon name="alert" size={22} /></span>
      <h3 className={styles.title}>{title}</h3>
      {error && <p className={styles.text}>{String(error.message || error)}</p>}
      {onRetry && <Button icon="refresh" onClick={onRetry}>Try again</Button>}
    </div>
  );
}
