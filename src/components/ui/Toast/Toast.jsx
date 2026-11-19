import { useEffect } from 'react';
import { useUi } from '../../../store/ui.store.js';
import Icon from '../Icon/Icon.jsx';
import styles from './Toast.module.css';

function Item({ t }) {
  const dismiss = useUi((s) => s.dismissToast);
  useEffect(() => { const id = setTimeout(() => dismiss(t.id), 2800); return () => clearTimeout(id); }, [t.id, dismiss]);
  return (
    <li className={`${styles.toast} ${t.tone === 'error' ? styles.error : ''}`}>
      <Icon name={t.tone === 'error' ? 'alert' : 'check'} size={16} />
      <span>{t.message}</span>
    </li>
  );
}

export default function ToastHost() {
  const toasts = useUi((s) => s.toasts);
  return <ul className={styles.host} aria-live="polite" aria-atomic="false">{toasts.map((t) => <Item key={t.id} t={t} />)}</ul>;
}
