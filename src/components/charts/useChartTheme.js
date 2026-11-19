// The few theme colours a chart needs (the gap colour between segments), read from the page's CSS variables again whenever the mode or accent changes.
import { useMemo } from 'react';
import { useTheme } from '../../theme/store.js';

export function useChartTheme() {
  const { mode, accent } = useTheme();
  const surface = useMemo(() => {
    void accent; // a new accent can change the surface tint, so it is part of the key
    const v = typeof document !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue('--surface').trim() : '';
    return v || (mode === 'light' ? '#ffffff' : '#16161a');
  }, [mode, accent]);
  return { mode, surface };
}
