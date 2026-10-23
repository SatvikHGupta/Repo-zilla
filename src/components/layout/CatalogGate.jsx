import { useMemo } from 'react';
import { useFacetsData, useManifest } from '../../hooks/useCatalog.js';
import { CatalogMetaContext, buildMeta } from '../../hooks/catalogMeta.js';
import { DATA_BASE } from '../../data/catalog.js';
import Loader from '../ui/Loader/Loader.jsx';
import { ErrorState } from '../ui/State/State.jsx';

// renders children only once manifest + facets are in memory, so every page below can read useCatalogMeta() without null checks
export default function CatalogGate({ children, silent = false }) {
  const manifest = useManifest();
  const facets = useFacetsData(manifest.isSuccess);
  const meta = useMemo(() => (manifest.data && facets.data ? buildMeta(manifest.data, facets.data) : null), [manifest.data, facets.data]);
  if (meta) return <CatalogMetaContext.Provider value={meta}>{children}</CatalogMetaContext.Provider>;
  if (silent) return null;
  const error = manifest.error || facets.error;
  if (error) {
    const full = new Error(`${error.message} (data source: ${DATA_BASE || 'not set'})`);
    return <ErrorState title="Could not open the catalog" error={full} onRetry={() => { manifest.refetch(); if (manifest.isSuccess) facets.refetch(); }} />;
  }
  return <Loader variant="boot" label="Opening catalog" hint="Reading the index from the data host" />;
}
