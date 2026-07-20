import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import AppRouter from './AppRouter.jsx'
import { getAllPosts, getPostBody } from './lib/blog.js'
import { CATEGORIES } from './data/categories.js'

// A note on why this file must never contain unpublished-post data:
// vite-prerender-plugin adds this file as a real build input alongside the
// client entry (so it can execute it during the build), and because it
// shares module graph with the client entry (both import AppRouter.jsx),
// Vite's preload-hint generator injects a <link rel="modulepreload"> for
// this file's own chunk into EVERY prerendered HTML page - meaning every
// visitor's browser proactively fetches it. That's harmless for the public
// route metadata this file builds, but it means anything this file imports
// is effectively public the moment it's deployed.
//
// (fs-based reads were tried here as an alternative to importing blog.js at
// all, to sidestep this - but Vite bundles this file through its *client*
// build pipeline, which externalizes node:fs/node:path/node:url rather than
// providing real implementations, and the build fails outright. So the fix
// has to be "make the data itself safe," not "avoid importing it here":
// src/lib/blog-meta.generated.json - which blog.js imports, and which this
// file transitively pulls in via getAllPosts()/getPostBody() below - is now
// filtered to already-published posts at generation time, in vite.config.js.
// See the comment there for what that trades off.)
const BLOG_POSTS = getAllPosts()

// per-route meta - title, description, canonical, OG tags
// these get injected into <head> of each pre-rendered HTML file
const ROUTE_META = {
  '/404': {
    title: '404 - Repo Zilla',
    description: "This page doesn't exist. Browse the Repo Zilla catalogue of 34,787 curated GitHub repositories instead.",
    og: { type: 'website' },
    noindex: true,
  },
  '/blog': {
    title: 'Blog - Repo Zilla',
    description: 'Data-driven writing on GitHub repos, open source trends, and the dev tools worth paying attention to in 2026, pulled straight from our catalog of 34,787 repositories.',
    og: { type: 'website' },
  },
  '/': {
    title: 'Repo Zilla - Curated GitHub Repository Catalog',
    description: 'Browse 34,787 curated GitHub repositories ranked by stars, forks, and activity. Filter by language, project type, and category. Find the best open source tools instantly.',
    og: { type: 'website' },
  },
  '/about': {
    title: 'About - Repo Zilla',
    description: 'Learn how Repo Zilla curates and ranks 34,787 GitHub repositories using a composite scoring pipeline. About the developer and the four-layer curation system.',
    og: { type: 'website' },
  },
  '/privacy': {
    title: 'Privacy Policy - Repo Zilla',
    description: 'Repo Zilla privacy policy. We collect no personal data. Pins and shelf preferences are stored locally in your browser.',
    og: { type: 'website' },
  },
  '/contact': {
    title: 'Contact - Repo Zilla',
    description: 'Contact Repo Zilla developer Satvik Hemant Gupta on GitHub.',
    og: { type: 'website' },
  },
  '/explore/backend': {
    title: 'Best Backend GitHub Repositories - Repo Zilla',
    description: 'Explore 10,035 curated backend GitHub repositories: REST APIs, gRPC, microservices, Express, FastAPI, Django, Spring Boot, Go Gin, Rust Axum, and more. Ranked by stars and activity.',
    og: { type: 'website' },
  },
}

// every /explore/:slug route gets its route meta generated from the shared
// category data (src/data/categories.js) - no manual edit needed here when
// a category's copy or count changes, or a new category is added
for (const cat of CATEGORIES) {
  if (cat.slug === 'backend') continue // already set above with its own key
  ROUTE_META[`/explore/${cat.slug}`] = {
    title: cat.metaTitle,
    description: cat.metaDesc,
    og: { type: 'website' },
  }
}

// every blog post gets its own route meta generated from its frontmatter -
// no manual edit needed here when a new post is added
for (const post of BLOG_POSTS) {
  ROUTE_META[`/blog/${post.slug}`] = {
    title: `${post.title} - Repo Zilla Blog`,
    description: post.excerpt,
    og: { type: 'article' },
  }
}

const BASE_URL = 'https://repo-zilla.vercel.app'

function buildHeadElements(url) {
  const fallback = url.startsWith('/blog/') ? ROUTE_META['/404'] : ROUTE_META['/']
  const meta = ROUTE_META[url] || fallback
  const canonical = `${BASE_URL}${url}`

  const elements = new Set([
    { type: 'meta', props: { name: 'description', content: meta.description } },
    { type: 'link', props: { rel: 'canonical', href: canonical } },
    { type: 'meta', props: { property: 'og:title', content: meta.title } },
    { type: 'meta', props: { property: 'og:description', content: meta.description } },
    { type: 'meta', props: { property: 'og:url', content: canonical } },
    { type: 'meta', props: { property: 'og:type', content: meta.og?.type || 'website' } },
    { type: 'meta', props: { property: 'og:image', content: `${BASE_URL}/icon.png` } },
    { type: 'meta', props: { property: 'og:site_name', content: 'Repo Zilla' } },
    { type: 'meta', props: { name: 'twitter:card', content: 'summary' } },
    { type: 'meta', props: { name: 'twitter:title', content: meta.title } },
    { type: 'meta', props: { name: 'twitter:description', content: meta.description } },
    { type: 'meta', props: { name: 'twitter:image', content: `${BASE_URL}/icon.png` } },
  ])

  if (meta.noindex) {
    elements.add({ type: 'meta', props: { name: 'robots', content: 'noindex, follow' } })
  }

  return elements
}

