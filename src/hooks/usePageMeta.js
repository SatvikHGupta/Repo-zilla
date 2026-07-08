import { useEffect } from "react"

// keeps document.title and description in sync on client-side navigation.
// the pre-rendered HTML already has correct tags for each route (SEO-crawlable),
// this just keeps things accurate when the user navigates without a full page load.
export function usePageMeta(title, description) {
  useEffect(() => {
    if (title) document.title = title

    if (description) {
      let tag = document.querySelector('meta[name="description"]')
      if (!tag) {
        tag = document.createElement("meta")
        tag.setAttribute("name", "description")
        document.head.appendChild(tag)
      }
      tag.setAttribute("content", description)
    }
  }, [title, description])
}
