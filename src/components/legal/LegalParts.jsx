import styles from './LegalPage.module.css';

// two small building blocks for the text of the legal pages
export function LegalTable({ rows, label }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table} aria-label={label}>
        <tbody>{rows.map(([k, v]) => <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>)}</tbody>
      </table>
    </div>
  );
}
export const Callout = ({ children }) => <p className={styles.callout}>{children}</p>;
