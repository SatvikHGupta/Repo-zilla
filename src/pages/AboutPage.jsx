import { useNavigate } from "react-router-dom"
import Footer from "../components/Footer.jsx"
import { usePageMeta } from "../hooks/usePageMeta.js"

export default function AboutPage() {
  const navigate = useNavigate()
  usePageMeta("About - Repo Zilla", "Learn how Repo Zilla curates and ranks 34,787 GitHub repositories using a composite scoring pipeline.")

  return (
    <div className="static-wrap">
      <div className="static-inner">
        <button className="static-back mono" onClick={() => navigate("/")}>← back</button>

        <h1 className="static-title">About Repo Zilla</h1>

        <div className="static-content">
          <h2>Why this exists</h2>
          <p>
            Try searching "react form library" on GitHub and you'll get a few thousand results, sorted by whatever GitHub's default is that week. Trending pages reset daily and forget everything the moment you close the tab. Neither is a place you can actually come back to. I got tired of re-discovering the same good repos every few months, so I started keeping a personal list. That list is now <strong>34,787 repositories</strong>, scored and sorted, and Repo Zilla is the result.
          </p>

          <h2>How a repo ends up here</h2>
          <p>
            Everything starts from 57 GitHub Search API queries, each targeting a specific language/topic/activity combination - broad enough to catch most of what matters, narrow enough to skip the obvious junk. I'm not interested in repos that popped up last week with zero history, and I'm not interested in ones nobody's touched since 2019 either.
          </p>
          <p>
            Every repo that comes back goes through a scoring pass. Stars and forks count, but they're log-scaled - a repo with 80k stars isn't 8x better than one with 10k, so it shouldn't be scored that way. Recent commit activity matters more than raw age. A repo tagged with three or four relevant topics tells me someone actually thought about discoverability, so that's worth something too. And if the description is one word or missing entirely, that repo loses points - it's a small thing, but it correlates with maintenance quality more often than you'd expect.
          </p>
          <p>
            After scoring, there's a verification pass that drops anything that doesn't clear a minimum bar across those signals combined. It's not perfect, but it keeps the noise out of even the widest tier.
          </p>

          <h2>The four tiers</h2>
          <p>
            Everything's split into four layers, from "everything I collected" down to "the stuff I'd actually recommend":
          </p>
          <ul>
            <li><strong>All</strong> - the full 34,787-repo pool, post-verification</li>
            <li><strong>Verified</strong> - 7,000 repos that cleared every check, ranked by score</li>
            <li><strong>Pinned</strong> - 1,750 of the highest scorers across all categories</li>
            <li><strong>Shelf</strong> - 250 repos, the ones I'd point a friend to first</li>
          </ul>
          <p>
            If you're not sure where to start, Pinned is the sweet spot - small enough to actually browse, big enough to cover almost anything you'd need.
          </p>

          <h2>Your own pins and shelf</h2>
          <p>
            You can pin repos and build your own shelf separately from mine. That data lives in your browser's IndexedDB only - no account, no server, no sync. Clear your browser storage and it's gone; that's the tradeoff for not asking you to sign up for anything.
          </p>

          <h2>Who's behind this</h2>
          <p>
            I'm <strong>Satvik Hemant Gupta</strong> - I work mostly in React and Node, and this started as a scratch-my-own-itch project before it turned into something with an actual scoring pipeline. Code's on GitHub if you want to see how the sausage gets made.
          </p>
          <a
            className="hp-btn-primary static-cta"
            href="https://github.com/SatvikHGupta"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub - SatvikHGupta ↗
          </a>
        </div>
      </div>
      <Footer />
    </div>
  )
}
