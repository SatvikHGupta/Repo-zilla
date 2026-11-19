// runs a theme change with a short colour cross-fade (the .theme-anim class lives in base.css)
let timer = 0;
export function withThemeTransition(change) {
  const root = document.documentElement;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { change(); return; }
  root.classList.add('theme-anim');
  change();
  clearTimeout(timer);
  timer = setTimeout(() => root.classList.remove('theme-anim'), 380);
}