export async function prerender(data) {
  const url = data.url || '/'
  const isBlogPost = url.startsWith('/blog/')
  const blogSlug = isBlogPost ? url.replace('/blog/', '') : null

  // Body loading is lazy/code-split (see src/lib/blog.js) so BlogPostPage
  // can't rely on it being available synchronously during renderToString,
  // which doesn't wait for async effects. Pre-fetch it into the shared
  // cache here first - only happens for slugs getAllPosts() actually
  // returned, i.e. already-published ones, so an unpublished post's body
  // chunk is never touched during the build at all.
  if (blogSlug && BLOG_POSTS.some((p) => p.slug === blogSlug)) {
    await getPostBody(blogSlug)
  }

  const html = renderToString(
    <MemoryRouter initialEntries={[url]}>
      <AppRouter />
    </MemoryRouter>
  )

  const isExplorePage = url.startsWith('/explore/')
  const exploreSlug = isExplorePage ? url.replace('/explore/', '') : null
  const fallback = isBlogPost ? ROUTE_META['/404'] : ROUTE_META['/']
  const meta = ROUTE_META[url] || fallback

  // JSON-LD structured data - per-route
  const jsonLd = buildJsonLd(url, exploreSlug, blogSlug)
  const headElements = buildHeadElements(url)

  if (jsonLd) {
    headElements.add({
      type: 'script',
      props: { type: 'application/ld+json', children: JSON.stringify(jsonLd) },
    })
  }

  return {
    html,
    head: {
      lang: 'en',
      title: meta.title,
      elements: headElements,
    },
  }
}

// ---- JSON-LD per route ----
const EXPLORE_SCHEMA_DATA = Object.fromEntries(
  CATEGORIES.map((cat) => [cat.slug, { name: `${cat.headline} Repositories`, desc: cat.metaDesc }])
)

function buildJsonLd(url, exploreSlug, blogSlug) {
  if (url === '/') {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Repo Zilla',
      url: 'https://repo-zilla.vercel.app',
      description: 'Curated catalog of 34,787 GitHub repositories ranked by stars, forks, and activity.',
      author: {
        '@type': 'Person',
        name: 'Satvik Hemant Gupta',
        url: 'https://github.com/SatvikHGupta',
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://repo-zilla.vercel.app/catalogue?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    }
  }

  if (url === '/blog') {
    return {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'Repo Zilla Blog',
      url: 'https://repo-zilla.vercel.app/blog',
      description: 'Data-driven writing on GitHub repos, open source trends, and dev tooling, built on our own catalog of 34,787 repositories.',
      isPartOf: {
        '@type': 'WebSite',
        name: 'Repo Zilla',
        url: 'https://repo-zilla.vercel.app',
      },
      author: {
        '@type': 'Person',
        name: 'Satvik Hemant Gupta',
        url: 'https://github.com/SatvikHGupta',
      },
      blogPost: BLOG_POSTS.map((p) => ({
        '@type': 'BlogPosting',
        headline: p.title,
        url: `https://repo-zilla.vercel.app/blog/${p.slug}`,
        datePublished: p.date,
      })),
    }
  }

  if (blogSlug) {
    const post = BLOG_POSTS.find((p) => p.slug === blogSlug)
    if (post) {
      return {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        url: `https://repo-zilla.vercel.app/blog/${post.slug}`,
        datePublished: post.date,
        dateModified: post.date,
        author: {
          '@type': 'Person',
          name: 'Satvik Hemant Gupta',
          url: 'https://github.com/SatvikHGupta',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Repo Zilla',
          logo: {
            '@type': 'ImageObject',
            url: 'https://repo-zilla.vercel.app/icon.png',
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `https://repo-zilla.vercel.app/blog/${post.slug}`,
        },
        keywords: post.tags.join(', '),
        isPartOf: {
          '@type': 'Blog',
          name: 'Repo Zilla Blog',
          url: 'https://repo-zilla.vercel.app/blog',
        },
      }
    }
  }

  if (exploreSlug && EXPLORE_SCHEMA_DATA[exploreSlug]) {
    const data = EXPLORE_SCHEMA_DATA[exploreSlug]
    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: data.name,
      description: data.desc,
      url: `https://repo-zilla.vercel.app/explore/${exploreSlug}`,
      isPartOf: {
        '@type': 'WebSite',
        name: 'Repo Zilla',
        url: 'https://repo-zilla.vercel.app',
      },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://repo-zilla.vercel.app' },
          { '@type': 'ListItem', position: 2, name: data.name, item: `https://repo-zilla.vercel.app/explore/${exploreSlug}` },
        ],
      },
    }
  }

  if (url === '/about') {
    return {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'About Repo Zilla',
      description: 'How Repo Zilla curates and ranks GitHub repositories using a composite scoring pipeline.',
      url: 'https://repo-zilla.vercel.app/about',
    }
  }

  return null
}
