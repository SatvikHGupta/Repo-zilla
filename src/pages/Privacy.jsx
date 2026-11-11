import { Link } from 'react-router-dom';
import LegalPage from '../components/legal/LegalPage.jsx';
import { LegalTable } from '../components/legal/LegalParts.jsx';

export default function Privacy() {
  const sections = [
    {
      id: 'collect', title: 'What RepoZilla collects',
      content: <>
        <p>Nothing about you. RepoZilla has no accounts, no sign-up, no forms, no advertising and no analytics or tracking scripts, and its own code sets no cookies. It does not know who you are or what you search for.</p>
      </>,
    },
    {
      id: 'catalog', title: 'What the catalog contains',
      content: <>
        <p>Only public information about <b>public</b> GitHub repositories with <b>50 or more stars</b>: names, descriptions, READMEs, dates, counts and tags. That includes the public user or organization name of each repository’s owner, as shown on GitHub. Nothing private is included, and there is no data about the people who visit the site.</p>
      </>,
    },
    {
      id: 'device', title: 'What stays on your device',
      content: <>
        <p>Your choices are saved in your browser’s local storage, under keys that start with <code>rz-</code>. They never leave your device, and clearing the site’s data removes them.</p>
        <LegalTable label="Settings saved on your device" rows={[
          ['Appearance', 'Light or dark mode and the accent colour.'],
          ['View options', 'Cards or rows, density, results per page, which fields each result shows.'],
          ['Tags', 'Whether auto tags are used, and the width of the repository panel.'],
          ['Images', 'Whether owner avatars load, and whether README images load automatically.'],
        ]} />
      </>,
    },
    {
      id: 'searches', title: 'Your searches',
      content: <>
        <p>Searching happens in your browser, against static data files. Your queries are not sent to a RepoZilla server, because there is none.</p>
        <p>The hosts involved can still see your requests. The app (the website itself) is served by <b>Vercel</b>, and the catalog files are served by <b>Cloudflare Pages</b>. Cloudflare can see <i>which</i> files your browser asks for, and that can hint at what you searched for. RepoZilla does not collect or analyze these requests, but both providers may keep standard server logs, such as IP addresses, under their own policies.</p>
      </>,
    },
    {
      id: 'others', title: 'Other sites your browser contacts',
      content: <>
        <ul>
          <li><b>GitHub</b> serves owner avatars. You can turn them off in the View options, and initials are shown instead.</li>
          <li><b>README images</b> are not loaded by default. If you choose “Load images”, your browser fetches them from whatever websites the README points to, and those sites can see your IP address and browser details. RepoZilla asks the browser not to send a referrer.</li>
          <li><b>Fonts</b> are served by RepoZilla itself, not by a font company.</li>
          <li><b>Links</b> to GitHub, repository homepages and other sites leave RepoZilla. Their own privacy rules apply there.</li>
        </ul>
      </>,
    },
    {
      id: 'choices', title: 'Your choices',
      content: <>
        <ul>
          <li>Clear the site’s data in your browser to remove everything saved on your device.</li>
          <li>Turn off avatars in the View options to stop requests to GitHub for pictures.</li>
          <li>Leave README images off to keep your address from reaching other sites.</li>
        </ul>
      </>,
    },
    {
      id: 'removal', title: 'Information about a repository or its owner',
      content: <>
        <p>The catalog mirrors GitHub. To remove or change information about a repository, ask the repository owner to change it on GitHub, or to make the repository private or delete it. The next snapshot follows the change. See the <Link to="/terms#removal">Terms</Link>, or <Link to="/contact">get in touch</Link> with a question about this page.</p>
      </>,
    },
    {
      id: 'privacy-changes', title: 'Changes to this page',
      content: <>
        <p>If this page changes, the date at the top changes with it. If RepoZilla ever starts to collect anything, it will be described here first.</p>
      </>,
    },
  ];
  return (
    <LegalPage title="Privacy" current="/privacy" updated="10 November 2026" sections={sections}
      summary={[
        'RepoZilla collects no personal data, has no accounts, no analytics and sets no cookies.',
        'Searches run in your browser. Your queries are not sent to a RepoZilla server.',
        'Your view settings are saved only on your device, under keys that start with rz-.',
        'The hosts (Vercel and Cloudflare) and GitHub, for avatars, can see ordinary request information.',
      ]}
      intro="RepoZilla does not collect personal data. Here is exactly what still happens when you use it." />
  );
}
