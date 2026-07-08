import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import AppRouter from './AppRouter.jsx'
import { getAllPosts } from './lib/blog.js'

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
    description: 'Data-driven writing on GitHub repos, open source trends, and the dev tools worth paying attention to in 2026 - pulled from our own catalog of 34,787 repositories.',
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
    description: 'Explore 10,035 curated backend GitHub repositories - REST APIs, gRPC, microservices, Express, FastAPI, Django, Spring Boot, Go Gin, Rust Axum, and more. Ranked by stars and activity.',
    og: { type: 'website' },
  },
  '/explore/ai-ml': {
    title: 'Best AI & Machine Learning GitHub Repositories - Repo Zilla',
    description: 'Explore 4,570 curated AI and machine learning GitHub repositories - LLMs, deep learning, computer vision, NLP, PyTorch, TensorFlow, LangChain, and generative AI projects.',
    og: { type: 'website' },
  },
  '/explore/frontend': {
    title: 'Best Frontend GitHub Repositories - Repo Zilla',
    description: 'Explore 4,178 curated frontend GitHub repositories - React, Vue, Angular, Svelte, Next.js, Vite, UI frameworks, component libraries, and web tooling.',
    og: { type: 'website' },
  },
  '/explore/devops': {
    title: 'Best DevOps GitHub Repositories - Repo Zilla',
    description: 'Explore 2,552 curated DevOps GitHub repositories - Docker, Kubernetes, Terraform, Ansible, CI/CD pipelines, monitoring, Helm charts, and infrastructure-as-code.',
    og: { type: 'website' },
  },
  '/explore/js-general': {
    title: 'Best JavaScript GitHub Repositories - Repo Zilla',
    description: 'Explore 3,435 curated JavaScript and TypeScript GitHub repositories - runtimes, utilities, build tools, Node.js packages, and general JS/TS ecosystem projects.',
    og: { type: 'website' },
  },
  '/explore/python': {
    title: 'Best Python GitHub Repositories - Repo Zilla',
    description: 'Explore 1,808 curated Python GitHub repositories - scripts, automation tools, data processing, scientific computing, CLI tools, and general-purpose Python libraries.',
    og: { type: 'website' },
  },
  '/explore/systems': {
    title: 'Best Systems Programming GitHub Repositories - Repo Zilla',
    description: 'Explore 1,611 curated systems programming GitHub repositories - C, C++, Rust, operating systems, compilers, low-level tooling, and performance-critical projects.',
    og: { type: 'website' },
  },
  '/explore/mobile': {
    title: 'Best Mobile GitHub Repositories - Repo Zilla',
    description: 'Explore 1,571 curated mobile GitHub repositories - React Native, Flutter, native iOS and Android, Dart packages, and cross-platform mobile development tools.',
    og: { type: 'website' },
  },
  '/explore/database': {
    title: 'Best Database GitHub Repositories - Repo Zilla',
    description: 'Explore 1,325 curated database GitHub repositories - ORMs, query builders, migration tools, PostgreSQL, MongoDB, Redis, MySQL drivers, and database tooling.',
    og: { type: 'website' },
  },
  '/explore/learning': {
    title: 'Best Learning & Developer Resources on GitHub - Repo Zilla',
    description: 'Explore 1,216 curated developer learning repositories on GitHub - roadmaps, cheatsheets, interview prep, algorithm guides, and structured learning resources.',
    og: { type: 'website' },
  },
  '/explore/auth-security': {
    title: 'Best Auth & Security GitHub Repositories - Repo Zilla',
    description: 'Explore 654 curated authentication and security GitHub repositories - OAuth, JWT, encryption libraries, penetration testing tools, and security frameworks.',
    og: { type: 'website' },
  },
  '/explore/ui-css': {
    title: 'Best UI & CSS GitHub Repositories - Repo Zilla',
    description: 'Explore 802 curated UI and CSS GitHub repositories - component libraries, design systems, icon sets, CSS frameworks, animations, and styling tools.',
    og: { type: 'website' },
  },
  '/explore/fullstack': {
    title: 'Best Fullstack GitHub Repositories - Repo Zilla',
    description: 'Explore 483 curated fullstack GitHub repositories - MERN, MEAN, T3 stack, Next.js fullstack, boilerplates, and complete web application frameworks.',
    og: { type: 'website' },
  },
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
  const meta = ROUTE_META[url] || ROUTE_META['/']
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

  const html = renderToString(
    <MemoryRouter initialEntries={[url]}>
      <AppRouter />
    </MemoryRouter>
  )

  const isExplorePage = url.startsWith('/explore/')
  const exploreSlug = isExplorePage ? url.replace('/explore/', '') : null
  const isBlogPost = url.startsWith('/blog/')
  const blogSlug = isBlogPost ? url.replace('/blog/', '') : null
  const meta = ROUTE_META[url] || ROUTE_META['/']

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
const EXPLORE_SCHEMA_DATA = {
  'backend':       { name: 'Backend Repositories',       desc: 'Curated backend GitHub repositories - REST APIs, microservices, Go, Rust, Java, Python, and Node.js servers.' },
  'ai-ml':         { name: 'AI & ML Repositories',       desc: 'Curated AI and machine learning repositories - LLMs, deep learning, NLP, computer vision, and generative AI.' },
  'frontend':      { name: 'Frontend Repositories',      desc: 'Curated frontend GitHub repositories - React, Vue, Angular, Svelte, Next.js, and UI frameworks.' },
  'devops':        { name: 'DevOps Repositories',        desc: 'Curated DevOps repositories - Docker, Kubernetes, Terraform, CI/CD, and infrastructure-as-code.' },
  'js-general':    { name: 'JavaScript Repositories',    desc: 'Curated JavaScript and TypeScript repositories - runtimes, build tools, and general JS/TS ecosystem.' },
  'python':        { name: 'Python Repositories',        desc: 'Curated Python repositories - automation, data processing, scientific computing, and CLI tools.' },
  'systems':       { name: 'Systems Programming',        desc: 'Curated C, C++, and Rust repositories - OS tooling, compilers, and low-level performance projects.' },
  'mobile':        { name: 'Mobile Repositories',        desc: 'Curated mobile repositories - React Native, Flutter, iOS, Android, and cross-platform tools.' },
  'database':      { name: 'Database Repositories',      desc: 'Curated database repositories - ORMs, query builders, migrations, and database tooling.' },
  'learning':      { name: 'Learning Resources',         desc: 'Curated developer learning repositories - roadmaps, cheatsheets, and interview preparation.' },
  'auth-security': { name: 'Auth & Security',            desc: 'Curated authentication and security repositories - OAuth, JWT, encryption, and pen testing tools.' },
  'ui-css':        { name: 'UI & CSS Repositories',      desc: 'Curated UI and CSS repositories - component libraries, design systems, and styling frameworks.' },
  'fullstack':     { name: 'Fullstack Repositories',     desc: 'Curated fullstack repositories - MERN, T3 stack, Next.js, and complete web application boilerplates.' },
}

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
