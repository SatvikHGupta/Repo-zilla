import { useMemo, useState } from 'react';
import { useCatalogMeta } from '../../hooks/catalogMeta.js';
import { useModeCounts } from '../../hooks/useModeCounts.js';
import { ACTIVITY, ACTIVITY_ORDER } from '../../lib/activity.js';
import { AUTO_NOTE } from '../../lib/autoTags.js';
import { TAG_MODES } from '../../lib/filters.js';
import Chip from '../ui/Chip/Chip.jsx';
import Icon from '../ui/Icon/Icon.jsx';
import Segmented from '../ui/Segmented/Segmented.jsx';
import CheckRow from './CheckRow.jsx';
import FilterSection from './FilterSection.jsx';
import StarsFilter from './StarsFilter.jsx';
import TagInput from './TagInput.jsx';
import styles from './FilterPanel.module.css';

const toggle = (list, v) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
const LANG_PREVIEW = 10;
const TAG_HELP = {
  real: 'Tags from each repo’s own GitHub topics.',
  auto: AUTO_NOTE,
  both: AUTO_NOTE,
};

function LanguageList({ filters, update }) {
  const { languages } = useCatalogMeta();
  const [text, setText] = useState('');
  const [all, setAll] = useState(false);
  const needle = text.trim().toLowerCase();
  const rows = useMemo(() => {
    const pinned = languages.filter((l) => filters.langs.includes(l.key));
    const rest = languages.filter((l) => !filters.langs.includes(l.key) && (!needle || l.label.toLowerCase().includes(needle) || l.key.includes(needle)));
    return [...pinned, ...(needle || all ? rest : rest.slice(0, LANG_PREVIEW - pinned.length))];
  }, [languages, filters.langs, needle, all]);
  return (
    <>
      <div className={styles.mini}>
        <Icon name="search" size={14} />
        <input className={styles.miniInput} type="search" placeholder={`Find among ${languages.length} languages`} aria-label="Find a language" value={text} onChange={(e) => setText(e.target.value)} />
      </div>
      <div className={all || needle ? styles.scroll : undefined}>
        {rows.map((l) => <CheckRow key={l.key} label={l.label} count={l.count} checked={filters.langs.includes(l.key)} onChange={() => update({ langs: toggle(filters.langs, l.key) })} />)}
        {!rows.length && <p className={styles.empty}>No language matches “{text.trim()}”.</p>}
      </div>
      {!needle && languages.length > LANG_PREVIEW && <button type="button" className={styles.more} onClick={() => setAll((a) => !a)}>{all ? 'Show fewer' : `Show all ${languages.length}`}</button>}
    </>
  );
}

