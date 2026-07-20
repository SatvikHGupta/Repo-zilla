import { Link } from "react-router-dom"
import Footer from "../components/Footer.jsx"
import { usePageMeta } from "../hooks/usePageMeta.js"

export default function AboutPage() {
  usePageMeta("About - Repo Zilla", "Learn how Repo Zilla curates and ranks 34,787 GitHub repositories using a composite scoring pipeline.")

  return (
    <div className="static-wrap">
      <div className="static-inner">
        <Link to="/" className="static-back mono">← back</Link>

        <h1 className="static-title">About Repo Zilla</h1>

        <div className="static-content">
          <h2>Why this exists</h2>
          <p>
            Try searching "react form library" on GitHub and you'll get a few thousand results, sorted by whatever GitHub's default is that week. Trending pages reset daily and forget everything the moment you close the tab. Neither is a place you can actually come back to. I got tired of re-discovering the same good repos every few months, so I started keeping a personal list. That list is now <strong>34,787 repositories</strong>, scored and sorted, and Repo Zilla is the result.
          </p>

          <h2>How a repo ends up here</h2>
          <p>
            Everything starts from 57 GitHub Search API queries, each one targeting a specific language, topic, and activity combination, tuned to catch what matters without dragging in the obvious junk. Fresh repos with zero history get filtered out early, and so do ones that have sat untouched since 2019.
          </p>
          <p>
            Every repo that comes back goes through a scoring pass. Stars and forks count, but on a log scale: a repo with 80k stars isn't 8x better than one with 10k, so it shouldn't score that way either. Recent commit activity matters more than raw age. Three or four relevant topics on a repo usually means someone thought about discoverability, and that counts for something too. A missing or one-word description costs points as well; it's a small signal, but it correlates with maintenance quality more often than you'd expect.
          </p>
          <p>
            After scoring, there's a verification pass that drops anything that doesn't clear a minimum bar across those signals combined. It's not perfect, but it keeps the noise out of even the widest tier.
          </p>

          <h2>The four tiers</h2>
          <p>
            Everything's split into four layers, from "everything I collected" down to "the stuff I'd actually recommend":
          </p>
          <ul>
            <li><strong>All</strong>: the full 34,787-repo pool, post-verification</li>
            <li><strong>Verified</strong>: 7,000 repos that cleared every check, ranked by score</li>
            <li><strong>Pinned</strong>: 1,750 of the highest scorers across all categories</li>
            <li><strong>Shelf</strong>: 250 repos, the ones I'd point a friend to first</li>
          </ul>
          <p>
            If you're not sure where to start, Pinned tends to be the sweet spot. It's small enough to actually browse and still big enough to cover almost anything you'd need.
          </p>

          <h2>Your own pins and shelf</h2>
          <p>
            You can pin repos and build your own shelf separately from mine. That data stays local, in your browser's IndexedDB, with no account, no server, and no sync involved. Clear your browser storage and it's gone; that's the tradeoff for not asking you to sign up for anything.
          </p>

          <h2>Who's behind this</h2>
          <p>
            I'm <strong>Satvik Hemant Gupta</strong>, and I work mostly in React and Node. This started as a scratch-my-own-itch project before it turned into something with an actual scoring pipeline. Code's on GitHub if you want to see how the sausage gets made.
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
