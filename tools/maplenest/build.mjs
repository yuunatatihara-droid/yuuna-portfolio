// Builds src/boards/maplenest-en.js and maplenest-ja.js from content.mjs, reusing the MUSE board's CSS.
// Run from the project root: node tools/maplenest/build.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { EN, JA } from './content.mjs';
import { switchMarkup } from '../lang-switch.mjs';
import { REVEAL, CSS as MOTION, SR_CSS, titleLetters } from '../project-motion.mjs';
// MUSE boards may already carry the motion CSS; take their CSS without it and add it once at the end.
const withoutMotion = (css) => css.split('\n/* ── Case study motion ── */')[0];

const here = dirname(fileURLToPath(import.meta.url));
const muse = (await import(pathToFileURL('src/boards/muse-en.js').href)).default;
const extra = readFileSync(join(here, 'styles.css'), 'utf8');

// Mobile boards apply the mobile rules directly (as the MUSE boards do), so unwrap the media blocks.
function unwrapMobile(css) {
  const key = '@media (max-width:760px){';
  let out = '', i = 0;
  while (true) {
    const at = css.indexOf(key, i);
    if (at < 0) return out + css.slice(i);
    out += css.slice(i, at);
    let depth = 1, j = at + key.length;
    for (; j < css.length && depth; j++) { if (css[j] === '{') depth++; else if (css[j] === '}') depth--; }
    out += css.slice(at + key.length, j - 1);
    i = j;
  }
}
// Each language uses its own MUSE board's CSS (the Japanese one adds Japanese heading rules).
const museJa = (await import(pathToFileURL('src/boards/muse-ja.js').href)).default;
const museEnCss = withoutMotion(muse.desktop.css), museJaCss = withoutMotion(museJa.desktop.css);
const jaRules = museJaCss.slice(museEnCss.length);
if (!museJaCss.startsWith(museEnCss) || !jaRules.includes('Japanese typography')) throw new Error('MUSE JA CSS layout changed');
const cssFor = (lang) => {
  // Big numbers that contain kanji (約60%, 70%以上) use the same Japanese fallback as MUSE's headings.
  const jaNumbers = "\n.stat b,.arc .big{font-family:'Bagel Fat One','Zen Maru Gothic','Hiragino Maru Gothic ProN',sans-serif;white-space:nowrap}\n@media (max-width:760px){.stat b{font-size:30px}}\n";
  const desktop = museEnCss + extra + (lang === 'ja' ? jaRules + jaNumbers : '') + MOTION + SR_CSS;
  return { desktop, mobile: unwrapMobile(desktop) };
};

const LAWN = muse.desktop.html.match(/<svg class="lawn"[\s\S]*?<\/svg>/)[0];
const img = (src, alt = '', pos = 'top') => `<img src="/assets/${src}" alt="${alt}" loading="lazy" style="display:block;width:100%;height:100%;object-fit:cover;object-position:${pos};">`;
const phone = (w, inner, rot = 0) => `<div class="sph" style="width:${w}px;${rot ? `transform:rotate(${rot}deg);` : ''}"><div class="sc" style="background:#FFFCF0;">${inner}</div></div>`;
const fig = (src, alt, cap) => `<figure class="fig"><img src="/assets/${src}" alt="${alt}" loading="lazy">${cap ? `<figcaption>${cap}</figcaption>` : ''}</figure>`;
const sh = (eye, h, sub = '') => `<div class="sh"><span class="eyebrow">${eye}</span><h2>${h}</h2>${sub ? `<p class="sub">${sub}</p>` : ''}</div>`;
const VIDS = ['maplenest-onboarding', 'maplenest-map', 'maplenest-listing'];

