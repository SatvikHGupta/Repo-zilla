import styles from './Mark.module.css';

// RepoZilla mark: a rounded square with a Z stroke. `draw` plays the stroke-draw used by the boot loader.
export default function Mark({ size = 28, draw = false, className = '' }) {
  return (
    <svg className={`${styles.mark} ${draw ? styles.draw : ''} ${className}`} width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect className={styles.box} x="1.5" y="1.5" width="29" height="29" rx="8" />
      <path className={styles.z} d="M9.5 10.5h13l-13 11h13" pathLength="1" />
    </svg>
  );
}
