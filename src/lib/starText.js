import { fmtNum } from './format.js';

// Wording that names the star floor. It is built from the manifest value, so a rebuilt catalog (for example a floor of 50 or of 10) changes the texts with no code edit.
// Until the manifest is known (floor is null) the wording has no number, so a wrong one never flashes on screen.
export const scope = (floor) => (floor ? `public GitHub repositories with ${fmtNum(floor)} or more stars` : 'popular public GitHub repositories');
export const plusStars = (floor) => (floor ? `${fmtNum(floor)}+ stars` : 'enough stars');
export const orMoreStars = (floor) => (floor ? `${fmtNum(floor)} or more stars` : 'enough stars');
