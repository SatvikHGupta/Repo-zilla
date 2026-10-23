import Chip from '../ui/Chip/Chip.jsx';
import { ACTIVITY } from '../../lib/activity.js';

const TONE = { good: 'good', ok: 'neutral', warn: 'warn', muted: 'muted' };

export default function ActivityBadge({ band }) {
  const a = ACTIVITY[band] || ACTIVITY.none;
  return <Chip tone={TONE[a.tone]} icon="clock" title={a.hint}>{a.label}</Chip>;
}
