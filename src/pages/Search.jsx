import CatalogGate from '../components/layout/CatalogGate.jsx';
import SearchExperience from '../components/search/SearchExperience.jsx';
import BackBar from '../components/ui/BackButton/BackBar.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function Search() {
  useDocumentTitle('Search');
  return <CatalogGate><BackBar fallback="/" /><SearchExperience /></CatalogGate>;
}
