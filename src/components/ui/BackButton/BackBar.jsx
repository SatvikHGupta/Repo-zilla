import BackButton from './BackButton.jsx';
import styles from './BackBar.module.css';

// the strip at the top of a page that holds the Back button, in the same column as the page content
export default function BackBar({ fallback = '/', maxWidth }) {
  return (
    <div className={`container ${styles.bar}`} style={maxWidth ? { maxWidth } : undefined}>
      <BackButton fallback={fallback} />
    </div>
  );
}
