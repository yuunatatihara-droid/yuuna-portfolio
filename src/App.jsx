import { useEffect } from 'react';
import ResponsivePage from './components/ResponsivePage.jsx';
import { usePath } from './router.js';
import { preferredLanguage } from './language.js';
import homeHero from './boards/home-hero.js';
import homeWorks from './boards/home-works.js';
import homeFooter from './boards/home-footer.js';
import about from './boards/about.js';
import homeHeroEn from './boards/home-hero-en.js';
import homeWorksEn from './boards/home-works-en.js';
import homeFooterEn from './boards/home-footer-en.js';
import aboutEn from './boards/about-en.js';
import museEn from './boards/muse-en.js';
import museJa from './boards/muse-ja.js';
import maplenestEn from './boards/maplenest-en.js';
import maplenestJa from './boards/maplenest-ja.js';
import cHero from './boards/c-hero.js';
import cAbout from './boards/c-about.js';
import cFooter from './boards/c-footer.js';
import cHeroEn from './boards/c-hero-en.js';
import cAboutEn from './boards/c-about-en.js';
import cFooterEn from './boards/c-footer-en.js';

// Japanese pages live at the root, English pages under /en.
const ROUTES = {
  '/': {
    title: 'Yuuna Tachihara — UX/UI Designer',
    lang: 'ja',
    sections: [
      { id: 'hero', data: homeHero },
      { id: 'works', data: homeWorks },
      { id: 'contact', data: homeFooter },
    ],
  },
  '/about': {
    title: '私について — Yuuna Tachihara',
    lang: 'ja',
    sections: [{ id: 'about', data: about }],
  },
  '/works/muse': {
    title: 'MUSE — ケーススタディ | Yuuna Tachihara',
    lang: 'ja',
    sections: [{ id: 'muse', data: museJa }],
  },
  '/works/maplenest': {
    title: 'Maple Nest — ケーススタディ | Yuuna Tachihara',
    lang: 'ja',
    sections: [{ id: 'maplenest', data: maplenestJa }],
  },
  '/en': {
    title: 'Yuuna Tachihara — UX/UI Designer',
    lang: 'en',
    sections: [
      { id: 'hero', data: homeHeroEn },
      { id: 'works', data: homeWorksEn },
      { id: 'contact', data: homeFooterEn },
    ],
  },
  '/en/about': {
    title: 'About — Yuuna Tachihara',
    lang: 'en',
    sections: [{ id: 'about', data: aboutEn }],
  },
  '/en/works/muse': {
    title: 'MUSE — Case Study | Yuuna Tachihara',
    lang: 'en',
    sections: [{ id: 'muse', data: museEn }],
  },
  '/en/works/maplenest': {
    title: 'Maple Nest — Case Study | Yuuna Tachihara',
    lang: 'en',
    sections: [{ id: 'maplenest', data: maplenestEn }],
  },
};

// Design C ("Halftone Menu") version of the Home and About pages, built by tools/design-c/build.mjs.
// The case studies and the home page's project list are shared with the main site.
Object.assign(ROUTES, {
  '/c': {
    title: 'Yuuna Tachihara — UX/UI Designer',
    lang: 'ja',
    sections: [
      { id: 'hero', data: cHero },
      { id: 'works', data: homeWorks },
      { id: 'contact', data: cFooter },
    ],
  },
  '/c/about': {
    title: '私について — Yuuna Tachihara',
    lang: 'ja',
    sections: [{ id: 'about', data: cAbout }],
  },
  '/en/c': {
    title: 'Yuuna Tachihara — UX/UI Designer',
    lang: 'en',
    sections: [
      { id: 'hero', data: cHeroEn },
      { id: 'works', data: homeWorksEn },
      { id: 'contact', data: cFooterEn },
    ],
  },
  '/en/c/about': {
    title: 'About — Yuuna Tachihara',
    lang: 'en',
    sections: [{ id: 'about', data: cAboutEn }],
  },
});

// Older URL for the Japanese case study, kept so existing links still work.
ROUTES['/works/muse/ja'] = ROUTES['/works/muse'];

// The same page in the other language, if it exists.
function counterpart(path, lang) {
  if (lang === 'en') {
    const p = path === '/works/muse/ja' ? '/works/muse' : path;
    const en = p === '/' ? '/en' : '/en' + p;
    return ROUTES[en] ? en : null;
  }
  const ja = path === '/en' ? '/' : path.replace(/^\/en(?=\/)/, '');
  return ROUTES[ja] ? ja : null;
}

// On the first page load, show the page in the preferred language (English by default).
function redirectToPreferredLanguage() {
  const path = window.location.pathname.length > 1 ? window.location.pathname.replace(/\/+$/, '') : window.location.pathname;
  const route = ROUTES[path];
  const want = preferredLanguage();
  if (!route || route.lang === want) return;
  const target = counterpart(path, want);
  if (target) window.history.replaceState({}, '', target + window.location.search + window.location.hash);
}
redirectToPreferredLanguage();

export default function App() {
  const raw = usePath();
  const path = raw.length > 1 ? raw.replace(/\/+$/, '') : raw;
  const fallback = path === '/en' || path.startsWith('/en/') ? '/en' : '/';
  const route = ROUTES[path] || ROUTES[fallback];

  useEffect(() => {
    document.title = route.title;
    document.documentElement.lang = route.lang;
  }, [route]);

  return <ResponsivePage key={path} sections={route.sections} />;
}
