// Builds the design C ("Halftone Menu") version of the Home hero, the About page and the footer
// as boards, from the design files in tools/design-c/source (the HTML there is the source of truth
// for layout and styling). The copy is brought up to date with the main site: the About intro,
// profile photo, tools, café photos and Beyond Design text are read from src/boards/about(-en).js,
// and the Japanese pages get Japanese Skills / Journey text. Served at /c, /c/about, /en/c, /en/c/about.
//   node tools/design-c/build.mjs
import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { switchMarkup } from '../lang-switch.mjs';

const SRC = 'tools/design-c/source';
const OUT = 'src/boards';
const MAROON = '#5E1714', PINK = '#F9CBD8', INK = '#3A1210';
const BODY_FONT = "'DotGothic16', 'Osaka-Mono', ui-monospace, monospace";

const href = {
  ja: { home: '/c', about: '/c/about', muse: '/works/muse', maple: '/works/maplenest' },
  en: { home: '/en/c', about: '/en/c/about', muse: '/en/works/muse', maple: '/en/works/maplenest' },
};

// ---------- helpers ----------
function split(file) {
  const css = file.match(/<style>([\s\S]*?)<\/style>/)[1];
  const html = file.match(/<body>\n?([\s\S]*?)\n?<\/body>/)[1];
  return { css, html };
}
// Replace every occurrence; the design file must contain it (count checked when given).
function rep(s, a, b, count) {
  const n = s.split(a).length - 1;
  if (!n || (count && n !== count)) throw new Error(`expected ${count || 'some'} of: ${a.slice(0, 90)} (found ${n})`);
  return s.split(a).join(b);
}
const swapAll = (s, pairs) => pairs.reduce((acc, [a, b]) => rep(acc, a, b), s);

function langSwitch(lang, page, mobile) {
  return switchMarkup({
    lang, mobile,
    enHref: href.en[page], jaHref: href.ja[page],
    colors: { ink: MAROON, onBg: MAROON, onInk: PINK, font: ` font-family: ${BODY_FONT};` },
  });
}

async function current(lang) {
  const file = `${OUT}/${lang === 'ja' ? 'about' : 'about-en'}.js`;
  return (await import(pathToFileURL(file).href + '?t=' + Date.now())).default;
}

// ---------- hero ----------
const HERO_EN = [
  ['aria-label="メインメニュー"', 'aria-label="Main menu"'],
  ['>ホーム</a>', '>Home</a>'],
  ['>私について</a>', '>About</a>'],
  ['使いやすさと見やすさを大切にしながら、心が動くビジュアル体験をつくるUX/UIデザイナーです。', 'I create visual experiences that move people, with usability and readability at the heart of every design.'],
  ['作品を見る →', 'See my work →'],
  ['<span>大切にしていること</span>', '<span>WHAT I VALUE</span>'],
  ['<span>使いやすさ</span>', '<span>Usability</span>'],
  ['<span>見やすさ</span>', '<span>Readability</span>'],
  ['<span>心が動く体験</span>', '<span>Moving experiences</span>'],
  ['>アートアーカイブアプリ<', '>Art archive app<'],
  ['>賃貸プラットフォーム<', '>Rental platform<'],
];

