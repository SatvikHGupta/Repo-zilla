import { Routes, Route, useParams } from "react-router-dom"
import App from "./App.jsx"
import HomePage from "./pages/HomePage.jsx"
import AboutPage from "./pages/AboutPage.jsx"
import PrivacyPage from "./pages/PrivacyPage.jsx"
import ContactPage from "./pages/ContactPage.jsx"
import ExplorePage from "./pages/ExplorePage.jsx"
import NotFoundPage from "./pages/NotFoundPage.jsx"

// wrapper so we can pull the slug from useParams and pass it to ExplorePage
function ExploreRoute() {
  const { slug } = useParams()
  return <ExplorePage slug={slug} />
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
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
