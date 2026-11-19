import { SORTS } from '../../lib/filters.js';
import Select from '../ui/Select/Select.jsx';

// Sorts whose index is missing from the data are left out; in development they are listed as disabled so the gap is visible.
export default function SortSelect({ value, onChange, available }) {
  const options = SORTS.filter((s) => available(s.id) || import.meta.env.DEV).map((s) => ({ value: s.id, label: s.label, disabled: !available(s.id), hint: available(s.id) ? undefined : 'not built in this export' }));
  return <Select label="Sort results" prefix="Sort" value={value} onChange={onChange} options={options} />;
}
