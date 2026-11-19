import { useCountUp } from '../../../hooks/useCountUp.js';
import { fmtNum } from '../../../lib/format.js';

// number that counts up to its value. Screen readers get the final value at once, the animated text is hidden from them.
export default function CountUp({ value, start = 0, duration, className }) {
  const shown = useCountUp(value, { start, duration });
  return (
    <span className={className}>
      <span aria-hidden="true">{fmtNum(shown)}</span>
      <span className="sr-only">{fmtNum(value)}</span>
    </span>
  );
}
