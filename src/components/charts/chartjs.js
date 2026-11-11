// Chart.js with only the parts the two charts use (a doughnut): no scales, no legend, no tooltip, so the bundle stays small.
// The charts draw their own centre text and lists in HTML, which is easier to read, translate and reach with a keyboard than text painted on a canvas.
import { ArcElement, Chart, DoughnutController } from 'chart.js';

Chart.register(DoughnutController, ArcElement);
export { Chart };

export const prefersReducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
