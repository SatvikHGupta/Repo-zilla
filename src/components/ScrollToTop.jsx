import { useEffect } from "react"
import { useLocation } from "react-router-dom"

// React Router doesn't reset scroll position on client-side navigation the
// way a normal browser page load does - without this, navigating to a new
// page (e.g. an explore/:slug page) opens wherever the previous page had
// scrolled to, instead of at the top.
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
