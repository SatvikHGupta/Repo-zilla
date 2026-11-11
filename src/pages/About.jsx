import { Link } from 'react-router-dom';
import LegalPage from '../components/legal/LegalPage.jsx';
import { Callout } from '../components/legal/LegalParts.jsx';
import { useManifest } from '../hooks/useCatalog.js';
import { fmtDate, fmtNum } from '../lib/format.js';

export default function About() {
  const m = useManifest().data;
  const facts = m ? [
    { label: 'Repositories', value: fmtNum(m.repos) },
    { label: 'Snapshot', value: fmtDate(m.snapshot_date) },
    { label: 'Minimum stars', value: fmtNum(m.min_stars ?? 50) },
    ...(Number.isFinite(m.readmes?.ok) ? [{ label: 'With a README', value: fmtNum(m.readmes.ok) }] : []),
  ] : null;

  const sections = [
    {
      id: 'what', title: 'What RepoZilla is',
      content: <>
        <p>RepoZilla is a free, read-only catalog and search for popular public GitHub repositories. There are no accounts, no ads and nothing to install. You can search by words, narrow by language, domain, tag, stars, activity, license and more, and open any repository to read its README here.</p>
      </>,
    },
    {
      id: 'included', title: 'What is in the catalog',
      content: <>
        <p>Only <b>public</b> repositories with <b>50 or more stars</b> at the time of the snapshot{m ? <>: {fmtNum(m.repos)} of them, as of {fmtDate(m.snapshot_date)}</> : null}. Private repositories and anything below 50 stars are not included.</p>
        <p>Each entry carries what GitHub shows publicly: the name and owner, description, main language, license, creation and last-commit dates, stars, forks, topics, and the README text. READMEs longer than 100,000 characters are cut.</p>
      </>,
    },
    {
      id: 'source', title: 'Where the data comes from',
      content: <>
        <p>All of it comes from GitHub’s public data. RepoZilla adds no information of its own except the <a href="#tags">tags and domains</a> described below. The catalog is rebuilt from a fresh snapshot from time to time, and each rebuild replaces the previous one completely. A repository that is no longer public, or no longer has 50 stars, drops out of the next snapshot.</p>
        <Callout>It is a snapshot, not a live view. Stars, forks and activity are frozen at the snapshot date, and a repository may have changed or disappeared since.</Callout>
      </>,
    },
    {
      id: 'tags', title: 'Tags, domains and auto tags',
      content: <>
        <p><b>Real tags</b> come from a repository’s own GitHub topics, mapped to a common vocabulary so that different spellings of the same idea meet in one place. <b>Domains</b> (such as web development or machine learning) group those tags into broad areas, and each domain has subdomains.</p>
        <p>Repositories that have no topics of their own get <b>auto tags</b>: guesses made by a text model from the name, description and README, each with a confidence level. They are always labelled “auto”, they are off by default in counts and lists, and they can be wrong. A domain that exists only because of auto tags is marked as a weak signal.</p>
        <p>A repository can belong to several domains, so domain counts add up to more than the total.</p>
      </>,
    },
    {
      id: 'search', title: 'How search works',
      content: <>
        <p>Searching happens in your browser. It downloads only the pieces of the catalog a query needs and does the matching locally, so there is no RepoZilla server that sees what you type. See <Link to="/privacy">Privacy</Link> for who can still see your requests.</p>
        <ul>
          <li>Search matches <b>whole words</b> from names, descriptions, topics and language, plus a prefix match on the last word you type.</li>
          <li>There is <b>no typo tolerance</b> and no stemming, so “database” does not find “databases”.</li>
          <li>Results start sorted by <b>stars</b>. You can also sort by forks, name, size or creation date.</li>
          <li>Filters combine: choosing several narrows the list. The Random button opens one repository from the list as it is currently filtered.</li>
        </ul>
      </>,
    },
    {
      id: 'limits', title: 'What it cannot tell you',
      content: <>
        <ul>
          <li>Anything newer than the snapshot: current stars, releases, issues or whether a repository is still maintained.</li>
          <li>Contributors, commit counts, watchers, issue lists, language breakdowns or star history.</li>
          <li>A sort by last commit or by recently updated. Last-commit month is shown, but not sortable.</li>
          <li>Whether a project is good, safe or right for you. Stars measure attention, not quality. Check a repository’s license and code yourself before you rely on it.</li>
        </ul>
        <p>Repositories that are no longer on GitHub are flagged in the catalog rather than removed.</p>
      </>,
    },
    {
      id: 'changes', title: 'Changing or removing something',
      content: <>
        <p>The data comes from GitHub, so the most direct way to change or remove it is at the source. The repository owner can edit the description, README or topics, archive the repository, make it private or delete it, and the next snapshot will follow. The <Link to="/terms#removal">Terms</Link> describe this in more detail.</p>
      </>,
    },
    {
      id: 'independent', title: 'Who is behind it',
      content: <>
        <p>RepoZilla is an independent project built and maintained by Satvik Hemant Gupta. It is not affiliated with, endorsed by or sponsored by GitHub, Inc. GitHub is a trademark of its owner.</p>
      </>,
    },
  ];

  return (
    <LegalPage title="About the data" current="/about" facts={facts} sections={sections}
      intro="What is in RepoZilla, where it comes from, how it is searched, and where its limits are." />
  );
}
