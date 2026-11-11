// One-line descriptions for the domain pages. Names and subdomains always come from the catalog; this only adds a tagline when the id is known.
const TAGLINES = {
  'web-development': 'Frameworks, libraries and tools for building the web.',
  'ai-ml': 'Models, training, inference and everything around machine learning.',
  'devops-infrastructure': 'Containers, pipelines, cloud and the plumbing that keeps software running.',
  security: 'Offensive and defensive tooling, cryptography and hardening.',
  data: 'Databases, pipelines, analytics and visualization.',
  'mobile-desktop': 'Apps and toolkits for phones, tablets and desktops.',
  'ui-ux': 'Components, design systems and interface craft.',
  'developer-tools': 'CLIs, editors, testing and the daily tools of developers.',
  'iot-hardware': 'Firmware, boards, sensors and connected devices.',
  'games-graphics': 'Engines, rendering, shaders and game projects.',
  'blockchain-finance': 'Chains, wallets, trading and financial software.',
  'media-entertainment': 'Video, audio, streaming and creative media.',
  'bots-social': 'Bots, automation and social platforms.',
  'business-productivity': 'Workflows, notes, planning and business software.',
  'science-geo': 'Scientific computing, maps and research code.',
  'systems-lowlevel': 'Kernels, runtimes, embedded and performance work.',
  learning: 'Courses, tutorials, interview prep and curated reading lists.',
  languages: 'Compilers, interpreters, runtimes and the languages themselves.',
  uncategorized: 'Repositories that have no tags, so no domain could be assigned.',
};
export const domainTagline = (id) => TAGLINES[id] || '';
