/**
 * Deterministic color generator based on a string (e.g., project name).
 */

const THEMES = [
  'bg-primary-100 text-primary-700', // Indigo
  'bg-violet-100 text-violet-700',   // Violet
  'bg-emerald-100 text-emerald-700', // Emerald
  'bg-amber-100 text-amber-700',     // Amber
  'bg-rose-100 text-rose-700',       // Rose
  'bg-sky-100 text-sky-700',         // Sky
];

export const getThemeForString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % THEMES.length;
  return THEMES[index];
};
