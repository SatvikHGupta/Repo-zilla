import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'motion/react';
import App from './App.jsx';
import ErrorBoundary from './components/layout/ErrorBoundary.jsx';
import { installChunkReload } from './lib/chunkReload.js';
import { connect } from './data/catalog.js';
import './theme/store.js';
// the typefaces are served by the site itself (no request to a font host, which the Content-Security-Policy would not allow anyway)
import '@fontsource-variable/ibm-plex-sans/wght.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/ibm-plex-mono/latin-500.css';
import './styles/index.css';

installChunkReload(); // a tab opened before a deploy reloads once instead of crashing when it lazy-loads a file that no longer exists
if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'; // the router hook restores positions itself

// start the catalog worker and the manifest request now, so they run while React mounts and the first page's code loads (the manifest query reuses this request)
connect().catch(() => {}); // a failure is shown by the page that needs the catalog

// the snapshot never changes while the site is open, so cached results stay valid for the whole visit
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: Infinity, gcTime: 10 * 60_000, refetchOnWindowFocus: false, refetchOnReconnect: false } },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <MotionConfig reducedMotion="user">
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </MotionConfig>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
