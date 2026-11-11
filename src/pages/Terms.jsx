import { Link } from 'react-router-dom';
import LegalPage from '../components/legal/LegalPage.jsx';

export default function Terms() {
  const sections = [
    {
      id: 'scope', title: 'Agreement and scope',
      content: <>
        <p>These terms govern your use of RepoZilla, a free, read-only index of public GitHub repositories. By using the site you agree to them. If you do not agree, please do not use the site.</p>
        <p>The terms are written in plain language. They are not legal advice.</p>
      </>,
    },
    {
      id: 'service', title: 'The service',
      content: <>
        <p>RepoZilla lets you search and browse a snapshot of public repositories. It has no user accounts and does not accept submissions. The service is provided free of charge and may change, pause or stop at any time without notice.</p>
      </>,
    },
    {
      id: 'content', title: 'What the catalog contains',
      content: <>
        <p>The catalog only contains <b>public</b> repositories that had <b>50 or more stars</b> when the snapshot was taken. Private repositories are never included. Everything shown was already publicly available on GitHub. <Link to="/about">About the data</Link> explains what each entry holds.</p>
      </>,
    },
    {
      id: 'ownership', title: 'Ownership and licenses',
      content: <>
        <p>Repository names, descriptions, READMEs and other text belong to their authors and remain under the licenses those authors chose. RepoZilla shows this material to help people discover projects, and it links back to the original on GitHub.</p>
        <p><b>Being in the catalog does not give you any license to a repository.</b> Read the license in the repository itself before you copy, modify or redistribute its code or text.</p>
        <p>The RepoZilla website itself, its design and its tags and domains, are the work of its maintainer. You may link to the site freely.</p>
      </>,
    },
    {
      id: 'use', title: 'Acceptable use',
      content: <>
        <p>The site is free and runs on free hosting. Please use it the way a person would. You agree not to:</p>
        <ul>
          <li>send automated or bulk requests, or copy the catalog files in bulk;</li>
          <li>try to disrupt, overload or break into the site or the services behind it;</li>
          <li>use the site to harass people, or to collect personal details about the owners of repositories;</li>
          <li>present RepoZilla’s content as endorsed by RepoZilla, GitHub or any repository owner.</li>
        </ul>
        <p>Access may be limited or blocked for use that causes problems.</p>
      </>,
    },
    {
      id: 'accuracy', title: 'Accuracy and no warranty',
      content: <>
        <p>The data is a snapshot and may be out of date, incomplete or wrong. Auto tags, and domains that come only from them, are automatic guesses. The site is provided <b>as is and as available</b>, without warranty of any kind, express or implied.</p>
        <p>Do not rely on RepoZilla for security, legal, licensing or purchasing decisions. Always check the repository itself.</p>
      </>,
    },
    {
      id: 'liability', title: 'Limitation of liability',
      content: <>
        <p>To the extent the law allows, the maintainer of RepoZilla is not liable for any loss or damage that comes from using the site or from relying on what it shows, including errors in the data and the content of any repository or website it links to. Nothing in these terms limits a right that the law does not allow to be limited.</p>
      </>,
    },
    {
      id: 'removal', title: 'Removing or correcting content',
      content: <>
        <p>The most direct way to remove or change something shown here is to <b>ask the repository owner</b>. The owner can edit the description, README or topics, archive the repository, make it private or delete it. The catalog is rebuilt from fresh snapshots, and a repository that is no longer public, or no longer has 50 stars, drops out of the next one. When exactly a new snapshot appears is not guaranteed.</p>
        <p>Because the catalog mirrors GitHub, fixing the source is also what keeps the correction from coming back. If something is wrong that you cannot fix at the source, <Link to="/contact">write to me</Link>.</p>
      </>,
    },
    {
      id: 'third', title: 'Third-party services and links',
      content: <>
        <p>The site links to GitHub, to repository homepages and to other websites, and it loads owner avatars from GitHub. These are services RepoZilla does not control, and their own terms and privacy rules apply there. <Link to="/privacy">Privacy</Link> lists what your browser contacts.</p>
      </>,
    },
    {
      id: 'independence', title: 'Independence and trademarks',
      content: <>
        <p>RepoZilla is independent and is not affiliated with, endorsed by or sponsored by GitHub, Inc. GitHub and other names are trademarks of their owners and are used only to say what the data is about.</p>
      </>,
    },
    {
      id: 'terms-changes', title: 'Changes to these terms',
      content: <>
        <p>The terms may change as the site changes. The date at the top shows the latest update, and using the site after a change means you accept the new version. How the site handles data is described on the <Link to="/privacy">Privacy page</Link>.</p>
      </>,
    },
  ];
  return (
    <LegalPage title="Terms of use" current="/terms" updated="10 November 2026" sections={sections}
      summary={[
        'RepoZilla is a free, read-only index of public GitHub repositories with 50 or more stars.',
        'Content belongs to its authors. Being listed gives you no license: check each repository’s own license.',
        'The data is a snapshot and can be wrong or out of date. Do not rely on it for important decisions.',
        'To remove or correct something, change it at the source on GitHub. The next snapshot follows.',
      ]}
      intro="The rules for using RepoZilla, in plain language." />
  );
}
