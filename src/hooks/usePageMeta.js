import { useEffect } from "react"

// keeps document.title/description in sync on client-side nav (prerendered HTML is already correct)
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
