import Chip from '../ui/Chip/Chip.jsx';
import { buildSearchParams, DEFAULT_FILTERS } from '../../lib/filters.js';
import AutoTags from './AutoTags.jsx';

const tagTo = (tag, tagMode) => `/search?${buildSearchParams({ ...DEFAULT_FILTERS, tags: [tag], tagMode })}`;

// tags of one list item. Real tags show in "real" and "both" mode, auto tags in "auto" and "both" mode (only repos without real tags have any).
export default function RepoTags({ row, tagMode, max = Infinity }) {
  const real = tagMode !== 'auto' && row.t?.length ? row.t : [];
  const auto = tagMode !== 'real' && row.a?.length ? row.a.map((tag, i) => ({ tag, p: row.ap?.[i] ?? 0 })) : [];
  if (!real.length && !auto.length) return null;
  // a limit (compact view): real tags first, then auto tags, and a "+N" for the rest
  const shownReal = real.slice(0, max), shownAuto = auto.slice(0, Math.max(0, max - shownReal.length));
  const hidden = real.length + auto.length - shownReal.length - shownAuto.length;
  return (
    <>
      {shownReal.map((t) => <Chip key={t} to={tagTo(t, 'real')} mono>{t}</Chip>)}
      <AutoTags tags={shownAuto} compact />
      {hidden > 0 && <Chip tone="muted" title={`${hidden} more tags`}>+{hidden}</Chip>}
    </>
  );
}
