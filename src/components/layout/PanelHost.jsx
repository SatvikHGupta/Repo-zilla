import { lazy, Suspense } from 'react';
import { AnimatePresence } from 'motion/react';
import { matchPath, useLocation } from 'react-router-dom';
import CatalogGate from './CatalogGate.jsx';
import PanelSkeleton from './PanelSkeleton.jsx';
// the panel carries the Markdown renderer and sanitizer, so it is fetched the first time a repo is opened
const RepoPanel = lazy(() => import('../repo/RepoPanel.jsx'));

export const REPO_ROUTE = '/repo/:owner/:name';

// the repo panel is an overlay route: it renders above whatever page is underneath, and animates out when the route changes
export default function PanelHost() {
  const { pathname } = useLocation();
  const m = matchPath(REPO_ROUTE, pathname);
  const owner = m?.params.owner, name = m?.params.name;
  return (
    <CatalogGate silent>
      <AnimatePresence>
        {m && <Suspense key={`${owner}/${name}`.toLowerCase()} fallback={<PanelSkeleton />}><RepoPanel owner={owner} name={name} /></Suspense>}
      </AnimatePresence>
    </CatalogGate>
  );
}
