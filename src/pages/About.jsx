import { Link } from 'react-router-dom';
import LegalPage from '../components/legal/LegalPage.jsx';
import { useManifest } from '../hooks/useCatalog.js';
import { fmtDate, fmtNum } from '../lib/format.js';

export default function About() {
  const m = useManifest().data;
  return (
    <LegalPage title="About RepoZilla" intro="A free catalog and search for popular public GitHub repositories. No accounts, no ads, nothing to install.">
      <section>
        <h2>What is in it</h2>
        <p>Only <b>public</b> repositories with <b>50 or more stars</b>{m ? <>: {fmtNum(m.repos)} of them, as of the snapshot of {fmtDate(m.snapshot_date)}</> : null}. Each one has its description, language, license, dates, tags and README text. Private repositories and anything below 50 stars are not in the catalog.</p>
      </section>
      <section>
        <h2>How it works</h2>
        <p>The catalog is a set of static files. Your browser downloads only the pieces a search needs and does the searching locally, so there is no server that sees your queries. Rank is the position when all repositories are sorted by stars.</p>
      </section>
      <section>
        <h2>Tags and auto tags</h2>
        <p>Real tags come from a repository’s own GitHub topics, mapped to a common vocabulary. Repositories without tags get <b>auto tags</b>: generated automatically by a text model to add more detail. They are guesses with a confidence level, always labelled “auto”, and they can be wrong. A domain that exists only because of auto tags is marked as a weak signal.</p>
      </section>
      <section>
        <h2>What it cannot tell you</h2>
        <ul>
          <li>It is a <b>snapshot</b>. Stars, forks and activity are frozen at the snapshot date, and a repository may have changed or disappeared since.</li>
          <li>Results are sorted by <b>stars only</b>. There is no global sort by forks, newest or recently updated.</li>
          <li>Search matches whole words from names, descriptions, topics and language, plus a prefix match on the last word. There is <b>no typo tolerance</b> and no stemming.</li>
          <li>No contributors, commit counts, releases, watchers, issue lists, language breakdowns or star history.</li>
          <li>READMEs longer than 100,000 characters are cut. Repositories no longer on GitHub are flagged, not removed.</li>
        </ul>
      </section>
      <section>
        <h2>Changing or removing something</h2>
        <p>The data comes from GitHub, so the best way to change or remove content is at the source: ask the repository owner. They can edit the description, README or topics, archive the repository, make it private or delete it. See the <Link to="/terms">Terms</Link> for details.</p>
      </section>
      <section>
        <h2>Not affiliated</h2>
        <p>RepoZilla is an independent project and is not affiliated with or endorsed by GitHub, Inc.</p>
      </section>
    </LegalPage>
  );
}
