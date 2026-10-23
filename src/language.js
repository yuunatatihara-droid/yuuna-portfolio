// Which language to show: a choice made with the language switch wins, then the browser setting.
// English is the default.
const LANG_KEY = 'lang';

export function rememberLanguage(lang) {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    // Storage can be unavailable (private mode); the choice then lasts for this visit only.
  }
}

export function preferredLanguage() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'en' || saved === 'ja') return saved;
  } catch {
    // Fall back to the browser setting.
  }
  // The first of English or Japanese in the visitor's preference order decides.
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language || ''];
  const first = langs.find((l) => /^(en|ja)\b/i.test(l));
  return first && /^ja\b/i.test(first) ? 'ja' : 'en';
}
