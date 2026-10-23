import { useEffect } from 'react';

// sets the tab title while mounted and restores the previous one afterwards
export function useDocumentTitle(title) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} · RepoZilla` : 'RepoZilla · every public GitHub repo with 50+ stars';
    return () => { document.title = prev; };
  }, [title]);
}
