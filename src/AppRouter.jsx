import { Routes, Route, useParams } from "react-router-dom"
import App from "./App.jsx"
import Footer from "./components/Footer.jsx"
import ScrollToTop from "./components/ScrollToTop.jsx"
import HomePage from "./pages/HomePage.jsx"
import AboutPage from "./pages/AboutPage.jsx"
import PrivacyPage from "./pages/PrivacyPage.jsx"
import ContactPage from "./pages/ContactPage.jsx"
import ExplorePage from "./pages/ExplorePage.jsx"
import BlogPage from "./pages/BlogPage.jsx"
import BlogPostPage from "./pages/BlogPostPage.jsx"
import NotFoundPage from "./pages/NotFoundPage.jsx"

// NOTE: route-level React.lazy()/Suspense code-splitting was tried here and
// reverted. This project's prerendering (src/prerender.jsx) uses React's
// synchronous `renderToString`, which does not wait for lazy chunks to
// resolve - it serializes whatever is in the Suspense fallback. With lazy
// routes, every prerendered page except "/" came out as an empty loading
// screen instead of real content, which would have been an SEO regression,
// not an improvement. Fixing that properly means switching the prerender
// pipeline to a streaming render API (renderToPipeableStream + onAllReady),
// which is a real change to src/prerender.jsx's rendering strategy, not a
// one-line fix - out of scope for this pass. Static imports stay for now.

// wrapper so App's fixed-100vh layout shares the viewport with the footer via
// flex instead of App claiming a rigid 100vh and the footer pushing the page
// taller underneath it - that combo was producing two scrollbars at once
// (the page's own, to reach the footer, plus App's own internal repo-grid
// scrollbar) instead of just the one.
function CataloguePage() {
  return (
    <div className="catalogue-wrap">
      <App />
      <Footer />
    </div>
  )
}

// wrapper so we can pull the slug from useParams and pass it to ExplorePage
function ExploreRoute() {
  const { slug } = useParams()
  return <ExplorePage slug={slug} />
}

// wrapper so we can pull the slug from useParams and pass it to BlogPostPage
function BlogPostRoute() {
  const { slug } = useParams()
  return <BlogPostPage slug={slug} />
}

export default function AppRouter() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalogue" element={<CataloguePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/explore/:slug" element={<ExploreRoute />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostRoute />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}
