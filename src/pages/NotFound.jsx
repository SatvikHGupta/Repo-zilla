import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { Button } from '../components/ui/Button/Button.jsx';
import { EmptyState } from '../components/ui/State/State.jsx';

export default function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <EmptyState icon="search" title="Page not found" action={<Button variant="primary" to="/search">Search the catalog</Button>}>
      That address does not lead anywhere. Try the search or go back to the home page.
    </EmptyState>
  );
}
