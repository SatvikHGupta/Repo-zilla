import { useMemo, useRef, useState } from 'react';
import { usePrefs } from '../../store/prefs.store.js';
import { readmeKind, renderReadme } from '../../lib/readme.js';
import { fmtNum } from '../../lib/format.js';
import Segmented from '../ui/Segmented/Segmented.jsx';
import Chip from '../ui/Chip/Chip.jsx';
import Icon from '../ui/Icon/Icon.jsx';
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

  const rendered = useMemo(
    () => (kind === 'markdown' && view === 'rendered' && text ? renderReadme(text, { fullName: rec.full_name, branch: rec.default_branch, showImages: imagesOn }) : null),
    [kind, view, text, rec.full_name, rec.default_branch, imagesOn],
  );

  if (!rec.has_readme) return <EmptyState icon="book" title="No README">This repository does not have a README file. The details above are all the catalog has.</EmptyState>;
  if (!text) return <EmptyState icon="alert" title="README could not be loaded">The record says there is a README but its text is missing from the data. Open the repository on GitHub to read it.</EmptyState>;

  // in-page anchors: README ids carry a "user-content-" prefix (added by the sanitizer), so resolve them inside this box only
  const onClick = (e) => {
    const a = e.target.closest?.('a');
    const href = a?.getAttribute('href');
    if (!href || !href.startsWith('#') || href.length < 2) return;
    e.preventDefault();
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
              <span>{fmtNum(rendered.images)} {rendered.images === 1 ? 'image' : 'images'} loaded from other websites.</span>
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

      {rendered
        ? <div ref={box} className={styles.md} onClick={onClick} dangerouslySetInnerHTML={{ __html: rendered.html }} />
        : <pre className={styles.raw}>{text}</pre>}
    </section>
  );
}
