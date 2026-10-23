import { Link } from 'react-router-dom';
import Icon from '../Icon/Icon.jsx';
import styles from './Chip.module.css';

// tone: neutral | accent | auto | good | warn | danger | muted. onRemove adds a close button, onClick makes it a button, `to` makes it a router link.
export default function Chip({ children, tone = 'neutral', icon, onRemove, removeLabel, onClick, to, state, title, mono = false, className = '' }) {
  const c = `${styles.chip} ${styles[tone]} ${mono ? styles.mono : ''} ${className}`;
  const body = (<>{icon && <Icon name={icon} size={13} />}<span className={styles.text}>{children}</span></>);
  if (onRemove) {
    return (
      <span className={`${c} ${styles.removable}`} title={title}>
        {body}
        <button type="button" className={styles.x} onClick={onRemove} aria-label={removeLabel || 'Remove'}><Icon name="close" size={12} /></button>
      </span>
    );
  }
  if (to) return <Link className={`${c} ${styles.btn}`} to={to} state={state} title={title}>{body}</Link>;
  if (onClick) return <button type="button" className={`${c} ${styles.btn}`} onClick={onClick} title={title}>{body}</button>;
  return <span className={c} title={title}>{body}</span>;
}
