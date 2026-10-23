import Chip from '../ui/Chip/Chip.jsx';
import { buildSearchParams, DEFAULT_FILTERS } from '../../lib/filters.js';
import AutoTags from './AutoTags.jsx';

const tagTo = (tag, tagMode) => `/search?${buildSearchParams({ ...DEFAULT_FILTERS, tags: [tag], tagMode })}`;

// tags of one list item. Real tags show in "real" and "both" mode, auto tags in "auto" and "both" mode (only repos without real tags have any).
export default function RepoTags({ row, tagMode }) {
  const real = tagMode !== 'auto' && row.t?.length ? row.t : [];
  const auto = tagMode !== 'real' && row.a?.length ? row.a.map((tag, i) => ({ tag, p: row.ap?.[i] ?? 0 })) : [];
  if (!real.length && !auto.length) return null;
  return (
    <>
      {real.map((t) => <Chip key={t} to={tagTo(t, 'real')} mono>{t}</Chip>)}
      <AutoTags tags={auto} compact />
    </>
  );
}
