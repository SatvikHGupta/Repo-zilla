import { useNavigate } from "react-router-dom"
import Footer from "../components/Footer.jsx"
import { usePageMeta } from "../hooks/usePageMeta.js"

export default function PrivacyPage() {
  const navigate = useNavigate()
  usePageMeta("Privacy Policy - Repo Zilla", "Repo Zilla privacy policy. We collect no personal data. Pins and shelf preferences are stored locally in your browser.")

  return (
    <div className="static-wrap">
      <div className="static-inner">
        <button className="static-back mono" onClick={() => navigate("/")}>← back</button>

        <h1 className="static-title">Privacy Policy</h1>
        <p className="static-meta mono">Last updated: July 2026</p>

        <div className="static-content">
          <h2>The short version</h2>
          <p>
            Repo Zilla doesn't have a backend, doesn't have accounts, and doesn't run its own analytics. There's nowhere for your data to go because there's no server collecting it. The only third party involved is Google AdSense, and this page covers exactly what that means for you.
          </p>

          <h2>What I collect</h2>
          <p>
            Nothing. No name, no email, no IP logging on my end, no tracking pixels I control. I genuinely can't tell you who's using this site beyond whatever AdSense reports in aggregate.
          </p>

          <h2>What's stored on your device</h2>
          <p>
            Pinning a repo or adding it to your shelf saves that choice to your browser's IndexedDB - nothing leaves your machine. It's how the app remembers your preferences without needing a login. Clear your site data and those preferences are gone; there's no backup anywhere else, so that's a real tradeoff to be aware of.
          </p>

          <h2>Fetching READMEs from GitHub</h2>
          <p>
            When you open a repo's detail panel, your browser fetches the README directly from <code>raw.githubusercontent.com</code>. That request goes straight from you to GitHub - it doesn't pass through any server of mine, and I don't see or log it. GitHub's privacy policy covers that part, not this one.
          </p>

          <h2>Google AdSense</h2>
          <p>
            This site runs ads through Google AdSense, which uses cookies to serve ads based on your browsing history across sites, not just this one. That's Google's system, not something I built or control.
          </p>
          <p>
            You can turn off personalized ads through{" "}
            <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
              Google Ads Settings
            </a>
            , or opt out more broadly at{" "}
            <a href="http://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">
              aboutads.info
            </a>
            .
          </p>

          <h2>Cookies</h2>
          <p>
            I don't set any cookies myself. Whatever AdSense sets is on Google, per the section above.
          </p>

          <h2>Links to other sites</h2>
          <p>
            Every repo card links out to GitHub. The moment you click through, you're off this site and this policy stops applying - I have no say in how GitHub or anyone else handles your data once you leave.
          </p>

          <h2>If this policy changes</h2>
          <p>
            I'll update the date at the top of this page whenever something here changes. No separate changelog, just check the date.
          </p>

          <h2>Questions</h2>
          <p>
            Reach out through the{" "}
            <a href="/contact">Contact page</a> if anything here needs clarifying.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