async function hero(lang, mobile) {
  let { css, html } = split(await readFile(`${SRC}/hero-C-${mobile ? 'mobile-390' : 'desktop-1440'}.html`, 'utf8'));
  const h = href[lang];
  // menu: current page underlined, links to the design C pages; language switch beside it
  html = rep(html, '<a href="#" style="' + (mobile ? 'display: inline-flex; align-items: center; min-height: 44px; ' : '') + 'text-decoration: underline;', `<a href="${h.home}" aria-current="page" style="${mobile ? 'display: inline-flex; align-items: center; min-height: 44px; ' : ''}text-decoration: underline;`, 1);
  html = rep(html, '<a href="#" style="' + (mobile ? 'display: inline-flex; align-items: center; min-height: 44px; ' : '') + 'text-decoration: none;">私について', `<a href="${h.about}" style="${mobile ? 'display: inline-flex; align-items: center; min-height: 44px; ' : ''}text-decoration: none;">私について`, 1);
  const navOpen = mobile
    ? '<nav aria-label="メインメニュー" style="position: absolute; right: 20px; top: 14px; display: flex; gap: 18px; font-size: 15px;">'
    : '<nav aria-label="メインメニュー" style="position: absolute; left: 948px; top: 52px; display: flex; gap: 26px; font-size: 17px;">';
  const wrapOpen = mobile
    ? '<div style="position: absolute; right: 14px; top: 14px; z-index: 2; display: flex; align-items: center; gap: 8px;"><nav aria-label="メインメニュー" style="display: flex; gap: 14px; font-size: 15px;">'
    : '<div style="position: absolute; left: 948px; top: 40px; z-index: 2; display: flex; align-items: center; gap: 22px;"><nav aria-label="メインメニュー" style="display: flex; gap: 26px; font-size: 17px;">';
  html = rep(html, navOpen, wrapOpen, 1);
  html = html.replace(/(<nav aria-label="メインメニュー"[\s\S]*?<\/nav>)/, `$1${langSwitch(lang, 'home', mobile)}</div>`);
  // The design files were drawn with fallback fonts; with Dela Gothic One loaded the name is wider,
  // so it is sized to stay clear of the receipt (desktop) and inside the screen (mobile).
  html = mobile
    ? rep(html, 'font-weight: 400; font-size: 90px;', 'font-weight: 400; font-size: 78px;', 1)
    : rep(html, 'font-weight: 400; font-size: 212px;', 'font-weight: 400; font-size: 180px;', 1);
  // receipt: the two works link to their case studies
  html = rep(html, '<a href="#" style="display: flex; justify-content: space-between;', '<a href="@WORK@" style="display: flex; justify-content: space-between;', 2);
  html = html.replace('@WORK@', h.muse).replace('@WORK@', h.maple);
  // on the English page the vertical name stays in katakana as part of the design
  if (lang === 'en') html = swapAll(html, HERO_EN).replace(/<p (style="[^"]*writing-mode: vertical-rl;)/, '<p lang="ja" $1');
  if (html.includes('href="#"')) throw new Error('hero: unwired link');
  return { width: mobile ? 390 : 1440, css, html };
}

// ---------- about ----------
const SKILLS_JA = [
  ['<h3 class="sk-h">UX Research</h3>', '<h3 class="sk-h">UXリサーチ</h3>'],
  ['<h3 class="sk-h">UI &amp; Product Design</h3>', '<h3 class="sk-h">UI・プロダクトデザイン</h3>'],
  ['<h3 class="sk-h">Tools</h3>', '<h3 class="sk-h">ツール</h3>'],
  ['User Interviews</li>', 'ユーザーインタビュー</li>'],
  ['Surveys</li>', 'アンケート調査</li>'],
  ['Usability Testing</li>', 'ユーザビリティテスト</li>'],
  ['Competitive Analysis</li>', '競合分析</li>'],
  ['>Wireframing</li>', '>ワイヤーフレーム作成</li>'],
  ['>Prototyping</li>', '>プロトタイピング</li>'],
  ['>Information Architecture</li>', '>情報設計</li>'],
  ['>Visual Design</li>', '>ビジュアルデザイン</li>'],
];
const JOURNEY_JA = [
  ['>Expected graduation 2028<', '>2028年卒業予定<'],
  ['>● Japan<', '>● 日本<'],
  ['<h3 class="jr-title">Keio University</h3>', '<h3 class="jr-title">慶應義塾大学</h3>'],
  ['>Faculty of Letters — Library and Information Science<', '>文学部 図書館・情報学専攻<'],
  ['>Studying information processing, information retrieval, and human information behavior, exploring how people seek, access, and interact with information.<', '>情報処理や情報検索、人の情報行動について学び、人がどのように情報を探し、手に入れ、関わっているのかを探究しています。<'],
  ['>April 2026 – December 2026<', '>2026年4月 – 12月<'],
  ['>● Vancouver, Canada<', '>● カナダ・バンクーバー<'],
  ['<h3 class="jr-title">Study Abroad in Canada</h3>', '<h3 class="jr-title">カナダ留学</h3>'],
  ['>Studying UX/UI design in Vancouver, Canada.<', '>カナダ・バンクーバーでUX/UIデザインを学んでいます。<'],
  ['>June 2026 – December 2026<', '>2026年6月 – 12月<'],
  ['<h4>Cornerstone Community College, Vancouver</h4>', '<h4>Cornerstone Community College（バンクーバー）</h4>'],
  ['>UX/UI Design Program<', '>UX/UIデザインプログラム<'],
  ['>Gaining hands-on experience in the UX/UI design process, from user research and wireframing to interface design and interactive prototyping.<', '>ユーザーリサーチやワイヤーフレーム作成から、インターフェースデザイン、インタラクティブなプロトタイプ制作まで、UX/UIデザインのプロセスを実践的に学んでいます。<'],
  ['>Program — inside study abroad<', '>プログラム — 留学の中で受講<'],
  ['>Skills — 3 categories<', '>スキル — 3つの分野<'],
];
const FOOTER_EN = [
  ['aria-label="フッターメニュー"', 'aria-label="Footer menu"'],
  ['お仕事のご相談やご感想など、お気軽にご連絡ください。', 'Project inquiries, feedback or just a hello: feel free to get in touch.'],
  ['<span>01 ホーム</span>', '<span>01 Home</span>'],
  ['<span>02 私について</span>', '<span>02 About</span>'],
  ['ページの先頭へ ↑', 'Back to top ↑'],
];

