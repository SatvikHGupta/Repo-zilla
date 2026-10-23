import { useCallback, useRef, useState } from 'react';
import { motion, useDragControls, useIsPresent } from 'motion/react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useModal } from '../../hooks/useModal.js';
import { BP, useMediaQuery } from '../../hooks/useMediaQuery.js';
import { useRepoDetail } from '../../hooks/useCatalog.js';
import { isValidRepoRef } from '../../lib/links.js';
import { useUi } from '../../store/ui.store.js';
import { usePrefs } from '../../store/prefs.store.js';
import { IconButton } from '../ui/Button/Button.jsx';
import Loader, { ReadmeSkeleton } from '../ui/Loader/Loader.jsx';
import { EmptyState, ErrorState } from '../ui/State/State.jsx';
import OpenOnGithub from './OpenOnGithub.jsx';
import RepoDetail, { RepoHead } from './RepoDetail.jsx';
import styles from './RepoPanel.module.css';

// the list the user clicked in passes the slim row and rank along: the header shows at once and the full record is fetched by rank
const readHint = (location, owner, name) => {
  const s = location.state;
  return s && s.row && String(s.row.n).toLowerCase() === `${owner}/${name}`.toLowerCase() ? s : null;
};

function Body({ owner, name, hint, valid, q }) {
  if (!valid || (q.isSuccess && !q.data)) {
    return (
      <EmptyState icon="search" title="Repository not found" action={<Link to={`/search?q=${encodeURIComponent(name || '')}`}>Search for “{name}”</Link>}>
        {owner}/{name} is not in this catalog. It only holds public repositories with 50 or more stars at the time of the snapshot, and the name has to match exactly.
      </EmptyState>
    );
  }
  if (q.isError) return <ErrorState title="Could not load this repository" error={q.error} onRetry={() => q.refetch()} />;
  if (q.isPending) {
    return hint
      ? <><RepoHead fullName={hint.row.n} description={hint.row.d} row={hint.row} /><div className={styles.gap}><ReadmeSkeleton /></div></>
      : <Loader variant="panel" label="Loading repository" />;
  }
  return <RepoDetail rec={q.data} />;
}

const MIN_W = 480, DEFAULT_W = 820;
const maxWidth = () => Math.min(1400, window.innerWidth - 96);
const clampWidth = (w) => Math.max(MIN_W, Math.min(maxWidth(), w));

export default function RepoPanel({ owner, name }) {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useUi((s) => s.toast);
  const savedWidth = usePrefs((s) => s.panelWidth);
  const setPref = usePrefs((s) => s.setPref);
  const [liveWidth, setLiveWidth] = useState(null);
  const controls = useDragControls();
  const sheet = useMediaQuery(BP.sheet);
  const present = useIsPresent();
  const ref = useRef(null);
  const valid = isValidRepoRef(owner, name);
  // read once: while the exit animation runs the location has already changed and the hint would be gone
  const [hint] = useState(() => readHint(location, owner, name));
  const q = useRepoDetail(owner, name, hint?.rank, valid);
  // a repo GitHub no longer serves (gone, legally removed, or moved to another repo) gets no GitHub button
  const offGithub = q.data ? !!q.data.gh_status : !!hint?.row?.g;

  const close = useCallback(() => {
    if (location.state?.background) navigate(-1);
    else navigate('/search', { replace: true });
  }, [location, navigate]);
  useModal(ref, close, present);

  const copy = async () => {
    try { await navigator.clipboard.writeText(`${window.location.origin}/repo/${owner}/${name}`); toast('Link copied'); }
    catch { toast('Could not copy the link', 'error'); }
  };
  const from = sheet ? { y: '100%' } : { x: '100%' };
  const width = clampWidth(liveWidth ?? savedWidth);

  // drag the left edge to resize; the width is saved when the drag ends. Arrow keys and double-click work too.
  const startResize = (e) => {
    e.preventDefault();
    const startX = e.clientX, startW = width;
    let last = startW;
    const move = (ev) => { last = clampWidth(startW + (startX - ev.clientX)); setLiveWidth(last); };
    const up = () => {
      window.removeEventListener('pointermove', move);
      document.body.style.cursor = ''; document.body.style.userSelect = '';
      setPref('panelWidth', last); setLiveWidth(null);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up, { once: true });
    document.body.style.cursor = 'col-resize'; document.body.style.userSelect = 'none';
  };
  const resizeKey = (e) => {
    const step = e.shiftKey ? 96 : 32;
    if (e.key === 'ArrowLeft') { e.preventDefault(); setPref('panelWidth', clampWidth(width + step)); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); setPref('panelWidth', clampWidth(width - step)); }
    else if (e.key === 'Home') { e.preventDefault(); setPref('panelWidth', DEFAULT_W); }
  };
  const onDragEnd = (_e, info) => { if (info.offset.y > 120 || info.velocity.y > 700) close(); };

  return (
    <div className={styles.root}>
      <motion.div className={styles.scrim} onClick={close} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} />
      <motion.aside ref={ref} className={styles.panel} role="dialog" aria-modal="true" aria-label={`${owner}/${name}`} tabIndex={-1}
        style={sheet ? undefined : { '--w': `${width}px` }}
        drag={sheet ? 'y' : false} dragControls={controls} dragListener={false} dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.6 }} onDragEnd={onDragEnd}
        initial={from} animate={{ x: 0, y: 0 }} exit={from} transition={{ duration: 0.28, ease: [0.2, 0, 0, 1] }}>
        {sheet
          ? <div className={styles.grab} onPointerDown={(e) => controls.start(e)} aria-hidden="true"><i /></div>
          : <div className={styles.resizer} role="separator" aria-orientation="vertical" aria-label="Resize panel (arrow keys, double-click to reset)" aria-valuenow={width} aria-valuemin={MIN_W} aria-valuemax={maxWidth()} tabIndex={0} onPointerDown={startResize} onKeyDown={resizeKey} onDoubleClick={() => setPref('panelWidth', DEFAULT_W)}><i /></div>}
        <header className={styles.bar}>
          <IconButton icon="close" label="Close" onClick={close} />
          <p className={styles.crumb}>{owner}/{name}</p>
          <div className={styles.actions}>
            <IconButton icon="link" label="Copy link to this repository" onClick={copy} />
            <OpenOnGithub fullName={`${owner}/${name}`} gone={offGithub} withLabel size="sm" />
          </div>
        </header>
        <div className={styles.scroll}><Body owner={owner} name={name} hint={hint} valid={valid} q={q} /></div>
      </motion.aside>
    </div>
  );
}
