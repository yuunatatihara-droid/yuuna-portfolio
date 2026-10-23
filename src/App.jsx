import { useEffect } from 'react';
import ResponsivePage from './components/ResponsivePage.jsx';
import { usePath } from './router.js';
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

// Older URL for the Japanese case study, kept so existing links still work.
ROUTES['/works/muse/ja'] = ROUTES['/works/muse'];

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
