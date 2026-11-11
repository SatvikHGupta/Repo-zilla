import { useEffect } from 'react';

// "Page | RepoZilla" for every page, and just "RepoZilla" for the home page (no title)
export const pageTitle = (title) => (title ? `${title} | RepoZilla` : 'RepoZilla');

// sets the tab title while mounted and restores the previous one afterwards
export function useDocumentTitle(title) {
  useEffect(() => {
    const prev = document.title;
    document.title = pageTitle(title);
    return () => { document.title = prev; };
  }, [title]);
}
