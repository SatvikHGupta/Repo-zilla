// Where to reach the person behind RepoZilla. The Contact page and the footer both read this, so a detail is changed in one place.
export const CONTACT = {
  name: 'Satvik Hemant Gupta',
  github: { handle: 'SatvikHGupta', url: 'https://github.com/SatvikHGupta' },
  linkedin: { handle: 'shg975', url: 'https://www.linkedin.com/in/shg975' },
};

// The email address is kept in pieces and joined only when a visitor asks to see it or to write, so it is not in the page or in the code as one
// piece of text that a scraper could pick up. (A bot that runs the page and clicks the button can still get it; this stops the simple ones.)
const PIECES = ['satvik', 'h', 'gupta', '\u0040', 'gmail', '.', 'com'];
export const getEmail = () => PIECES.join('');

// a mailto: link with the subject (and a starting text) already filled in
export const mailto = (subject, body = '') => `mailto:${getEmail()}?subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ''}`;
