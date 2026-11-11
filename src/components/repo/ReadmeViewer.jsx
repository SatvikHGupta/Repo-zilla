import { useEffect, useMemo, useRef, useState } from 'react';
import { usePrefs } from '../../store/prefs.store.js';
import { readmeKind, sanitizeReadme } from '../../lib/readme.js';
import { parseMarkdown } from '../../lib/readmeRender.js';
import { fmtNum } from '../../lib/format.js';
import Segmented from '../ui/Segmented/Segmented.jsx';
import Chip from '../ui/Chip/Chip.jsx';
import Icon from '../ui/Icon/Icon.jsx';
import { ReadmeSkeleton } from '../ui/Loader/Loader.jsx';
import { Button } from '../ui/Button/Button.jsx';
import { EmptyState } from '../ui/State/State.jsx';
import styles from './ReadmeViewer.module.css';

// README text arrives with the record. Markdown is rendered (sanitized), everything else is shown as plain text.
export default function ReadmeViewer({ rec }) {
  const imagesAlways = usePrefs((s) => s.imagesAlways);
  const setPref = usePrefs((s) => s.setPref);
  const [view, setView] = useState('rendered');
  const [loadImages, setLoadImages] = useState(false);
  const box = useRef(null);
  const imagesOn = imagesAlways || loadImages;
  const kind = readmeKind(rec.readme_file);
  const text = rec.readme;

  // the Markdown is parsed on a worker with a time limit; the result (or the reason it failed) is kept together with the text it belongs to
  const wantsParse = kind === 'markdown' && view === 'rendered' && !!text;
  const [parsed, setParsed] = useState({ text: null, html: null, failed: null });
  useEffect(() => {
    if (!wantsParse) return undefined;
    let live = true;
    parseMarkdown(text).then(
      (html) => { if (live) setParsed({ text, html, failed: null }); },
      (err) => { if (live) setParsed({ text, html: null, failed: err.code || 'failed' }); },
    );
    return () => { live = false; };
  }, [wantsParse, text]);
  const current = parsed.text === text ? parsed : null;
  const loading = wantsParse && !current;
  const failed = wantsParse && current ? current.failed : null;
  // sanitizing is quick and runs here, so switching images on or off does not parse again
  const rendered = useMemo(
    () => (view === 'rendered' && current && current.html ? sanitizeReadme(current.html, { fullName: rec.full_name, branch: rec.default_branch, showImages: imagesOn }) : null), // none in the Raw view, the text is shown as it is
    [view, current, rec.full_name, rec.default_branch, imagesOn],
  );

  // how many images failed to load for the current text and image setting (the count starts again when either changes)
  const imgKey = `${(text || '').length}:${imagesOn}`;
  const [brokenState, setBrokenState] = useState({ key: '', n: 0 });
  const broken = brokenState.key === imgKey ? brokenState.n : 0;

  if (!rec.has_readme) return <EmptyState icon="book" title="No README">This repository does not have a README file. The details above are all the catalog has.</EmptyState>;
  if (!text) return <EmptyState icon="alert" title="README could not be loaded">The record says there is a README but its text is missing from the data. Open the repository on GitHub to read it.</EmptyState>;

  // in-page anchors: README ids carry a "user-content-" prefix (added by the sanitizer), so resolve them inside this box only
  // images are injected as HTML, so their load and error events are caught on the way down (capture) at the container
  const onImgError = (e) => {
    const img = e.target;
    if (img.tagName !== 'IMG' || img.hasAttribute('data-failed')) return;
    img.setAttribute('data-failed', ''); // styled as a labelled box, so a missing picture leaves a trace instead of a hole
    setBrokenState((st) => ({ key: imgKey, n: (st.key === imgKey ? st.n : 0) + 1 }));
  };
  const onImgLoad = (e) => {
    const img = e.target;
    // a big picture may be a logo drawn for a white page (transparent, dark lines): the dark theme gives it a white backdrop
    if (img.tagName === 'IMG' && img.naturalWidth >= 160 && img.naturalHeight >= 48) img.setAttribute('data-large', '');
  };

  const onClick = (e) => {
    const a = e.target.closest?.('a');
    const href = a?.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    e.preventDefault(); // never let a "#" link change the address bar: it would drop the panel's history state
    if (href.length < 2) { box.current?.scrollIntoView({ block: 'start' }); return; }
    let id = href.slice(1);
    try { id = decodeURIComponent(id); } catch { /* keep the raw fragment */ }
    const el = box.current?.querySelector(`#${CSS.escape('user-content-' + id)}`) || box.current?.querySelector(`#${CSS.escape(id)}`);
    el?.scrollIntoView({ block: 'start' });
  };

  return (
    <section className={styles.wrap} aria-label="README">
      <header className={styles.bar}>
        <h2 className={styles.h}><Icon name="book" size={17} /> README</h2>
        {rec.readme_file && rec.readme_file !== 'README.md' && <Chip mono>{rec.readme_file}</Chip>}
        {kind === 'markdown' && (
          <div className={styles.view}>
            <Segmented size="sm" label="README view" value={view} onChange={setView} options={[{ value: 'rendered', label: 'Rendered' }, { value: 'raw', label: 'Raw' }]} />
          </div>
        )}
      </header>

      {kind === 'text' && <p className={styles.note}><Icon name="info" size={15} /> This README is not Markdown ({rec.readme_file}), so it is shown as plain text.</p>}

      {rendered && rendered.images > 0 && (
        <div className={styles.images} role="status">
          <Icon name="image" size={16} />
          {imagesOn ? (
            <>
              <span>{fmtNum(rendered.images)} {rendered.images === 1 ? 'image' : 'images'} loaded from other websites.{broken > 0 && ` ${fmtNum(broken)} could not be loaded (the host may block other sites or the file is gone).`}</span>
              {imagesAlways
                ? <Button size="sm" variant="ghost" onClick={() => setPref('imagesAlways', false)}>Stop always loading</Button>
                : <Button size="sm" variant="ghost" onClick={() => setLoadImages(false)}>Hide images</Button>}
            </>
          ) : (
            <>
              <span>{fmtNum(rendered.images)} {rendered.images === 1 ? 'image is' : 'images are'} not loaded: they come from other websites, which would see your visit.</span>
              <Button size="sm" onClick={() => setLoadImages(true)}>Load images</Button>
              <Button size="sm" variant="ghost" onClick={() => setPref('imagesAlways', true)}>Always load</Button>
            </>
          )}
        </div>
      )}

      {rec.readme_truncated && <p className={styles.cut}><Icon name="alert" size={15} /> README cut here at 100,000 characters. Open on GitHub for the rest.</p>}

      {failed && <p className={styles.note} role="status"><Icon name="info" size={15} /> {failed === 'timeout' ? 'This README is too complex to format quickly' : 'This README could not be formatted'}, so it is shown as plain text.</p>}

      {loading && <ReadmeSkeleton />}
      {!loading && (rendered
        ? <div ref={box} className={styles.md} onClick={onClick} onErrorCapture={onImgError} onLoadCapture={onImgLoad} dangerouslySetInnerHTML={{ __html: rendered.html }} />
        : <pre className={styles.raw}>{text}</pre>)}
    </section>
  );
}
