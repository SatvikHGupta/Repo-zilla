// Single source of truth for modes and accents: the stylesheet, the pre-paint script, the store and the Appearance menu all read this.

export const MODES = [
  { id: 'dark', label: 'Dark', colors: { bg: '#0f1012', surface: '#16181b', text: '#ebe8e2', textMuted: '#9e9b93', border: 'rgba(235, 232, 226, 0.11)', success: '#4fc283', warning: '#e8a93a', danger: '#f0786c', codeBg: '#0b0c0d' } },
  { id: 'light', label: 'Light', colors: { bg: '#f4f2ed', surface: '#ffffff', text: '#1c1b18', textMuted: '#5d5a52', border: 'rgba(28, 27, 24, 0.13)', success: '#17794a', warning: '#8a5a00', danger: '#c2362b', codeBg: '#efece5' } },
];

export const ACCENTS = [
  { id: 'amber', label: 'Amber', partner: '#2fbfa9', dark: { primary: '#f2a93b', hover: '#e0952a', link: '#f6bd5f' }, light: { primary: '#b05a07', hover: '#964b05', link: '#964b05' } },
  { id: 'coral', label: 'Coral', partner: '#f2b84b', dark: { primary: '#f2735c', hover: '#e45f47', link: '#f79a88' }, light: { primary: '#c4442b', hover: '#a83822', link: '#a83822' } },
  { id: 'rose', label: 'Rose', partner: '#9b8cf5', dark: { primary: '#ee6c9a', hover: '#de5a89', link: '#f59bba' }, light: { primary: '#c0285f', hover: '#a21f4f', link: '#a21f4f' } },
  { id: 'violet', label: 'Violet', partner: '#4cc9f0', dark: { primary: '#8b7cf6', hover: '#7a6ae8', link: '#aea3fa' }, light: { primary: '#5b45d6', hover: '#4c37bd', link: '#4c37bd' } },
  { id: 'sky', label: 'Sky', partner: '#8bd450', dark: { primary: '#3da9f0', hover: '#2b97df', link: '#6ec2f7' }, light: { primary: '#0a68b8', hover: '#07579c', link: '#07579c' } },
  { id: 'teal', label: 'Teal', partner: '#f2a93b', dark: { primary: '#2dc4ae', hover: '#1fb29c', link: '#5fd9c7' }, light: { primary: '#0b7a6a', hover: '#086655', link: '#086655' } },
  { id: 'lime', label: 'Lime', partner: '#4cc9f0', dark: { primary: '#a6d64a', hover: '#94c437', link: '#bfe574' }, light: { primary: '#4c7a12', hover: '#3e6609', link: '#3e6609' } },
  { id: 'mono', label: 'Mono', partner: '#9e9b93', dark: { primary: '#e8e6e1', hover: '#d5d3cd', link: '#e8e6e1' }, light: { primary: '#1c1b18', hover: '#000000', link: '#1c1b18' } },
];

export const DEFAULTS = { mode: 'dark', accent: 'amber' };
export const KEYS = { mode: 'rz-mode', accent: 'rz-accent', partner: 'rz-partner' };
