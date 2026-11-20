// Which page file a link leads to, so it can be fetched the moment someone shows interest in the link (pointer over it, keyboard focus, touch).
// Nothing is fetched in advance for every visitor: a crawler or bot that only loads the page makes no extra requests, and on a host that counts
// requests every visit costs the same as one page.
export function pageKeyForHref(href) {
  if (typeof href !== 'string' || !href.startsWith('/') || href.startsWith('//')) return null;
  const path = href.split(/[?#]/)[0];
  if (path === '/search') return 'search';
  if (path === '/domains') return 'domains';
  if (path.startsWith('/domains/')) return 'domain';
  if (path === '/about') return 'about';
  if (path === '/terms') return 'terms';
  if (path === '/privacy') return 'privacy';
  if (path === '/contact') return 'contact';
  return null;
}

// starts the listeners; returns the function that stops them
export function prefetchOnIntent(loaders) {
  const seen = new Set();
  const on = (e) => {
    const a = e.target instanceof Element ? e.target.closest('a[href]') : null;
    const key = a ? pageKeyForHref(a.getAttribute('href')) : null;
    if (!key || seen.has(key) || !loaders[key]) return;
    seen.add(key);
    loaders[key]().catch(() => seen.delete(key)); // a failed fetch may be tried again on the next hover
  };
  const events = ['pointerover', 'focusin', 'touchstart'];
  for (const t of events) document.addEventListener(t, on, { passive: true });
  return () => { for (const t of events) document.removeEventListener(t, on); };
}
