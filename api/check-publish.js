// Vercel Cron hits this daily; only fires the Deploy Hook on days a post's date matches
// today (UTC) - not a daily redeploy. Env vars (set in Vercel dashboard, never committed):
//   DEPLOY_HOOK_URL - Project Settings -> Git -> Deploy Hooks
//   CRON_SECRET     - random string; Vercel echoes it back as the auth header on cron calls

import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// equality check (date === today), not <=, so this only fires the day a post newly publishes
function isPublishingToday(dateStr, today) {
  return !!dateStr && dateStr === today
}

function getTodaysNewlyPublishedSlugs() {
  const dir = resolve(process.cwd(), 'src/content/blog')
  const today = new Date().toISOString().slice(0, 10)

  let files = []
  try {
    files = readdirSync(dir).filter((f) => f.endsWith('.md'))
  } catch {
    return { today, slugs: [], exhausted: false } // content dir missing/unreadable - fail safe, no deploy
  }

  const parsed = files.map((f) => {
    const content = readFileSync(resolve(dir, f), 'utf-8')
    const slugMatch = content.match(/^slug:\s*(.+)$/m)
    const dateMatch = content.match(/^date:\s*(.+)$/m)
    return {
      slug: slugMatch ? slugMatch[1].trim().replace(/^"(.*)"$/, '$1') : null,
      date: dateMatch ? dateMatch[1].trim().replace(/^"(.*)"$/, '$1') : null,
    }
  })

  // cron has no year field, so it can't stop itself past a fixed date - this is the
  // actual stop condition. Once today is past every post's date, this becomes a
  // 1-line comparison and skips the file scan entirely on every future tick.
  const lastScheduledDate = parsed.reduce((max, p) => (p.date && p.date > max ? p.date : max), '')
  if (lastScheduledDate && today > lastScheduledDate) {
    return { today, slugs: [], exhausted: true, lastScheduledDate }
  }

  const slugs = parsed.filter((p) => isPublishingToday(p.date, today)).map((p) => p.slug)
  return { today, slugs, exhausted: false }
}

export default async function handler(req, res) {
  // only Vercel Cron (or someone with CRON_SECRET) can trigger this
  const authHeader = req.headers['authorization'] || ''
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'unauthorized' })
  }

  const { today, slugs, exhausted, lastScheduledDate } = getTodaysNewlyPublishedSlugs()

  if (exhausted) {
    // nothing left to schedule - safe to delete the cron entry from vercel.json now
    return res.status(200).json({ today, published: [], deployed: false, exhausted: true, lastScheduledDate })
  }

  if (slugs.length === 0) {
    return res.status(200).json({ today, published: [], deployed: false })
  }

  if (!process.env.DEPLOY_HOOK_URL) {
    // something is publishing today but there's no way to trigger a redeploy
    return res.status(500).json({
      today,
      published: slugs,
      deployed: false,
      error: 'DEPLOY_HOOK_URL is not set',
    })
  }

  const hookRes = await fetch(process.env.DEPLOY_HOOK_URL, { method: 'POST' })

  return res.status(200).json({
    today,
    published: slugs,
    deployed: hookRes.ok,
    deployHookStatus: hookRes.status,
  })
}
