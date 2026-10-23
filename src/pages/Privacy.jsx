import { Link } from 'react-router-dom';
import LegalPage from '../components/legal/LegalPage.jsx';

export default function Privacy() {
  return (
    <LegalPage title="Privacy" updated="19 October 2026" intro="RepoZilla has no accounts and does not collect personal data itself. Here is what still happens when you use it.">
      <section>
        <h2>What the catalog contains</h2>
        <p>Only public information about <b>public</b> GitHub repositories with <b>50 or more stars</b>: names, descriptions, READMEs, dates, counts and tags. Nothing private, and no data about the people who visit the site.</p>
      </section>
      <section>
        <h2>What stays on your device</h2>
        <p>Your theme and view choices (mode, accent, layout, density, page size, visible fields, avatar and image settings) are saved in your browser’s local storage under keys starting with <code>rz-</code>. They never leave your device. Clearing site data removes them. RepoZilla’s own code sets no cookies.</p>
      </section>
      <section>
        <h2>Your searches</h2>
        <p>Searching happens in your browser against static data files. Your queries are not sent to a RepoZilla server. Be aware that the host serving those files can see <i>which</i> files your browser requests, which can hint at what you searched for. RepoZilla does not collect or analyze these requests, but the hosting provider (Cloudflare Pages) may keep standard server logs, such as IP addresses.</p>
      </section>
      <section>
        <h2>Other websites your browser contacts</h2>
        <ul>
          <li><b>GitHub</b> serves owner avatars. You can turn them off in the View options, which shows initials instead.</li>
          <li><b>README images</b> are not loaded by default. If you choose “Load images”, your browser fetches them from whatever websites the README points to, and those sites can see your IP address and browser details. RepoZilla asks the browser not to send a referrer.</li>
          <li><b>Links</b> to GitHub, repository homepages and other sites leave RepoZilla. Their own privacy rules apply there.</li>
        </ul>
      </section>
      <section>
        <h2>Removing information about a repository</h2>
        <p>The catalog mirrors GitHub. To remove or change information about a repository, ask the repository owner to change it at the source. See the <Link to="/terms">Terms</Link>.</p>
      </section>
      <section>
        <h2>Changes</h2>
        <p>If this page changes, the date at the top changes with it.</p>
      </section>
    </LegalPage>
  );
}
