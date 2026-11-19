// Wording and thresholds for auto tags, shared by cards, the panel and the filter rail.
export const AUTO_NOTE = 'Auto tags are generated automatically by a text model from the name, description and README. They are guesses and can be wrong.';

// an auto tag that has the same name as one of the repo’s real tags says nothing new, so it is left out (the exporter already drops these)
export const withoutRealTags = (auto, real = []) => auto.filter((a) => !real.includes(a.tag));

// probability -> label (>= 0.6 high, >= 0.4 medium, else low)
export const confidence = (p) => (p >= 0.6 ? 'high' : p >= 0.4 ? 'medium' : 'low');
