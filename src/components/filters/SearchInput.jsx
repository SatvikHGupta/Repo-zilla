import { useEffect, useRef, useState } from 'react';
import { ignoredWords, searchableWords } from '../../hooks/useCatalog.js';
import Icon from '../ui/Icon/Icon.jsx';
import styles from './SearchInput.module.css';

// While the box is being edited it shows the draft; otherwise it mirrors the URL. Typing commits after a pause (replace), Enter commits at once.
export default function SearchInput({ value, onCommit, placeholder = 'Search repos, descriptions, topics', autoFocus = false }) {
  const [draft, setDraft] = useState(null);
  const [sent, setSent] = useState(value.trim());   // the last text this box handed to onCommit
  const [seen, setSeen] = useState(value);          // the URL text at the previous render
  const input = useRef(null);
  const text = draft ?? value;

  // the URL text changed on its own (Back / Forward, a link, a reset): forget the stale draft and follow the URL, unless the change is our own commit arriving
  if (value !== seen) {
    setSeen(value);
    if (value.trim() !== sent && (draft === null || value.trim() !== draft.trim())) {
      setSent(value.trim());
      if (draft !== null) setDraft(null);
    }
  }

  const send = (next, opts) => { setSent(next); onCommit(next, opts); };

  useEffect(() => {
    if (draft === null || draft.trim() === sent) return undefined;
    const t = setTimeout(() => send(draft.trim(), { replace: true }), 280);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- send only wraps setSent and the latest onCommit
  }, [draft, sent, onCommit]);

  // what the results were really searched with: say so when words were skipped, instead of quietly searching for less than was typed
  const shownQuery = value.trim();
  const skipped = shownQuery ? ignoredWords(shownQuery) : [];
  const nothing = shownQuery.length > 0 && searchableWords(shownQuery).length === 0;
  return (
    <form className={styles.form} role="search" onSubmit={(e) => { e.preventDefault(); if (draft !== null && draft.trim() !== sent) send(draft.trim()); input.current?.blur(); }}>
      <div className={styles.field}>
        <Icon name="search" size={19} />
        <input ref={input} className={styles.input} type="search" enterKeyHint="search" value={text} placeholder={placeholder} aria-label="Search repositories" maxLength={100}
          autoFocus={autoFocus} autoComplete="off" autoCapitalize="none" spellCheck="false"
          onChange={(e) => setDraft(e.target.value)}
          onFocus={() => setDraft((d) => d ?? value)}
          onBlur={() => { if (draft !== null && draft.trim() !== sent) send(draft.trim(), { replace: true }); setDraft(null); }} />
        {text && <button type="button" className={styles.clear} aria-label="Clear search" onMouseDown={(e) => e.preventDefault()} onClick={() => { setDraft(''); send(''); input.current?.focus(); }}><Icon name="close" size={16} /></button>}
      </div>
      {nothing && <p className={styles.hint} role="status">Nothing to search for in “{shownQuery}”: numbers, single letters and very common words are ignored, so every repository is shown.</p>}
      {!nothing && skipped.length > 0 && <p className={styles.hint} role="status">Not searched: {skipped.map((w) => `“${w}”`).join(', ')}. Numbers, single letters and very common words are ignored.</p>}
    </form>
  );
}
