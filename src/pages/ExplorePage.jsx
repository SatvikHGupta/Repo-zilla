import { useState } from "react"
import { useNavigate } from "react-router-dom"
import App from "../App.jsx"
import Footer from "../components/Footer.jsx"
import { usePageMeta } from "../hooks/usePageMeta.js"
import NotFoundPage from "./NotFoundPage.jsx"

// map slug → all the content for each explore page
const EXPLORE_DATA = {
  backend: {
    type: "Backend",
    title: "Best Backend GitHub Repositories",
    metaTitle: "Best Backend GitHub Repositories - Repo Zilla",
    metaDesc: "Explore 10,035 curated backend GitHub repositories - REST APIs, gRPC, microservices, Express, FastAPI, Django, Spring Boot, Go Gin, Rust Axum, and more.",
    count: 10035,
    headline: "Backend Development",
    tagline: "APIs, servers, microservices, frameworks",
    intro: "Backend development covers every layer between the database and the client - HTTP servers, RPC frameworks, authentication, message queues, and the glue that holds distributed systems together. This collection spans the full spectrum: lightweight Express and Fastify for Node.js, high-performance Gin and Fiber for Go, async FastAPI and Django for Python, battle-tested Spring Boot for Java, and Axum for Rust. Whether you're building a REST API, a GraphQL server, or a gRPC microservice, you'll find ranked references here.",
    highlights: [
      "Go frameworks - Gin, Fiber, Echo ranked by production adoption and GitHub stars",
      "Python backends - FastAPI, Django REST Framework, Flask extensions",
      "Node.js - Express, Fastify, NestJS, Hono",
      "Rust - Axum, Actix-web, Warp for high-performance services",
      "Java/Kotlin - Spring Boot, Micronaut, Quarkus",
      "Microservices tooling - service meshes, API gateways, message brokers",
    ],
  },
  "ai-ml": {
    type: "AI/ML",
    title: "Best AI & Machine Learning GitHub Repositories",
    metaTitle: "Best AI & Machine Learning GitHub Repositories - Repo Zilla",
    metaDesc: "Explore 4,570 curated AI and ML GitHub repositories - LLMs, deep learning, NLP, PyTorch, TensorFlow, LangChain, and generative AI projects.",
    count: 4570,
    headline: "Artificial Intelligence & Machine Learning",
    tagline: "LLMs, deep learning, NLP, computer vision",
    intro: "The AI/ML ecosystem on GitHub has exploded in the past three years. This collection covers the entire stack: foundational frameworks like PyTorch and TensorFlow, LLM tooling like LangChain, LlamaIndex, and Ollama, fine-tuning utilities, vector databases, computer vision pipelines, NLP libraries, and production ML infrastructure. Ranked by stars, forks, and recent commit activity so the actively maintained projects surface first.",
    highlights: [
      "LLM frameworks - LangChain, LlamaIndex, Haystack, AutoGen",
      "Model inference - Ollama, vLLM, llama.cpp, text-generation-webui",
      "Training frameworks - PyTorch Lightning, Hugging Face Transformers",
      "Computer vision - YOLO, OpenCV, Detectron2, SAM",
      "Vector databases and embeddings - Chroma, Weaviate, FAISS",
      "MLOps - MLflow, DVC, Weights & Biases integrations",
    ],
  },
  frontend: {
    type: "Frontend",
    title: "Best Frontend GitHub Repositories",
    metaTitle: "Best Frontend GitHub Repositories - Repo Zilla",
    metaDesc: "Explore 4,178 curated frontend GitHub repositories - React, Vue, Angular, Svelte, Next.js, Vite, UI frameworks, and web tooling.",
    count: 4178,
    headline: "Frontend Development",
    tagline: "React, Vue, Angular, Svelte, build tools",
    intro: "Frontend development is one of the fastest-moving areas in software. This collection covers the major frameworks and their ecosystems - React libraries and hooks, Vue plugins, Angular utilities, Svelte packages - alongside the build tooling, state management solutions, routing libraries, and testing utilities that power modern web applications. Next.js, Nuxt, Remix, and SvelteKit are all represented here alongside framework-agnostic tools like Vite, Rollup, and esbuild.",
    highlights: [
      "React ecosystem - hooks libraries, state management, form libraries, data fetching",
      "Meta-frameworks - Next.js, Remix, Nuxt, SvelteKit, Astro",
      "Build tools - Vite, Rollup, esbuild, Turbopack, Parcel",
      "Testing - Vitest, Playwright, Cypress, Testing Library",
      "Vue 3 - Pinia, VueUse, Vuelidate, Nuxt modules",
      "Animation and interaction - GSAP integrations, scroll libraries",
    ],
  },
  devops: {
    type: "DevOps",
    title: "Best DevOps GitHub Repositories",
    metaTitle: "Best DevOps GitHub Repositories - Repo Zilla",
    metaDesc: "Explore 2,552 curated DevOps GitHub repositories - Docker, Kubernetes, Terraform, Ansible, CI/CD, monitoring, and infrastructure-as-code.",
    count: 2552,
    headline: "DevOps & Infrastructure",
    tagline: "Docker, Kubernetes, Terraform, CI/CD",
    intro: "Modern DevOps tooling has shifted massively toward Kubernetes-native and infrastructure-as-code patterns. This collection covers container orchestration, infrastructure provisioning, configuration management, observability, and CI/CD pipelines. From Terraform modules and Helm charts to Prometheus exporters and custom Kubernetes operators, these are the most-starred, actively maintained tools across the DevOps ecosystem.",
    highlights: [
      "Container orchestration - Kubernetes tools, operators, Helm charts",
      "Infrastructure as code - Terraform providers, Pulumi programs, CDK constructs",
      "CI/CD - GitHub Actions, ArgoCD, Flux, Tekton pipelines",
      "Observability - Prometheus, Grafana dashboards, OpenTelemetry",
      "Configuration management - Ansible roles, Salt, Chef cookbooks",
      "Docker - compose templates, Docker-in-Docker patterns, registry tools",
    ],
  },
  "js-general": {
    type: "JS/General",
    title: "Best JavaScript & TypeScript GitHub Repositories",
    metaTitle: "Best JavaScript & TypeScript GitHub Repositories - Repo Zilla",
    metaDesc: "Explore 3,435 curated JavaScript and TypeScript GitHub repositories - utilities, runtimes, build tools, and general-purpose packages.",
    count: 3435,
    headline: "JavaScript & TypeScript",
    tagline: "Utilities, runtimes, tooling, general JS/TS",
    intro: "Beyond the major frameworks, the JavaScript and TypeScript ecosystem contains thousands of high-quality utility libraries, developer tools, runtimes, and general-purpose packages. This collection surfaces the best of them - date manipulation, validation schemas, testing utilities, CLI builders, code formatters, type utilities, and everything else that makes the JS/TS ecosystem as productive as it is.",
    highlights: [
      "Utility libraries - Lodash, date-fns, Zod, Yup, Joi",
      "Runtimes - Deno, Bun, Node.js utilities",
      "CLI tooling - Inquirer, Commander, Chalk, Ora",
      "Type utilities - ts-toolbelt, utility-types, type-fest",
      "Code quality - ESLint plugins, Prettier configs, lint-staged",
      "Monorepo tools - Turborepo, Nx, Changesets",
    ],
  },
  python: {
    type: "Python/General",
    title: "Best Python GitHub Repositories",
    metaTitle: "Best Python GitHub Repositories - Repo Zilla",
    metaDesc: "Explore 1,808 curated Python GitHub repositories - automation, data processing, scientific computing, and general-purpose libraries.",
    count: 1808,
    headline: "Python",
    tagline: "Scripts, automation, data processing, scientific computing",
    intro: "Python's dominance in data science, automation, and scripting has produced one of the richest open source ecosystems on GitHub. This collection covers general-purpose Python libraries that don't fall into the ML or backend buckets - data manipulation with Pandas and Polars, task automation, web scraping, CLI tools, file processing, concurrency utilities, and packaging tools that make Python projects easier to maintain.",
    highlights: [
      "Data processing - Pandas, Polars, NumPy, Apache Arrow",
      "Web scraping - Scrapy, BeautifulSoup, Playwright-python, Selenium",
      "Automation - Python-dotenv, schedule, APScheduler, Fabric",
      "CLI building - Click, Typer, Rich, Textual",
      "Testing - pytest plugins, Hypothesis, factory_boy",
      "Packaging and tooling - Poetry, PDM, uv, pip-tools",
    ],
  },
  systems: {
    type: "Systems",
    title: "Best Systems Programming GitHub Repositories",
    metaTitle: "Best Systems Programming GitHub Repositories - Repo Zilla",
    metaDesc: "Explore 1,611 curated systems programming GitHub repositories - C, C++, Rust, compilers, OS tooling, and low-level performance projects.",
    count: 1611,
    headline: "Systems Programming",
    tagline: "C, C++, Rust - low-level and performance-critical",
    intro: "Systems programming repositories tend to be the most carefully written code on GitHub - every allocation, every memory boundary matters. This collection covers C and C++ libraries for everything from compression and cryptography to game engines and network protocols, alongside the growing Rust ecosystem with its memory-safe approach to systems work. Compilers, interpreters, emulators, operating system components, and performance tooling all appear here.",
    highlights: [
      "Rust systems - memory allocators, async runtimes, parsing libraries",
      "C/C++ networking - libuv, libevent, Boost.Asio",
      "Cryptography - OpenSSL wrappers, libsodium bindings, pure-Rust crypto",
      "Compression - zstd, brotli, lz4 implementations and bindings",
      "Parsers and compilers - tree-sitter grammars, LLVM tooling, pest",
      "Embedded and WASM - no-std Rust crates, WASM runtimes",
    ],
  },
  mobile: {
    type: "Mobile",
    title: "Best Mobile GitHub Repositories",
    metaTitle: "Best Mobile GitHub Repositories - Repo Zilla",
    metaDesc: "Explore 1,571 curated mobile GitHub repositories - React Native, Flutter, iOS, Android, and cross-platform development tools.",
    count: 1571,
    headline: "Mobile Development",
    tagline: "React Native, Flutter, iOS, Android",
    intro: "Mobile development on GitHub spans two dominant ecosystems - React Native for JavaScript developers and Flutter for Dart - alongside native Swift and Kotlin projects. This collection covers UI component libraries for both cross-platform frameworks, navigation solutions, state management for mobile, native module bridges, animation libraries, and the tooling (Metro bundler configs, Fastlane scripts) that makes mobile CI/CD less painful.",
    highlights: [
      "React Native - navigation, gesture handling, Reanimated, Expo modules",
      "Flutter - popular pub.dev packages mirrored on GitHub, state solutions",
      "Native iOS - Swift Package Manager libraries, Objective-C utilities",
      "Native Android - Kotlin coroutines, Jetpack Compose libraries",
      "Cross-platform tooling - Fastlane, Bitrise integrations, EAS Build",
      "Testing - Detox, Jest React Native, XCTest utilities",
    ],
  },
  database: {
    type: "Database",
    title: "Best Database GitHub Repositories",
    metaTitle: "Best Database GitHub Repositories - Repo Zilla",
    metaDesc: "Explore 1,325 curated database GitHub repositories - ORMs, query builders, migrations, PostgreSQL, MongoDB, Redis, and database tooling.",
    count: 1325,
    headline: "Databases & Storage",
    tagline: "ORMs, query builders, migrations, drivers",
    intro: "Database tooling on GitHub covers everything from lightweight SQLite wrappers to enterprise-grade ORM frameworks. This collection surfaces the most useful database interaction libraries across languages - TypeScript ORMs like Prisma and Drizzle, Python libraries like SQLAlchemy and Tortoise, Go's GORM and sqlx, migration tools, database testing utilities, connection poolers, and query builders that generate clean SQL without the overhead of a full ORM.",
    highlights: [
      "TypeScript ORMs - Prisma, Drizzle, TypeORM, Sequelize, Kysely",
      "Python - SQLAlchemy, Alembic, Tortoise ORM, Piccolo",
      "Go - GORM, sqlx, ent, bun",
      "Migration tools - Flyway, Liquibase, golang-migrate",
      "Connection pooling - PgBouncer configs, connection pool libraries",
      "Redis clients and utilities - ioredis, redis-py, Redisson",
    ],
  },
  learning: {
    type: "Learning/Docs",
    title: "Best Developer Learning Resources on GitHub",
    metaTitle: "Best Developer Learning Resources on GitHub - Repo Zilla",
    metaDesc: "Explore 1,216 curated developer learning repositories - roadmaps, cheatsheets, algorithm guides, interview prep, and structured learning paths.",
    count: 1216,
    headline: "Learning & Documentation",
    tagline: "Roadmaps, cheatsheets, interview prep, guides",
    intro: "Some of the most-starred repositories on GitHub aren't code - they're documentation, roadmaps, cheatsheets, and curated resource lists that help developers level up. This collection surfaces the best of them: language-specific learning paths, computer science fundamentals, system design guides, algorithm and data structure references, interview preparation repositories, and awesome lists that provide genuine signal rather than noise.",
    highlights: [
      "Developer roadmaps - frontend, backend, DevOps, full-stack learning paths",
      "CS fundamentals - algorithms, data structures, operating systems notes",
      "System design - scalability guides, architecture patterns, interview prep",
      "Language cheatsheets - Python, JavaScript, Go, Rust quick references",
      "Interview preparation - LeetCode solutions, system design answers",
      "Awesome lists - curated collections with genuine quality signals",
    ],
  },
  "auth-security": {
    type: "Auth/Security",
    title: "Best Auth & Security GitHub Repositories",
    metaTitle: "Best Auth & Security GitHub Repositories - Repo Zilla",
    metaDesc: "Explore 654 curated authentication and security GitHub repositories - OAuth, JWT, encryption, penetration testing, and security frameworks.",
    count: 654,
    headline: "Authentication & Security",
    tagline: "OAuth, JWT, encryption, pen testing",
    intro: "Authentication and security libraries are among the most important dependencies you can pick - and the hardest to evaluate. This collection covers battle-tested authentication frameworks, JWT libraries, OAuth implementations, cryptographic utilities, and security tooling across languages. Also included: penetration testing tools, vulnerability scanners, and security research projects that are widely referenced in the community.",
    highlights: [
      "Auth frameworks - Passport.js, NextAuth, Lucia, Auth.js",
      "JWT libraries - jsonwebtoken, jose, python-jwt",
      "OAuth - OAuth2 server implementations, PKCE utilities",
      "Cryptography - bcrypt, argon2 implementations, key derivation",
      "Pen testing tools - well-starred, actively maintained security research",
      "Secrets management - dotenv alternatives, vault integrations",
    ],
  },
  "ui-css": {
    type: "UI/CSS",
    title: "Best UI & CSS GitHub Repositories",
    metaTitle: "Best UI & CSS GitHub Repositories - Repo Zilla",
    metaDesc: "Explore 802 curated UI and CSS GitHub repositories - component libraries, design systems, icon sets, CSS frameworks, and animation tools.",
    count: 802,
    headline: "UI Components & CSS",
    tagline: "Component libraries, design systems, icons",
    intro: "UI component libraries and CSS tooling have become one of the most competitive spaces on GitHub. This collection covers headless component libraries like Radix UI and Headless UI, fully styled systems like shadcn/ui and DaisyUI, icon sets with thousands of icons, CSS utility frameworks, animation libraries, and design token tools. Whether you're building a design system from scratch or looking for a production-ready component library, you'll find the most-adopted options here.",
    highlights: [
      "Headless UI - Radix UI, Headless UI, Ark UI, React Aria",
      "Styled systems - shadcn/ui, DaisyUI, Flowbite, Mantine",
      "Icon sets - Lucide, Heroicons, Iconify, Tabler Icons",
      "CSS frameworks - Tailwind plugins, Open Props, Panda CSS",
      "Animation - Auto-Animate, Motion, Framer Motion alternatives",
      "Design tokens - Style Dictionary, Theo, design-system tooling",
    ],
  },
  fullstack: {
    type: "Fullstack",
    title: "Best Fullstack GitHub Repositories",
    metaTitle: "Best Fullstack GitHub Repositories - Repo Zilla",
    metaDesc: "Explore 483 curated fullstack GitHub repositories - MERN, MEAN, T3 stack, Next.js, and complete web application frameworks.",
    count: 483,
    headline: "Fullstack Development",
    tagline: "MERN, T3, Next.js, complete app frameworks",
    intro: "Fullstack repositories on GitHub range from opinionated boilerplates to complete application frameworks. This collection covers the most-adopted fullstack starters and frameworks - the T3 stack with tRPC and Prisma, MERN and MEAN boilerplates, RedwoodJS, Blitz.js, and production-ready Next.js templates. Each brings its own opinions about data fetching, authentication, testing, and deployment - the rankings help surface which ones are actually used in production.",
    highlights: [
      "T3 stack - create-t3-app, tRPC, Prisma, NextAuth combinations",
      "MERN/MEAN boilerplates - production-grade starters with auth and testing",
      "Opinionated frameworks - RedwoodJS, Blitz.js, Wasp",
      "Next.js starters - App Router templates with database integrations",
      "Monorepo setups - Turborepo + Next.js + shared packages",
      "API + frontend combos - typed end-to-end solutions",
    ],
  },
}

