import { lazy, Suspense, useEffect } from 'react';
import { matchPath, Route, Routes, useLocation } from 'react-router-dom';
import AppShell from './components/layout/AppShell.jsx';
import PanelHost, { REPO_ROUTE } from './components/layout/PanelHost.jsx';
import Home from './pages/Home.jsx';
import NotFound from './pages/NotFound.jsx';
import Loader from './components/ui/Loader/Loader.jsx';
import { useScrollRestore } from './hooks/useScrollRestore.js';

// the home page ships with the app; every other page is its own file, fetched when it is first needed and, a moment after the home page is up, in the background
const loaders = {
  search: () => import('./pages/Search.jsx'),
  domains: () => import('./pages/Domains.jsx'),
  domain: () => import('./pages/DomainDetail.jsx'),
  about: () => import('./pages/About.jsx'),
  terms: () => import('./pages/Terms.jsx'),
  privacy: () => import('./pages/Privacy.jsx'),
  contact: () => import('./pages/Contact.jsx'),
};
const Search = lazy(loaders.search);
const Domains = lazy(loaders.domains);
const DomainDetail = lazy(loaders.domain);
const About = lazy(loaders.about);
const Terms = lazy(loaders.terms);
const Privacy = lazy(loaders.privacy);
const Contact = lazy(loaders.contact);

// when the browser is idle, the pages people go to next (search first) are already downloaded, so a click does not wait for a file
function prefetchPages() {
  const run = () => { for (const k of ['search', 'domains', 'domain']) loaders[k]().catch(() => {}); };
  if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 4000 }); else setTimeout(run, 2000);
}

export default function App() {
  const location = useLocation();
  const background = location.state?.background;
  const onRepo = !!matchPath(REPO_ROUTE, location.pathname);
  // a repo URL is an overlay: the page behind it is the one the user came from, or the search page when the link was opened directly
  const pageLocation = background || (onRepo ? { pathname: '/search', search: '', hash: '', state: null, key: 'repo-background' } : location);
  useEffect(prefetchPages, []);
  useScrollRestore(pageLocation); // new pages start at the top, Back / Forward restore the old position

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
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </div>
      </Suspense>
      <PanelHost />
    </AppShell>
  );
}
