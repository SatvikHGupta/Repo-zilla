import { useId, useRef, useState } from 'react';
import { useTagSuggest } from '../../hooks/useCatalog.js';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import { fmtNum } from '../../lib/format.js';
import Icon from '../ui/Icon/Icon.jsx';
import styles from './TagInput.module.css';

// tag autocomplete (combobox). The 1.2 MB tag dictionary is only fetched once the box is focused and something is typed.
export default function TagInput({ onAdd, mode, selected }) {
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(0);
  const input = useRef(null);
  const listId = useId();
  const prefix = useDebouncedValue(text.trim().toLowerCase(), 120);
  const q = useTagSuggest(prefix, { mode, enabled: focused });
  const options = (q.data || []).filter((o) => !selected.includes(o.tag));
  const open = focused && text.trim().length > 0;
  const idx = Math.min(active, Math.max(options.length - 1, 0));

  const choose = (o) => { onAdd(o.tag); setText(''); setActive(0); input.current?.focus(); };
  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, options.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter') { if (open && options[idx]) { e.preventDefault(); choose(options[idx]); } }
    else if (e.key === 'Escape' && text) { e.stopPropagation(); setText(''); }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.field}>
        <Icon name="tag" size={15} />
        <input ref={input} className={styles.input} role="combobox" aria-expanded={open} aria-controls={listId} aria-autocomplete="list" aria-activedescendant={open && options[idx] ? `${listId}-${idx}` : undefined}
          placeholder="Add a tag, e.g. react" value={text} autoComplete="off" autoCapitalize="none" spellCheck="false" aria-label="Add a tag filter"
          onChange={(e) => { setText(e.target.value); setActive(0); }} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onKeyDown={onKeyDown} />
      </div>
      {open && (
        <ul id={listId} role="listbox" className={styles.list}>
          {options.map((o, i) => (
            <li key={o.tag} id={`${listId}-${i}`} role="option" aria-selected={i === idx} className={`${styles.opt} ${i === idx ? styles.on : ''}`}
              onMouseDown={(e) => { e.preventDefault(); choose(o); }} onMouseEnter={() => setActive(i)}>
              <span className={styles.tag}>{o.tag}</span>
              {o.auto && <span className={styles.autoLabel}>auto</span>}
              <span className={`${styles.count} num`}>{fmtNum(o.count)}</span>
            </li>
          ))}
          {!options.length && <li className={styles.none} role="presentation">{q.isFetching ? 'Searching tags…' : `No tag starts with “${text.trim()}”`}</li>}
        </ul>
      )}
    </div>
  );
}
