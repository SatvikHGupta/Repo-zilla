// Inline SVG icon set (24px grid, 1.8 stroke). Decorative by default: pair with a text label or aria-label on the parent control.
const PATHS = {
  search: <><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></>,
  arrowUpRight: <><path d="M7 17L17 7" /><path d="M8 7h9v9" /></>,
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  star: <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z" />,
  fork: <><circle cx="6" cy="5.5" r="2" /><circle cx="18" cy="5.5" r="2" /><circle cx="12" cy="18.5" r="2" /><path d="M6 7.5v1.5c0 1.5 1 2.5 2.5 2.5h7c1.5 0 2.5-1 2.5-2.5V7.5M12 11.5v5" /></>,
  filter: <path d="M4 5h16l-6 7.5V19l-4-2v-4.5z" />,
  sliders: <><path d="M4 7h9M17 7h3M4 17h3M11 17h9" /><circle cx="15" cy="7" r="2" /><circle cx="9" cy="17" r="2" /></>,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  chevronDown: <path d="M6 9.5l6 6 6-6" />,
  chevronUp: <path d="M6 14.5l6-6 6 6" />,
  chevronLeft: <path d="M14.5 6l-6 6 6 6" />,
  chevronRight: <path d="M9.5 6l6 6-6 6" />,
  grid: <><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></>,
  rows: <path d="M4 6.5h16M4 12h16M4 17.5h16" />,
  sun: <><circle cx="12" cy="12" r="3.8" /><path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6L18 18M6 18l1.4-1.4M16.6 7.4L18 6" /></>,
  moon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />,
  palette: <><path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.2 0 1.8-.8 1.8-1.7 0-1.3-1-1.6-1-2.7 0-.9.7-1.6 1.7-1.6H17a3.5 3.5 0 0 0 3.5-3.5C20.5 6.6 16.8 3.5 12 3.5z" /><circle cx="8" cy="11" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="7.8" r="1" fill="currentColor" stroke="none" /><circle cx="16" cy="10" r="1" fill="currentColor" stroke="none" /></>,
  home: <><path d="M4 11l8-6.5 8 6.5" /><path d="M6 10v9h4.5v-5h3v5H18v-9" /></>,
  layers: <><path d="M12 4l8.5 4.5L12 13 3.5 8.5z" /><path d="M3.5 12.5L12 17l8.5-4.5" /><path d="M3.5 16L12 20.5l8.5-4.5" /></>,
  copy: <><rect x="8.5" y="8.5" width="11" height="11" rx="2" /><path d="M15.5 8.5V6.5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2" /></>,
  link: <><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></>,
  info: <><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5" /><circle cx="12" cy="7.8" r="0.7" fill="currentColor" stroke="none" /></>,
  alert: <><path d="M12 4l9 15.5H3z" /><path d="M12 10v4.5" /><circle cx="12" cy="17.2" r="0.7" fill="currentColor" stroke="none" /></>,
  archive: <><rect x="3.5" y="4.5" width="17" height="4.5" rx="1" /><path d="M5 9v9a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 18V9M10 13h4" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  tag: <><path d="M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3a1.4 1.4 0 0 1 0 2l-6.2 6.2a1.4 1.4 0 0 1-2 0z" /><circle cx="8" cy="8" r="1.2" fill="currentColor" stroke="none" /></>,
  sparkle: <><path d="M11 3.5l1.7 5 5 1.7-5 1.7-1.7 5-1.7-5-5-1.7 5-1.7z" /><path d="M19 15.5v4M17 17.5h4" /></>,
  globe: <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.5 2.6 3.7 5.4 3.7 8.5s-1.2 5.9-3.7 8.5c-2.5-2.6-3.7-5.4-3.7-8.5S9.5 6.1 12 3.5z" /></>,
  code: <path d="M8.5 7L4 12l4.5 5M15.5 7L20 12l-4.5 5" />,
  image: <><rect x="3.5" y="5" width="17" height="14" rx="2" /><circle cx="9" cy="10" r="1.5" /><path d="M4 17l5-4.5 4 3.5 3-2.5 4 3.5" /></>,
  book: <><path d="M5 5.5A2 2 0 0 1 7 3.5h11.5v15H7a2 2 0 0 0-2 2z" /><path d="M5 5.5v15" /><path d="M9 8h6" /></>,
  refresh: <><path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" /><path d="M19.5 4.5v4h-4" /></>,
  doc: <><path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" /><path d="M14 3.5V8h4M9 12h6M9 15.5h6" /></>,
  issue: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" /></>,
  more: <><circle cx="6" cy="12" r="1.2" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" /><circle cx="18" cy="12" r="1.2" fill="currentColor" stroke="none" /></>,
  building: <><rect x="5" y="3.5" width="14" height="17" rx="1.5" /><path d="M9 8h2M13 8h2M9 12h2M13 12h2M10.5 20.5v-4h3v4" /></>,
  user: <><circle cx="12" cy="8.5" r="3.5" /><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" /></>,
  calendar: <><rect x="4" y="5.5" width="16" height="14.5" rx="2" /><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" /></>,
  scale: <><path d="M12 4v16M7 20h10" /><path d="M5 7.5h14" /><path d="M5 7.5l-2.5 6a3 3 0 0 0 5 0zM19 7.5l-2.5 6a3 3 0 0 0 5 0z" /></>,
};

export default function Icon({ name, size = 18, className, filled = false, ...rest }) {
  const body = PATHS[name];
  if (!body) return null;
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...rest}>
      {body}
    </svg>
  );
}
