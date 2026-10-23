import { Link } from 'react-router-dom';
import LegalPage from '../components/legal/LegalPage.jsx';

export default function Terms() {
  return (
    <LegalPage title="Terms of use" updated="19 October 2026" intro="Plain-language terms for using RepoZilla. By using the site you agree to them.">
      <section>
        <h2>1. What the site is</h2>
        <p>RepoZilla is a free, read-only index of public GitHub repositories. It has no user accounts and does not let you submit content.</p>
      </section>
      <section>
        <h2>2. What is included</h2>
        <p>The catalog only contains <b>public</b> repositories that had <b>50 or more stars</b> when the snapshot was taken. Private repositories are never included. Everything shown is information that was already publicly available on GitHub.</p>
      </section>
      <section>
        <h2>3. Ownership of content</h2>
        <p>Repository names, descriptions, READMEs and other text belong to their authors and stay under the licenses they chose. RepoZilla shows them to help people discover projects and links back to the original on GitHub. Having a repository in the catalog does not grant you any license to it: check the repository’s own license on GitHub before you use its code or text.</p>
      </section>
      <section>
        <h2>4. No guarantees</h2>
        <p>The data is a snapshot and may be out of date, incomplete or wrong. Auto tags and domains inferred from them are automatic guesses. The site is provided as is, without warranty of any kind, and you use it at your own risk. Do not rely on it for security, legal or licensing decisions.</p>
      </section>
      <section>
        <h2>5. Removing or changing content</h2>
        <p>The best way to remove or change something shown here is to <b>ask the repository owner</b>. The owner can edit the description, README or topics, archive the repository, make it private or delete it. The catalog is rebuilt from fresh snapshots, and a repository that is no longer public or no longer has 50 stars will drop out of the next one. When exactly a new snapshot appears is not guaranteed.</p>
      </section>
      <section>
        <h2>6. Fair use of the site</h2>
        <p>The site is free and runs on free hosting. Please do not hammer it with automated requests or try to disrupt it. Links to GitHub and other sites lead to services we do not control.</p>
      </section>
      <section>
        <h2>7. Not affiliated</h2>
        <p>RepoZilla is independent and not affiliated with or endorsed by GitHub, Inc. GitHub is a trademark of its owner.</p>
      </section>
      <section>
        <h2>8. Changes</h2>
        <p>These terms may change. The date at the top shows the latest update. How the site handles data is described in the <Link to="/privacy">Privacy page</Link>.</p>
      </section>
    </LegalPage>
  );
}