function page(t, m) {
  const W = (d, mo) => (m ? mo : d);
  return `<main class="pg${m ? ' m' : ''}">
<header class="nav">
  <a href="${t.home}" class="logo">Yuuna</a>
  <div style="display: flex; align-items: center; gap: ${m ? 8 : 12}px;"><nav aria-label="${t.navLabel}"><a href="${t.home}">${t.navHome}</a><a href="${t.about}">${t.navAbout}</a></nav>${switchMarkup({ lang: t.lang, enHref: '/en/works/maplenest', jaHref: '/works/maplenest', mobile: m })}</div>
</header>
<section class="s-hero skybg">
  <div class="h-txt">
    <span class="kick">${t.kick}</span>
    <h1>${titleLetters('Maple<br>Nest')}</h1>
    <p class="h-sub">${t.hSub}</p>
    <p class="h-ov">${t.hOv}</p>
    <dl class="info">${t.info.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
  </div>
  <div class="h-ph">
    <div class="p1">${phone(W(300, 170), img('maplenest-listing.jpg', 'Maple Nest listing screen'), -6)}</div>
    <div class="p2">${phone(W(330, 186), img('maplenest-onboarding.jpg', 'Maple Nest onboarding screen'), 5)}<span class="sel" style="inset:-16px;"><i></i><i></i><i></i><i></i><b>${t.selHero}</b></span></div>
  </div>
  ${LAWN}
</section>
<div class="s-cap" aria-hidden="true"></div>

<section class="s" id="problem">
  ${sh(t.pEye, t.pH, t.pSub)}
  <div class="duo">
    <figure class="obs"><span class="kind">${t.pObsK}</span><blockquote>${t.pObs}</blockquote></figure>
    <div class="arrow" aria-hidden="true">→</div>
    <div class="hmw"><span class="kind">${t.pHmwK}</span><p>${t.pHmw}</p></div>
  </div>
  <div><span class="kind">${t.phaseK}</span><div class="phase">${t.phases.map(([a, b]) => `<span><b>${a}</b><small>${b}</small></span>`).join('<i aria-hidden="true">→</i>')}</div></div>
</section>

<section class="s" id="research">
  ${sh(t.rEye, t.rH, t.rSub)}
  <div><span class="kind">${t.deskK}</span><div class="stat-grid">${t.desk.map(([n, l, s]) => `<div class="stat"><b>${n}</b><span>${l}</span><small>${s}</small></div>`).join('')}</div></div>
  <div><span class="kind">${t.surveyK}</span><div class="bars2">${[[t.barsA, t.barA], [t.barsB, t.barB]].map(([h, rows]) => `<div class="bars"><h4>${h}</h4>${rows.map(([l, v], i) => `<div class="bar${i ? '' : ' top'}"><span>${l}</span><u><i style="width:${v}%"></i></u><em>${v}%</em></div>`).join('')}</div>`).join('')}</div><p class="note">${t.bothNote}</p></div>
  <div class="rcards">${t.ins.map(([h, stats, f], i) => `<article class="rcard"><span class="rn">0${i + 1}</span><h3>${h}</h3><div class="stats">${stats.map((s) => `<span>${s}</span>`).join('')}</div><div class="for"><span class="kind">${t.forK}</span><p>${f}</p></div></article>`).join('')}</div>
  <p class="limits2">${t.myResearch}</p>
</section>

<section class="s" id="ia">
  ${sh(t.iEye, t.iH, t.iSub)}
  ${fig('mn-cardsort.jpg', 'Card sorting result with five categories', t.cardCap)}
  <div><span class="kind">${t.treeK}</span><div class="stat-grid three">${t.tree.map(([n, l]) => `<div class="stat"><b>${n}</b><span>${l}</span></div>`).join('')}</div></div>
  <div><span class="kind">${t.labelsK}</span><div class="labels"><div class="lrow hd">${t.lhd.map((h) => `<span>${h}</span>`).join('')}</div>${t.labels.map(([a, b, why]) => `<div class="lrow"><s>${a}</s><i aria-hidden="true">→</i><b>${b}</b><small>${why}</small></div>`).join('')}</div></div>
  ${fig('mn-sitemap.jpg', 'Sitemap version 3', t.siteCap)}
</section>

<section class="s" id="design">
  ${sh(t.dEye, t.dH)}
  <div class="focus2"><div class="sh2"><span class="lab">${t.brandK}</span></div><p class="quote">“${t.brandQ}”</p><p class="f-intro">${t.brandP}</p></div>
  <div class="fig2">${fig('mn-moodboard.jpg', 'Moodboard', t.moodCap)}${fig('mn-competitive.jpg', 'Competitive analysis of four rental platforms', t.compCap)}</div>
  <div class="focus2 f2nd"><div class="sh2"><span class="lab">${t.kitK}</span></div>
    <div class="swatches">${t.sw.map(([hex, n, use]) => `<div class="sw"><u style="background:${hex}"></u><b>${n}</b><small>${hex} · ${use}</small></div>`).join('')}</div>
    <div class="types">${t.types.map(([f, role, p]) => `<div class="ty"><span class="kind">${role}</span><span class="big" style="font-family:'${f}','Zen Maru Gothic',sans-serif;font-weight:700;">${f}</span><p>${p}</p></div>`).join('')}</div>
    <div class="fig2">${fig('mn-icons.jpg', 'Icon set', t.iconCap)}${fig('mn-spacing.jpg', 'Spacing scale', t.spaceCap)}</div>
    ${fig('mn-experiment.jpg', 'Typography experiment', t.expCap)}
  </div>
  <div class="focus2 f2nd"><div class="sh2"><span class="lab">${t.wireK}</span></div><div class="fig2">${fig('mn-wire-1.jpg', 'Wireframes: splash, home and listings')}${fig('mn-wire-2.jpg', 'Wireframes: listing detail and contact')}</div><p class="note">${t.wireCap}</p></div>
  <div class="focus2 f2nd"><div class="sh2"><span class="lab">${t.mapK}</span><h3>${t.mapH}</h3></div>
    <div class="map">${fig('mn-detail.jpg', 'Desktop listing page', t.detailCap)}<div class="mrows">${t.mapRows.map(([b, p, n]) => `<div class="mrow"><b>${b}</b><p>${p}</p><span class="num">${n}</span></div>`).join('')}</div></div>
  </div>
  <div class="focus2 f2nd"><div class="sh2"><span class="lab">${t.vidK}</span><h3>${t.vidH}</h3></div>
    <div class="vids">${t.vids.map(([b, p], i) => `<figure class="vid">${phone(W(230, 210), `<video src="/assets/${VIDS[i]}.mp4" poster="/assets/${VIDS[i]}.jpg" autoplay muted loop playsinline preload="metadata" aria-label="${b}"></video>`)}<figcaption><b>${b}</b>${p}</figcaption></figure>`).join('')}</div>
  </div>
  <div class="focus2 f2nd"><div class="sh2"><span class="lab">${t.mineK}</span><h3>${t.mineH}</h3><p class="f-intro">${t.mineP}</p></div>
    <div class="mine">
      <div class="mine-ph">${['mn-contact', 'mn-messages', 'mn-notification', 'mn-profile'].map((s, i) => `<figure class="vid">${phone(W(190, 140), img(s + '.jpg', t.mineCap[i]))}<figcaption style="color:var(--mut)"><b style="color:var(--ink)">${t.mineCap[i]}</b></figcaption></figure>`).join('')}</div>
      ${fig('mn-messages-desktop.jpg', t.mineDesk, t.mineDesk)}
    </div>
  </div>
</section>

<section class="s" id="validation">
  ${sh(t.vEye, t.vH, t.vSub)}
  <div class="r3">${t.methods.map(([a, b, p]) => `<div><span class="kind">${b}</span><h3 style="font-size:20px;margin:6px 0 8px;">${a}</h3><p>${p}</p></div>`).join('')}</div>
  <div class="rcards">${t.rqs.map(([k, h, stats, f]) => `<article class="rcard"><span class="kind">${k}</span><h3>${h}</h3><div class="stats">${stats.map((s) => `<span>${s}</span>`).join('')}</div><div class="for"><span class="kind">${t.nextK}</span><p>${f}</p></div></article>`).join('')}</div>
  ${fig('mn-journey.jpg', 'Customer journey map', t.journeyCap)}
  <p class="limits2">${t.limits}</p>
</section>

<section class="s" id="badge">
  ${sh(t.bEye, t.bH, t.bSub)}
  <div class="arc">${t.arc.map(([k, b, p], i) => `<div><span class="kind">${k}</span>${i === 2 ? `<span class="big">${b}</span>` : `<b>${b}</b>`}<p>${p}</p></div>`).join('')}</div>
  <div class="hmw"><p>${t.bLesson}</p></div>
</section>

<section class="s" id="next">
  ${sh(t.nEye, t.nH)}
  <div class="prio">${t.prio.map(([p, b, d]) => `<div class="pc${p === 'P1' ? ' p1' : ''}"><span class="fk">${p}</span><b>${b}</b><p>${d}</p></div>`).join('')}</div>
  <p class="note">${t.prioNote}</p>
</section>

<section class="s" id="reflection">
  ${sh(t.fEye, t.fH)}
  <div class="r3">${t.refl.map(([k, p]) => `<div><span class="kind">${k}</span><p>${p}</p></div>`).join('')}</div>
</section>

<section class="s ends">
  <div class="cta"><div><h3>${t.ctaH}</h3><p>${t.ctaP}</p></div><a class="pill" href="mailto:yuuna.tatihara@gmail.com">${t.ctaB}</a></div>
  <a class="nextp" href="${t.muse}"><span class="lab">${t.nextLab}</span><div class="np-img"><img src="/assets/ff2d38ce686055f2b5e603e3868ef93a.jpg" alt="" loading="lazy"></div><b>${t.nextName}</b></a>
</section>
<footer class="foot"><span class="pinkt">${t.footTag}</span><h2>${t.footH}</h2><p><a href="mailto:yuuna.tatihara@gmail.com">yuuna.tatihara@gmail.com</a> · <a href="${t.works}">${t.back}</a></p></footer>
</main>`;
}

const part = (b) => `{\n"width": ${b.width},\n"reveal": ${JSON.stringify(REVEAL)},\n"css": ${JSON.stringify(b.css)},\n"html": ${JSON.stringify(b.html)}\n}`;
for (const t of [EN, JA]) {
  const css = cssFor(t.lang);
  const board = { desktop: { width: 1440, css: css.desktop, html: page(t, false) }, mobile: { width: 390, css: css.mobile, html: page(t, true) } };
  const f = `src/boards/maplenest-${t.lang}.js`;
  writeFileSync(f, `// Maple Nest case study (${t.lang === 'en' ? 'English' : 'Japanese'}). Built on the MUSE board's styles.\nexport default {\n"desktop": ${part(board.desktop)},\n"mobile": ${part(board.mobile)}\n};\n`);
  console.log(f, board.desktop.html.length, board.mobile.html.length);
}
