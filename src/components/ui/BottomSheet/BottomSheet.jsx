import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useDragControls } from 'motion/react';
import { useModal } from '../../../hooks/useModal.js';
import { IconButton } from '../Button/Button.jsx';
import styles from './BottomSheet.module.css';

function Sheet({ onClose, title, children, footer }) {
  const ref = useRef(null);
  useModal(ref, onClose);
  const controls = useDragControls();
  return (
    <div className={styles.root}>
      <motion.div className={styles.scrim} onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} />
      <motion.div ref={ref} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} className={styles.sheet}
        drag="y" dragControls={controls} dragListener={false} dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={(_e, info) => { if (info.offset.y > 110 || info.velocity.y > 700) onClose(); }}
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ duration: 0.26, ease: [0.2, 0, 0, 1] }}>
        <div className={styles.grab} onPointerDown={(e) => controls.start(e)} aria-hidden="true"><i /></div>
        <header className={styles.head}>
          <h2 className={styles.title}>{title}</h2>
          <IconButton icon="close" label="Close" onClick={onClose} />
        </header>
        <div className={styles.body}>{children}</div>
        {footer && <footer className={styles.foot}>{footer}</footer>}
      </motion.div>
    </div>
  );
}

// phone/tablet sheet: slides up from the bottom, scrim closes it, Esc closes it, focus is trapped while open
export default function BottomSheet({ open, onClose, title, children, footer }) {
  return createPortal(
    <AnimatePresence>{open && <Sheet key="sheet" onClose={onClose} title={title} footer={footer}>{children}</Sheet>}</AnimatePresence>,
    document.body,
  );
}
