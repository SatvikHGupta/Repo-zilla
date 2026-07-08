import { Routes, Route, useParams } from "react-router-dom"
import App from "./App.jsx"
import HomePage from "./pages/HomePage.jsx"
import AboutPage from "./pages/AboutPage.jsx"
import PrivacyPage from "./pages/PrivacyPage.jsx"
import ContactPage from "./pages/ContactPage.jsx"
import ExplorePage from "./pages/ExplorePage.jsx"
import BlogPage from "./pages/BlogPage.jsx"
import BlogPostPage from "./pages/BlogPostPage.jsx"
import NotFoundPage from "./pages/NotFoundPage.jsx"

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
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/catalogue" element={<App />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/explore/:slug" element={<ExploreRoute />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogPostRoute />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
