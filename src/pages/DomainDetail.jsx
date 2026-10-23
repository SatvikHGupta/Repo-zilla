import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import CatalogGate from '../components/layout/CatalogGate.jsx';
import DomainHero from '../components/domain/DomainHero.jsx';
import SearchExperience from '../components/search/SearchExperience.jsx';
import { EmptyState } from '../components/ui/State/State.jsx';
import { useCatalogMeta } from '../hooks/catalogMeta.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

function DomainBody({ id }) {
  const meta = useCatalogMeta();
  const known = id === meta.fallback || meta.allDomains.some((d) => d.id === id);
  const scope = useMemo(() => ({ domains: [id] }), [id]);
  useDocumentTitle(known ? meta.domainName(id) : 'Domain not found');
  if (!known) {
    return <EmptyState icon="layers" title="Domain not found" action={<Link to="/domains">See all domains</Link>}>There is no domain called “{id}”.</EmptyState>;
  }
  return (
    <>
      <DomainHero id={id} />
      <SearchExperience scope={scope} />
    </>
  );
}

export default function DomainDetail() {
  const { id } = useParams();
  return <CatalogGate><DomainBody id={id} /></CatalogGate>;
}
