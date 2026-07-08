import { useEffect, useRef } from "react"

// push() must be called client-side after the adsbygoogle script loads.
// each instance handles its own push so units are independent.
export default function AdUnit({ slot, format = "auto", style = {} }) {
  const ref = useRef(null)
  const pushed = useRef(false)

  useEffect(() => {
    if (pushed.current) return
    try {
      // window.adsbygoogle is injected by the script in index.html
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      pushed.current = true
    } catch (e) {
      // script not loaded yet or blocked by an adblocker — silently skip
    }
  }, [])

  return (
    <div className="ad-unit-wrap" style={style}>
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-7868765511569407"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