export default function ExplorePage({ slug }) {
  const navigate = useNavigate()
  const data = EXPLORE_DATA[slug]

  const [open, setOpen] = useState(false)

  usePageMeta(data?.metaTitle, data?.metaDesc)

  if (!data) {
    return <NotFoundPage />
  }

  return (
    <div className="explore-wrap">

      {/* slim context bar — single row, always visible */}
      <div className="explore-bar">
        <div className="explore-bar-inner">
          <div className="explore-bar-left">
            <button className="explore-bar-back mono" onClick={() => navigate("/")}>← home</button>
            <span className="explore-bar-sep">/</span>
            <h1 className="explore-bar-title">{data.headline}</h1>
            <span className="explore-bar-count mono">{data.count.toLocaleString()} repos</span>
          </div>
          <button
            className={`explore-bar-toggle mono ${open ? "open" : ""}`}
            onClick={() => setOpen(v => !v)}
            aria-expanded={open}
          >
            about this collection {open ? "↑" : "↓"}
          </button>
        </div>

        {/* accordion — in DOM always so Google crawls it, just visually hidden when closed */}
        <div className="explore-accordion" aria-hidden={!open} style={{ "--open": open ? "1" : "0" }}>
          <div className="explore-accordion-inner">
            <p className="explore-acc-intro">{data.intro}</p>
            <div className="explore-acc-highlights">
              <span className="explore-acc-label mono">what's in this collection</span>
              <ul className="explore-acc-list">
                {data.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* catalogue renders immediately — no content wall before it */}
      <div className="explore-catalogue">
        <App initialType={data.type} />
      </div>

      <Footer />
    </div>
  )
}
