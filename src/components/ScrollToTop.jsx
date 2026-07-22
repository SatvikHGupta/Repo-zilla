import { useEffect } from "react"
import { useLocation } from "react-router-dom"

// React Router doesn't reset scroll on client-side nav like a full page load does
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