function wireFooter(html, lang) {
  const h = href[lang];
  html = rep(html, '<a href="#" style="display: flex; align-items: baseline; gap: 8px; min-height: 36px;', '<a href="@MENU@" style="display: flex; align-items: baseline; gap: 8px; min-height: 36px;', 2);
  html = html.replace('@MENU@', h.home).replace('@MENU@', h.about);
  html = rep(html, '<a href="#" style="display: inline-flex; align-items: center; min-height: 44px; text-decoration: none; color: #F9CBD8;">', '<a href="#top" style="display: inline-flex; align-items: center; min-height: 44px; text-decoration: none; color: #F9CBD8;">', 1);
  if (lang === 'en') html = swapAll(html, FOOTER_EN);
  return html;
}

async function about(lang, mobile) {
  let { css, html } = split(await readFile(`${SRC}/about-C-${mobile ? 'mobile-390' : 'desktop-1440'}.html`, 'utf8'));
  const cur = (await current(lang))[mobile ? 'mobile' : 'desktop'].html;
  const h = href[lang];

  // header: logo and menu go to the design C pages; language switch beside the menu
  html = rep(html, `<a href="#" style="font-family: 'Dela Gothic One'`, `<a href="${h.home}" style="font-family: 'Dela Gothic One'`, 1);
  html = rep(html, '<a href="#" style="display: inline-flex; align-items: center; min-height: 44px; text-decoration: none; color: #5E1714;">ホーム', `<a href="${h.home}" style="display: inline-flex; align-items: center; min-height: 44px; text-decoration: none; color: #5E1714;">ホーム`, 1);
  html = rep(html, '<a href="#" aria-current="page"', `<a href="${h.about}" aria-current="page"`, 1);
  html = html.replace(/(<nav aria-label="メインメニュー"[\s\S]*?<\/nav>)/, `<div style="display: flex; align-items: center; gap: ${mobile ? 8 : 20}px;">$1${langSwitch(lang, 'about', mobile)}</div>`);
  if (mobile) {
    // logo + menu + switch have to share 350px: a slightly smaller logo, and the menu never wraps
    html = rep(html, 'display: flex; gap: 18px; font-family:', 'display: flex; gap: 12px; white-space: nowrap; font-family:', 1);
    html = rep(html, "sans-serif; font-size: 30px; line-height: 1; text-decoration: none;", "sans-serif; font-size: 26px; line-height: 1; text-decoration: none;", 1);
  }

  // intro: the three lines from the main site (the last one replaces the placeholder)
  const lines = [...cur.matchAll(/<p class="lt-p\d">([\s\S]*?)<\/p>/g)].map((m) => m[1]);
  if (lines.length !== 3) throw new Error('about: intro lines not found on the main site');
  const intro = [...html.matchAll(/(<p style="margin: 0; font-family: 'DotGothic16'[^"]*">)([\s\S]*?)<\/p>/g)].slice(0, 3);
  intro.forEach((m, i) => { html = rep(html, m[0], `${m[1].replace('color: #5B5B55;', 'color: #3A1210;')}${lines[i]}</p>`, 1); });

  // profile photo: the main site's photo in the polaroid
  const alt = cur.match(/<img src="(\/assets\/[^"]+)" alt="([^"]*)"/);
  html = html.replace(/<div class="ph-slot"[\s\S]*?<\/span>\s*<\/div>/, `<img src="${alt[1]}" alt="${alt[2]}" style="display: block; width: 100%; height: ${mobile ? 230 : 340}px; object-fit: cover; object-position: 50% 35%;">`);

  // tools: same list as the main site
  html = html.replace(/<li>FigJam<\/li>\s*<li class="add">[\s\S]*?<\/li>/, (m) => {
    const pad = m.match(/\n(\s*)<li class="add">/)[1];
    return `<li>FigJam</li>\n${pad}<li>Claude</li>\n${pad}<li>UXtweak</li>`;
  });

  // Beyond Design: the main site's text and café photos
  const a0 = html.indexOf('<article class="bi bi-solo"'), a1 = html.lastIndexOf('</article>') + 10;
  const c0 = cur.indexOf('<article class="bi bi-solo"'), c1 = cur.lastIndexOf('</article>') + 10;
  if (a0 < 0 || c0 < 0) throw new Error('about: Beyond Design not found');
  html = html.slice(0, a0) + cur.slice(c0, c1) + html.slice(a1);

  if (lang === 'ja') {
    html = swapAll(html, [...SKILLS_JA, ...(mobile ? JOURNEY_JA.filter(([a]) => !a.startsWith('>Program')) : JOURNEY_JA)]);
  } else {
    html = swapAll(html, [['aria-label="メインメニュー"', 'aria-label="Main menu"'], ['>ホーム</a>', '>Home</a>'], ['>私について</a>', '>About</a>']]);
  }
  html = wireFooter(html, lang);
  if (html.includes('href="#"')) throw new Error('about: unwired link');

  // the timeline line is an absolutely positioned SVG: stretch it down to the next card's stop
  css += `.jr-line{height:calc(100% + ${mobile ? 28 : 36}px)}\n.bi-ph img{object-fit:cover}\n`;
  if (lang === 'ja') css += '.sk-list,.jr-sub,.jr-desc,.bi-txt p,.jr-loc,.jr-pill{line-break:strict}\n.sk-h{word-break:keep-all;text-wrap:balance}\n';
  return { width: mobile ? 390 : 1440, css, html };
}

// ---------- footer for the design C home page (same as the About page's footer) ----------
function footer(aboutBoard, mobile) {
  const f = aboutBoard.html.match(/<footer[\s\S]*<\/footer>/)[0];
  const html = mobile
    ? rep(f, 'position: relative; margin: 0 -20px; min-height: 860px; flex: 1 0 auto;', `position: relative; width: 390px; min-height: 860px; background: ${PINK};`, 1)
    : rep(f, 'position: absolute; left: 0; top: 4500px; width: 1440px;', `position: relative; width: 1440px; background: ${PINK};`, 1);
  return { width: mobile ? 390 : 1440, css: aboutBoard.css, html };
}

// ---------- project list for the design C home page ----------
// The main site's project list (src/boards/home-works(-en).js) in the design C palette. The grid paper
// is a pale, light pink (much softer than the hero/footer pink) with faint maroon lines, so the
// project images and notes stand out while the page stays pink; its bottom fades into the pink footer.
const WORKS_BG = '#F6E2E6';
// Its type follows design C too: display (Bagel Fat One) -> Dela Gothic One, body and script
// (Zen Maru Gothic, Meow Script) -> DotGothic16. The phone/laptop mockups keep their own app fonts.
const DISPLAY_FONT = "'Dela Gothic One', 'Hiragino Kaku Gothic StdN', sans-serif";
function designCType(text) {
  const out = text
    .replace(/'Bagel Fat One'[^;"}]*/g, DISPLAY_FONT)
    .replace(/'(?:Zen Maru Gothic|Meow Script)'[^;"}]*/g, BODY_FONT);
  if (/Bagel Fat One|Zen Maru Gothic|Meow Script/.test(out)) throw new Error('works: main-site font left over');
  return out;
}
async function works(lang) {
  const file = `${OUT}/${lang === 'ja' ? 'home-works' : 'home-works-en'}.js`;
  const src = (await import(pathToFileURL(file).href + '?t=' + Date.now())).default;
  const out = {};
  for (const mode of ['desktop', 'mobile']) {
    const b = src[mode];
    const html = rep(b.html,
      'background-color: #E1EBF5; background-image: linear-gradient(rgba(63,134,201,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(63,134,201,0.2) 1px, transparent 1px);',
      `background-color: ${WORKS_BG}; background-image: linear-gradient(rgba(94,23,20,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(94,23,20,0.07) 1px, transparent 1px);`, 1);
    out[mode] = { ...b, html: designCType(html), css: designCType(b.css) + `
.fade-sky{background-color:${PINK};background-image:none}
` };
  }
  return out;
}

// ---------- About page: the main site's About in the design C palette ----------
// The page keeps the main site's layout and components (letter on lace with wax seals, vine-framed
// photo, stamp/postcard skill cards with clips, stationery journey, Beyond Design) and takes design C's
// colors, type, header, footer and halftone tomatoes. The design file's About supplies the header and
// footer (already wired to the /c pages).
const ABOUT_COLORS = {
  // page and text
  '#BAD9EE': PINK, '#1F3B24': MAROON, '#2A2A2A': INK, '#2F3A30': INK, '#45453F': INK,
  '#5B5B55': '#6B3A35', '#4A5A4C': '#6B3A35', '#C2345A': '#D93A2B', '#B32D53': '#D93A2B',
  // hero: letter title, lace, wax seals, stars, vine, photo mat
  '#2F5A35': MAROON, '#F3C2CC': '#F28B7E',
  '#F3CBD2': '#FBF8F2', '#DF9AA9': '#EDB3BE', '#E8B0BC': '#EDB3BE', '#DE97A6': '#EDB3BE',
  '#F8D5DC': '#F7A497', '#E9A6B5': '#E0564A', '#C77C8F': '#A82A1F',
  '#DCE7F5': '#FFF7D6', '#A9BEDD': '#EADB97', '#7189B0': '#B8A353',
  '#7F8C4B': '#F6EFC4', '#A7AE6A': '#FFF7D6', '#5E6B35': '#E2D38E', '#D9DCA6': '#FFFFFF',
  '#D88C9A': '#D93A2B', '#F6D3D9': '#FFF9F4', '#9FBDAA': '#F7F0D8',
  // skill cards and journey: tomato stamp, light-blue postcard, kraft stamp (as in design C's cards)
  '#F2C3CC': '#D93A2B', '#E3A1B0': '#E58A7F', '#F3CDD3': '#E1EBF5',
  '#BCD5B3': '#EBDAB9', '#9DBD92': '#C9AE7E', '#5E8A5C': '#8A6A3A', '#4E7A4C': '#8A3A0B',
  '#C9E0C0': '#B7D9A2', '#E46F8A': '#D93A2B',
};
const recolor = (t) => t
  .replace(/#[0-9A-Fa-f]{6}\b/g, (c) => ABOUT_COLORS[c.toUpperCase()] || c)
  .replace(/rgba\(94,138,92,/g, 'rgba(138,106,58,');
// Script labels (Meow Script) become small letter-spaced DotGothic16 labels, as in design C.
const scriptToLabel = (t) => t.replace(/(font-family:\s*)'Meow Script',\s*cursive;(\s*)font-size:\s*(\d+)px/g,
  (m, a, sp, n) => `${a}${BODY_FONT};${sp}letter-spacing:0.12em;${sp}font-size:${Math.round(n * 0.48)}px`);

// As in design C, each tomato sits half off the nearest side of the page, clear of the content.
function halftoneFor(cloud, pageWidth) {
  const style = cloud.match(/style="([^"]*)"/)[1];
  const w = +cloud.match(/width="(\d+)"/)[1];
  const d = Math.round(w * 1.1);
  const get = (k) => { const m = style.match(new RegExp(`(?:^|;)\\s*${k}:\\s*(-?\\d+)px`)); return m ? +m[1] : null; };
  const left = get('left'), top = get('top');
  const fromRight = left === null || left + w / 2 > pageWidth / 2;
  const side = fromRight ? `right: -${Math.round(d * 0.45)}px` : `left: -${Math.round(d * 0.55)}px`;
  const pos = `${side}; top: ${top}px`;
  return `<div aria-hidden="true" style="position: absolute; ${pos}; width: ${d}px; height: ${d}px; border-radius: 50%; overflow: hidden; background-image: radial-gradient(circle, #D93A2B 0 47%, transparent 49%); background-size: 12px 12px;"><div style="position: absolute; left: 58%; top: 30%; width: 50%; height: 50%; border-radius: 50%; background-image: radial-gradient(circle, #9E2318 0 62%, transparent 64%); background-size: 12px 12px;"></div></div>`;
}

async function aboutFromMain(lang, mobile, design) {
  const main = (await current(lang))[mobile ? 'mobile' : 'desktop'];
  let html = main.html, css = main.css;
  const take = (h, re, what) => { const m = h.match(re); if (!m) throw new Error(`about: ${what} not found`); return m[0]; };
  // design C header and footer
  html = html.replace(take(html, /<header[\s\S]*?<\/header>/, 'main header'), take(design.html, /<header[\s\S]*?<\/header>/, 'C header'));
  html = html.replace(take(html, /<footer class="f1"[\s\S]*?<\/footer>/, 'main footer'), take(design.html, /<footer[\s\S]*<\/footer>/, 'C footer'));
  if (!mobile) html = rep(html, 'width: 1440px; height: 5360px;', 'width: 1440px; height: 5280px;', 1);
  // clouds -> halftone tomatoes
  html = html.replace(/<svg class="cloud"[\s\S]*?<\/svg>/g, (c) => halftoneFor(c, mobile ? 390 : 1440));
  // washi tapes and timeline stops are cream on the pink page
  css = rep(css, '.jr-tape{background-color:#F2C3CC;', '.jr-tape{background-color:#F6EFC4;', 1);
  css = rep(css, '.jr-chip{background-color:#F2C3CC;', '.jr-chip{background-color:#F6EFC4;', 1);
  css = rep(css, '.jr-hdl{border-radius:50%;background:#F2C3CC;', '.jr-hdl{border-radius:50%;background:#FFF9F4;', 1);
  html = designCType(scriptToLabel(recolor(html)));
  css = designCType(scriptToLabel(recolor(css)));
  // Dela Gothic One has a single weight; the main site's Japanese heading rule asks for bold, which
  // would be faked and smudge the kanji, so the headings stay at the font's own weight.
  // Dela Gothic One is wider than Bagel Fat One: keep "About me" on one line in the phone letter.
  if (mobile) css += '\n.lt-h1{font-size:40px}\n';
  // Japanese headings also break only between words, so "（バンクーバー）" stays on one line.
  if (lang === 'ja') css += '\n.sk-h,.jr-title,.jr-nest h4,.jr-tape,.jr-chip{font-weight:400}\n.jr-title,.jr-nest h4{word-break:keep-all}\n';
  return { ...main, html, css };
}

// ---------- write ----------
async function write(name, desktop, mobile, note) {
  const body = [['desktop', desktop], ['mobile', mobile]].map(([mode, b]) =>
    `${JSON.stringify(mode)}: {\n${Object.entries(b).map(([k, v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(',\n')}\n}`).join(',\n');
  await writeFile(`${OUT}/${name}.js`, `// Generated by tools/design-c/build.mjs from tools/design-c/source (${note}). Do not edit by hand.\nexport default {\n${body}\n};\n`);
  console.log('wrote', `${OUT}/${name}.js`);
}

for (const lang of ['ja', 'en']) {
  const sfx = lang === 'en' ? '-en' : '';
  const [hd, hm, dd, dm] = await Promise.all([hero(lang, false), hero(lang, true), about(lang, false), about(lang, true)]);
  const [ad, am] = await Promise.all([aboutFromMain(lang, false, dd), aboutFromMain(lang, true, dm)]);
  await write(`c-hero${sfx}`, hd, hm, `design C home hero, ${lang}`);
  await write(`c-about${sfx}`, ad, am, `main About page in the design C palette, ${lang}`);
  await write(`c-footer${sfx}`, footer(dd, false), footer(dm, true), `design C footer, ${lang}`);
  const w = await works(lang);
  await write(`c-works${sfx}`, w.desktop, w.mobile, `main site's project list on the design C pink, ${lang}`);
}
