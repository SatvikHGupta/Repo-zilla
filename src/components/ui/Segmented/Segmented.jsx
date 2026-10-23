import Icon from '../Icon/Icon.jsx';
import styles from './Segmented.module.css';

// single-choice button group. options: [{ value, label, icon? }]
export default function Segmented({ value, onChange, options, label, size = 'md' }) {
  return (
    <div className={`${styles.group} ${size === 'sm' ? styles.sm : ''}`} role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={value === o.value} className={styles.opt} onClick={() => onChange(o.value)}>
          {o.icon && <Icon name={o.icon} size={15} />}
          <span>{o.label}</span>
        </button>
      ))}
    </div>
  );
}
