// Wording and thresholds for auto tags, shared by cards, the panel and the filter rail.
export const AUTO_NOTE = 'Auto tags are generated automatically by a text model to add more detail to repos that have no tags of their own. They are guesses and can be wrong.';

// probability -> label (>= 0.6 high, >= 0.4 medium, else low)
export const confidence = (p) => (p >= 0.6 ? 'high' : p >= 0.4 ? 'medium' : 'low');
