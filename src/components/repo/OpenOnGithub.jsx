import { IconButton, Button } from '../ui/Button/Button.jsx';
import { githubUrl } from '../../lib/links.js';

// the arrow button every repo gets: opens the repository on GitHub in a new tab. Hidden for repos that are no longer on GitHub.
export default function OpenOnGithub({ fullName, gone = false, withLabel = false, size = 'md' }) {
  if (gone) return null;
  const common = { href: githubUrl(fullName), target: '_blank', rel: 'noopener noreferrer' };
  if (withLabel) return <Button variant="secondary" size={size} iconRight="arrowUpRight" {...common} aria-label={`Open ${fullName} on GitHub in a new tab`}>Open on GitHub</Button>;
  return <IconButton icon="arrowUpRight" label={`Open ${fullName} on GitHub (new tab)`} variant="secondary" size={size} {...common} />;
}