export default function FilterPanel({ filters, update, scope }) {
  const meta = useCatalogMeta();
  const { count } = meta;
  const lockedDomain = scope?.domains?.[0];
  const domainList = meta.hasFallback ? [...meta.domains, { id: meta.fallback, name: 'Uncategorized', subdomains: [] }] : meta.domains;
  // counts that depend on the tag mode: every domain, plus the subdomains that are on screen
  const shownSubs = lockedDomain ? meta.subsOf(lockedDomain) : domainList.filter((d) => filters.domains.includes(d.id) || (d.subdomains || []).some((s) => filters.subs.includes(s.id))).flatMap((d) => d.subdomains || []);
  const modeCounts = useModeCounts([...(lockedDomain ? [] : domainList.map((d) => 'd:' + d.id)), ...shownSubs.map((s) => 's:' + s.id)], filters.tagMode);

  return (
    <div className={styles.panel}>
      <FilterSection title="Tags" active={filters.tags.length} defaultOpen>
        <Segmented label="Which kind of tags" value={filters.tagMode} onChange={(v) => update({ tagMode: v })} options={TAG_MODES.map((m) => ({ value: m.id, label: m.label }))} />
        <p className={`${styles.note} ${filters.tagMode === 'real' ? '' : styles.autoNote}`}>{filters.tagMode !== 'real' && <Icon name="sparkle" size={13} />} {TAG_HELP[filters.tagMode]}</p>
        <TagInput mode={filters.tagMode} selected={filters.tags} onAdd={(t) => update({ tags: [...filters.tags, t] })} />
        {filters.tags.length > 0 && (
          <>
            <div className={styles.picked}>{filters.tags.map((t) => <Chip key={t} mono tone={filters.tagMode === 'auto' ? 'auto' : 'accent'} onRemove={() => update({ tags: filters.tags.filter((x) => x !== t) })} removeLabel={`Remove tag ${t}`}>{t}</Chip>)}</div>
            <p className={styles.note}>Repos must have all of these tags.</p>
          </>
        )}
      </FilterSection>

      {lockedDomain ? (
        <FilterSection title="Subdomain" active={filters.subs.length} defaultOpen>
          {meta.subsOf(lockedDomain).map((s) => <CheckRow key={s.id} label={s.name} count={modeCounts.count('s:' + s.id)} pending={modeCounts.pending('s:' + s.id)} checked={filters.subs.includes(s.id)} onChange={() => update({ subs: toggle(filters.subs, s.id) })} />)}
          {!meta.subsOf(lockedDomain).length && <p className={styles.empty}>This domain has no subdomains.</p>}
        </FilterSection>
      ) : (
        <FilterSection title="Domain" active={filters.domains.length + filters.subs.length} defaultOpen>
          {domainList.map((d) => {
            const on = filters.domains.includes(d.id);
            const open = on || (d.subdomains || []).some((s) => filters.subs.includes(s.id));
            return (
              <div key={d.id}>
                <CheckRow label={d.name} count={modeCounts.count('d:' + d.id)} pending={modeCounts.pending('d:' + d.id)} checked={on} onChange={() => update({ domains: toggle(filters.domains, d.id) })} />
                {open && (d.subdomains || []).map((s) => <CheckRow key={s.id} indent label={s.name} count={modeCounts.count('s:' + s.id)} pending={modeCounts.pending('s:' + s.id)} checked={filters.subs.includes(s.id)} onChange={() => update({ subs: toggle(filters.subs, s.id) })} />)}
              </div>
            );
          })}
        </FilterSection>
      )}

      <FilterSection title="Language" active={filters.langs.length} defaultOpen><LanguageList filters={filters} update={update} /></FilterSection>

      <FilterSection title="Stars" active={filters.stars || filters.starsMax ? 1 : 0} defaultOpen><StarsFilter filters={filters} update={update} /></FilterSection>

      <FilterSection title="Activity" active={filters.acts.length}>
        {ACTIVITY_ORDER.map((a) => <CheckRow key={a} label={ACTIVITY[a].label} hint={ACTIVITY[a].hint} count={count('act:' + a)} checked={filters.acts.includes(a)} onChange={() => update({ acts: toggle(filters.acts, a) })} />)}
        <p className={styles.note}>Measured from the last commit to the snapshot date.</p>
      </FilterSection>

      <FilterSection title="Created" active={filters.years.length}>
        <div className={styles.years}>
          {meta.years.map((y) => <button key={y.key} type="button" className={`${styles.year} num`} aria-pressed={filters.years.includes(y.key)} title={`${y.count.toLocaleString('en-US')} repos`} onClick={() => update({ years: toggle(filters.years, y.key) })}>{y.key}</button>)}
        </div>
      </FilterSection>

      <FilterSection title="Owner" active={filters.owner ? 1 : 0}>
        <CheckRow type="radio" name="owner" label="Anyone" checked={!filters.owner} onChange={() => update({ owner: '' })} />
        <CheckRow type="radio" name="owner" label="Users" count={count('o:user')} checked={filters.owner === 'user'} onChange={() => update({ owner: 'user' })} />
        <CheckRow type="radio" name="owner" label="Organizations" count={count('o:organization')} checked={filters.owner === 'organization'} onChange={() => update({ owner: 'organization' })} />
      </FilterSection>

      <FilterSection title="License" active={filters.lics.length}>
        {meta.licGroups.map((g) => <CheckRow key={g.id} label={g.label} hint={g.hint} count={g.count} checked={filters.lics.includes(g.id)} onChange={() => update({ lics: toggle(filters.lics, g.id) })} />)}
      </FilterSection>

      <FilterSection title="More" active={[filters.hideArchived, filters.hideGone, filters.homepage, filters.noTopics].filter(Boolean).length}>
        <CheckRow label="Hide archived" count={count('f:ar')} checked={filters.hideArchived} onChange={(v) => update({ hideArchived: v })} />
        <CheckRow label="Hide no longer on GitHub" count={count('f:gone')} checked={filters.hideGone} onChange={(v) => update({ hideGone: v })} />
        <CheckRow label="Has a homepage" count={count('f:hp')} checked={filters.homepage} onChange={(v) => update({ homepage: v })} />
        <CheckRow label="No GitHub topics" count={count('f:nt')} checked={filters.noTopics} onChange={(v) => update({ noTopics: v })} />
      </FilterSection>

      <p className={styles.foot}>Counts are for the whole catalog, not for your current results.</p>
    </div>
  );
}
