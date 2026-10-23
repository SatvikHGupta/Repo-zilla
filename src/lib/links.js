// Everything that builds a URL from a repo: GitHub links, avatars, in-app repo routes, safe homepage links.
export const OWNER_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/;
export const REPO_NAME = /^[A-Za-z0-9._-]{1,100}$/;

export const splitName = (fullName) => {
  const i = String(fullName).indexOf('/');
  return i < 0 ? { owner: '', name: String(fullName) } : { owner: fullName.slice(0, i), name: fullName.slice(i + 1) };
};
export const isValidRepoRef = (owner, name) => OWNER_NAME.test(owner || '') && REPO_NAME.test(name || '');
export const githubUrl = (fullName) => `https://github.com/${fullName}`;
export const repoPath = (fullName) => { const { owner, name } = splitName(fullName); return `/repo/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`; };
export const avatarUrl = (owner, size = 64) => `https://github.com/${encodeURIComponent(owner)}.png?size=${size}`;

// homepage fields are free text from GitHub: only http(s) URLs may become links, a bare host gets https://
export function safeHttpUrl(value) {
  const raw = String(value || '').trim();
  if (!raw || raw.length > 500) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : /^[^\s/]+\.[^\s/]+/.test(raw) ? `https://${raw}` : null;
  if (!withScheme) return null;
  try {
    const u = new URL(withScheme);
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : null;
  } catch { return null; }
}
export const displayHost = (url) => { try { return new URL(url).host.replace(/^www\./, ''); } catch { return url; } };
