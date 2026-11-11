import { useState } from 'react';
import { usePrefs } from '../../store/prefs.store.js';
import { avatarUrl } from '../../lib/links.js';
import { hueOf } from '../../lib/languages.js';
import styles from './Avatar.module.css';

// GitHub owner avatar with a monogram fallback (shown when avatars are switched off or the image fails)
export default function Avatar({ owner, size = 40 }) {
  const enabled = usePrefs((s) => s.avatars);
  const [failedFor, setFailedFor] = useState('');
  const show = enabled && failedFor !== owner;
  return (
    <span className={styles.avatar} style={{ width: size, height: size, '--h': hueOf(owner), fontSize: size * 0.42 }} aria-hidden="true">
      {show
        ? <img src={avatarUrl(owner, size * 2)} alt="" width={size} height={size} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailedFor(owner)} />
        : <span>{owner.charAt(0).toUpperCase()}</span>}
    </span>
  );
}
