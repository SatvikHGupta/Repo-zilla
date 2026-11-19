import { useManifest } from './useCatalog.js';

// The smallest star count in the catalog, from the manifest (it changes when the data is rebuilt, for example 50 to 10), or null until the manifest is there.
export function useStarFloor() {
  const n = useManifest().data?.min_stars;
  return Number.isFinite(n) && n > 0 ? n : null;
}
