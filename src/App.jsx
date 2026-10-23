import { lazy, Suspense, useEffect } from 'react';
import { matchPath, Route, Routes, useLocation } from 'react-router-dom';
import AppShell from './components/layout/AppShell.jsx';
import PanelHost, { REPO_ROUTE } from './components/layout/PanelHost.jsx';
import DomainDetail from './pages/DomainDetail.jsx';
import Domains from './pages/Domains.jsx';
import Home from './pages/Home.jsx';
import NotFound from './pages/NotFound.jsx';
import Search from './pages/Search.jsx';
import Loader from './components/ui/Loader/Loader.jsx';

const About = lazy(() => import('./pages/About.jsx'));
const Terms = lazy(() => import('./pages/Terms.jsx'));
const Privacy = lazy(() => import('./pages/Privacy.jsx'));

// scroll to the top when the page underneath changes, but not when the repo panel opens or closes over it
function useScrollTopOnPageChange(pathname) {
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }, [pathname]);
}

export default function App() {
  const location = useLocation();
  const background = location.state?.background;
  const onRepo = !!matchPath(REPO_ROUTE, location.pathname);
  // a repo URL is an overlay: the page behind it is the one the user came from, or the search page when the link was opened directly
  const pageLocation = background || (onRepo ? { pathname: '/search', search: '', hash: '', state: null, key: 'repo-background' } : location);
  useScrollTopOnPageChange(pageLocation.pathname);

  return (
    <AppShell>
      <Suspense fallback={<Loader variant="boot" label="Loading" />}>
      <div key={pageLocation.pathname} className="page-enter">
      <Routes location={pageLocation}>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/domains" element={<Domains />} />
        <Route path="/domains/:id" element={<DomainDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </div>
      </Suspense>
      <PanelHost />
    </AppShell>
  );
}
