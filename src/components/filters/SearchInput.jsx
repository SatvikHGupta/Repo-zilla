import { useEffect, useRef, useState } from 'react';
import { searchableWords } from '../../hooks/useCatalog.js';
import Icon from '../ui/Icon/Icon.jsx';
import styles from './SearchInput.module.css';

// While the box is being edited it shows the draft; otherwise it mirrors the URL. Typing commits after a pause (replace), Enter commits at once.
export default function SearchInput({ value, onCommit, placeholder = 'Search repos, descriptions, topics', autoFocus = false }) {
  const [draft, setDraft] = useState(null);
  const input = useRef(null);
  const text = draft ?? value;

  useEffect(() => {
    if (draft === null || draft.trim() === value.trim()) return undefined;
    const t = setTimeout(() => onCommit(draft.trim(), { replace: true }), 280);
    return () => clearTimeout(t);
  }, [draft, value, onCommit]);

  const unsearchable = text.trim().length > 0 && searchableWords(text).length === 0;
  return (
    <form className={styles.form} role="search" onSubmit={(e) => { e.preventDefault(); if (draft !== null && draft.trim() !== value.trim()) onCommit(draft.trim()); input.current?.blur(); }}>
      <div className={styles.field}>
        <Icon name="search" size={19} />
        <input ref={input} className={styles.input} type="search" enterKeyHint="search" value={text} placeholder={placeholder} aria-label="Search repositories" maxLength={100}
          autoFocus={autoFocus} autoComplete="off" autoCapitalize="none" spellCheck="false"
          onChange={(e) => setDraft(e.target.value)}
          onFocus={() => setDraft((d) => d ?? value)}
          onBlur={() => { if (draft !== null && draft.trim() !== value.trim()) onCommit(draft.trim(), { replace: true }); setDraft(null); }} />
        {text && <button type="button" className={styles.clear} aria-label="Clear search" onMouseDown={(e) => e.preventDefault()} onClick={() => { setDraft(null); onCommit(''); input.current?.focus(); }}><Icon name="close" size={16} /></button>}
      </div>
      {unsearchable && <p className={styles.hint} role="status">Nothing to search for in “{text.trim()}”: very common words and single letters are ignored.</p>}
    </form>
  );
}
