// The two rings of the catalog sunburst. The inner ring is the domains. The outer ring is their subdomains, laid out inside the arc of their own domain.
// A repository can sit in several subdomains, so the subdomain counts add up to more than the domain's. To keep the rings lined up, each domain's
// subdomains share the domain's arc in proportion to their counts; the exact count of a subdomain is shown when its domain is opened.

// domains: [{ id, name, count, subs: [{ id, name, count }] }], in the order they should appear (usually biggest first)
// -> { inner: [...domains], outer: [{ id, name, domainId, value, share, whole }] }, where the outer values of a domain add up to the domain's count
// minShare: a subdomain whose arc would be thinner than this share of the whole ring is too thin to see or to point at. Two or more of those in one domain
// are drawn as one arc, "N smaller subdomains" (more: true), so the outer edge is not a fringe of hairlines. They are all there when the domain is opened.
export function buildRings(domains, { minShare = 0 } = {}) {
  const inner = domains.filter((d) => d.count > 0);
  const total = inner.reduce((n, d) => n + d.count, 0);
  const outer = [];
  for (const d of inner) {
    const subs = (d.subs || []).filter((s) => s.count > 0);
    const sum = subs.reduce((n, s) => n + s.count, 0);
    if (!sum) { outer.push({ id: d.id, name: d.name, domainId: d.id, value: d.count, share: 1, whole: true }); continue; } // no subdomains: the domain fills its own arc
    const arcs = [...subs].sort((a, b) => b.count - a.count).map((s) => ({ id: s.id, name: s.name, domainId: d.id, value: (d.count * s.count) / sum, share: s.count / sum, whole: false }));
    const tiny = arcs.filter((a) => a.value < minShare * total);
    if (tiny.length < 2) { outer.push(...arcs); continue; }
    const keep = arcs.filter((a) => !tiny.includes(a));
    const value = tiny.reduce((n, a) => n + a.value, 0), share = tiny.reduce((n, a) => n + a.share, 0);
    if (!keep.length) { outer.push({ id: d.id, name: d.name, domainId: d.id, value: d.count, share: 1, whole: true }); continue; } // nothing big enough: the domain fills its own arc
    outer.push(...keep, { id: `${d.id}~more`, name: `${tiny.length} smaller subdomains`, domainId: d.id, value, share, whole: false, more: true });
  }
  return { inner, outer };
}

// a lighter or darker neighbour of a domain's colour for its j-th subdomain, so neighbouring subdomains can be told apart
export const childColor = (c, j) => ({ ...c, s: Math.max(20, c.s - 8), l: Math.min(82, Math.max(28, c.l + (j % 2 ? -9 : 7))) });
