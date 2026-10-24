// Rebuilds the About page hero (JA + EN, desktop + mobile) as a letter on pink lace with wax seals
// and scattered stars, and frames the profile photo with a hand-drawn pink vine.
// Safe to re-run: it replaces the hero section and the CSS block it added last time.
//   node tools/about-hero.mjs
import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const FILES = ['src/boards/about.js', 'src/boards/about-en.js'];
const CSS_START = '/* about-hero-letter */';
const CSS_END = '/* /about-hero-letter */';

const r1 = (n) => Math.round(n * 10) / 10;

// ---------- vine frame (reference: doodled pink vine around a book) ----------
function wobble(a, b, amp, seed) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
  const o1 = amp * Math.sin(seed * 1.7), o2 = -amp * Math.cos(seed * 2.3);
  const c1 = [a[0] + dx / 3 + nx * o1, a[1] + dy / 3 + ny * o1];
  const c2 = [a[0] + (2 * dx) / 3 + nx * o2, a[1] + (2 * dy) / 3 + ny * o2];
  return `M${r1(a[0])} ${r1(a[1])}C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${r1(b[0])} ${r1(b[1])}`;
}

// A spiral that starts at p heading along d and winds toward side (+1 left of d / -1 right).
function curl(p, d, side, r0, turns = 1.35) {
  const n = [-d[1] * side, d[0] * side];
  const c = [p[0] + n[0] * r0, p[1] + n[1] * r0];
  const a0 = Math.atan2(p[1] - c[1], p[0] - c[0]);
  const steps = Math.round(turns * 28);
  let s = `M${r1(p[0])} ${r1(p[1])}`;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const r = r0 * (1 - 0.62 * t);
    const a = a0 - side * t * turns * Math.PI * 2;
    s += `L${r1(c[0] + r * Math.cos(a))} ${r1(c[1] + r * Math.sin(a))}`;
  }
  return s;
}

const BUD = 'M0 0C-5.5 -2 -7.5 -8.5 -5.5 -14C-3.5 -12 -1.5 -10.5 0 -8.5C1.5 -10.5 3.5 -12 5.5 -14C7.5 -8.5 5.5 -2 0 0Z';

// A short stem leaving point q along direction d, ending in a bud or a curl.
function sprig(q, d, bend, len, end, budScale) {
  const n = [-d[1], d[0]];
  const tip = [q[0] + d[0] * len + n[0] * bend, q[1] + d[1] * len + n[1] * bend];
  const ctrl = [q[0] + d[0] * len * 0.5 - n[0] * bend * 0.6, q[1] + d[1] * len * 0.5 - n[1] * bend * 0.6];
  const stem = `M${r1(q[0])} ${r1(q[1])}Q${r1(ctrl[0])} ${r1(ctrl[1])} ${r1(tip[0])} ${r1(tip[1])}`;
  const td = [tip[0] - ctrl[0], tip[1] - ctrl[1]];
  const tl = Math.hypot(td[0], td[1]);
  const dir = [td[0] / tl, td[1] / tl];
  if (end === 'bud') {
    const deg = r1((Math.atan2(dir[1], dir[0]) * 180) / Math.PI + 90);
    return { paths: [stem], buds: [`<g transform="translate(${r1(tip[0])} ${r1(tip[1])}) rotate(${deg}) scale(${budScale})"><path class="vb" d="${BUD}"/></g>`] };
  }
  return { paths: [stem, curl(tip, dir, end === 'curlL' ? 1 : -1, len * 0.26, 1.3)], buds: [] };
}

function vineFrame(W, H, m, scale = 1) {
  const L = m, T = m, R = W - m, B = H - m, x = 22 * scale;
  const paths = [], buds = [];
  // four sides, crossing at the corners and ending in curls
  const sides = [
    { a: [L - x, T + 3], b: [R + x * 0.8, T - 2], s: 1 },
    { a: [R - 2, T - x], b: [R + 3, B + x * 0.9], s: 2 },
    { a: [R + x, B + 2], b: [L - x * 0.8, B - 3], s: 3 },
    { a: [L + 2, B + x], b: [L - 3, T - x * 0.9], s: 4 },
  ];
  for (const { a, b, s } of sides) {
    paths.push(wobble(a, b, 9 * scale, s));
    const d = [b[0] - a[0], b[1] - a[1]], l = Math.hypot(d[0], d[1]);
    const u = [d[0] / l, d[1] / l];
    paths.push(curl(b, u, s % 2 ? 1 : -1, 15 * scale, 1.5));
    paths.push(curl(a, [-u[0], -u[1]], s % 2 ? -1 : 1, 11 * scale, 1.3));
  }
  // sprigs: [point, direction, bend, length, end]
  const S = scale;
  const list = [
    [[L + (R - L) * 0.2, T], [-0.3, -0.95], 8, 30, 'bud'],
    [[L + (R - L) * 0.52, T], [0.35, -0.94], -9, 34, 'curlR'],
    [[L + (R - L) * 0.8, T], [-0.15, -0.99], 7, 26, 'bud'],
    [[R, T + (B - T) * 0.22], [0.96, 0.28], -8, 34, 'curlL'],
    [[R, T + (B - T) * 0.5], [0.94, -0.34], 8, 28, 'bud'],
    [[R, T + (B - T) * 0.78], [0.97, 0.24], -7, 32, 'curlR'],
    [[L + (R - L) * 0.78, B], [0.3, 0.95], 8, 28, 'bud'],
    [[L + (R - L) * 0.46, B], [-0.3, 0.95], -9, 34, 'curlL'],
    [[L + (R - L) * 0.16, B], [0.2, 0.98], 7, 24, 'bud'],
    [[L, T + (B - T) * 0.8], [-0.96, 0.28], -8, 32, 'curlR'],
    [[L, T + (B - T) * 0.5], [-0.95, -0.3], 7, 28, 'bud'],
    [[L, T + (B - T) * 0.2], [-0.97, 0.25], -8, 34, 'curlL'],
    // a few curling inward at the corners, as in the reference
    [[L + 14 * S, T], [0.5, 0.86], -4, 20, 'curlL'],
    [[R, B - 16 * S], [-0.85, 0.5], 4, 20, 'curlR'],
  ];
  for (const [p, d, bend, len, end] of list) {
    const r = sprig(p, d, bend * S * 2, len * S * 1.6, end, 1.5 * S);
    paths.push(...r.paths);
    buds.push(...r.buds);
  }
  return `<svg class="vine" aria-hidden="true" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" fill="none">`
    + `<g stroke="#D88C9A" stroke-width="${r1(2.8 * Math.max(scale, 0.8))}" stroke-linecap="round" stroke-linejoin="round">`
    + paths.map((d) => `<path class="vn" pathLength="1" d="${d}"/>`).join('')
    + `</g><g fill="#F6D3D9" stroke="#D88C9A" stroke-width="1.6" stroke-linejoin="round">${buds.join('')}</g></svg>`;
}

// ---------- wax seals ----------
function blob(cx, cy, r, seed) {
  let s = '';
  for (let i = 0; i <= 60; i++) {
    const a = (i / 60) * Math.PI * 2;
    const drip = 7 * Math.exp(-(((a - seed) % (Math.PI * 2)) ** 2) * 9);
    const rr = r + 3.2 * Math.sin(3 * a + seed) + 2.2 * Math.sin(5 * a + seed * 2) + 1.4 * Math.sin(11 * a) + drip;
    s += `${i ? 'L' : 'M'}${r1(cx + rr * Math.cos(a))} ${r1(cy + rr * Math.sin(a))}`;
  }
  return s + 'Z';
}

const STAR = (cx, cy, R, r) => Array.from({ length: 10 }, (_, i) => {
  const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r : R;
  return `${r1(cx + rr * Math.cos(a))},${r1(cy + rr * Math.sin(a))}`;
}).join(' ');

function seal(id, c, emblem, size, style) {
  const em = emblem === 'star'
    ? (fill, dx, dy) => `<polygon points="${STAR(60 + dx, 60 + dy, 19, 8)}" fill="${fill}" stroke-linejoin="round"/>`
    : (fill, dx, dy) => `<g fill="${fill}">${[0, 72, 144, 216, 288].map((deg) => `<ellipse cx="${60 + dx}" cy="${49 + dy}" rx="6.5" ry="11" transform="rotate(${deg} ${60 + dx} ${60 + dy})"/>`).join('')}<circle cx="${60 + dx}" cy="${60 + dy}" r="5"/></g>`;
  return `<svg class="seal" aria-hidden="true" viewBox="0 0 120 120" width="${size}" height="${size}" style="${style}">`
    + `<defs><radialGradient id="${id}" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="${c.light}"/><stop offset=".55" stop-color="${c.mid}"/><stop offset="1" stop-color="${c.dark}"/></radialGradient></defs>`
    + `<path d="${blob(60, 60, 50, emblem === 'star' ? 2.3 : 5.6)}" fill="url(#${id})"/>`
    + `<circle cx="61" cy="61" r="33" fill="none" stroke="${c.dark}" stroke-width="3.5" opacity=".7"/>`
    + `<circle cx="59" cy="59" r="33" fill="none" stroke="${c.light}" stroke-width="2" opacity=".9"/>`
    + `<circle cx="60" cy="60" r="31" fill="${c.mid}" opacity=".55"/>`
    + em(c.dark, 1.4, 1.6) + em(c.light, -1, -1) + em(c.mid, 0, 0)
    + `<path d="M30 40 Q38 26 54 22" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" fill="none" opacity=".45"/>`
    + `</svg>`;
}
const PINK = { light: '#F8D5DC', mid: '#E9A6B5', dark: '#C77C8F' };
const BLUE = { light: '#DCE7F5', mid: '#A9BEDD', dark: '#7189B0' };

// ---------- stars ----------
const star = ([x, y, s, rot, tone, delay]) => `<svg class="lt-star" aria-hidden="true" viewBox="0 0 40 40" width="${s}" height="${s}" style="left: ${x}px; top: ${y}px; rotate: ${rot}deg; animation-delay: ${delay}s;"><polygon points="${STAR(20, 21, 18, 8)}" fill="${tone ? '#A7AE6A' : '#7F8C4B'}" stroke="${tone ? '#7F8C4B' : '#5E6B35'}" stroke-width="1.4" stroke-linejoin="round"/><polygon points="${STAR(18.5, 19, 8, 3.4)}" fill="#D9DCA6" opacity=".55"/></svg>`;

// ---------- markup ----------
function letter({ h1Id, h1, ps, kicker, mobile }) {
  return `<div class="lt-wrap"${mobile ? '' : ' style="position: absolute; left: 150px; top: 150px; width: 610px; rotate: -2.5deg;"'}>
      <div class="lace" aria-hidden="true"></div>
      <div class="letter">
        <p class="lt-kick">${kicker}</p>
        <h1 id="${h1Id}" class="lt-h1">${h1}</h1>
        ${ps.map((p, i) => `<p class="lt-p${i + 1}">${p}</p>`).join('\n        ')}
      </div>
      ${seal(mobile ? 'sealPm' : 'sealP', PINK, 'star', mobile ? 78 : 118, mobile ? 'left: -26px; bottom: -34px; rotate: -14deg;' : 'left: -50px; bottom: -48px; rotate: -14deg;')}
      ${seal(mobile ? 'sealBm' : 'sealB', BLUE, 'flower', mobile ? 64 : 100, mobile ? 'right: -20px; top: -30px; rotate: 12deg;' : 'right: -40px; top: -44px; rotate: 12deg;')}
    </div>`;
}

function photo({ img, mobile }) {
  const w = mobile ? 220 : 300, pad = mobile ? 12 : 16, ih = mobile ? 262 : 360;
  const out = mobile ? 58 : 92, m = mobile ? 36 : 52;
  const W = w + out * 2, H = ih + pad * 2 + out * 2;
  return `<div class="bk-wrap"${mobile ? '' : ' style="position: absolute; left: 1004px; top: 190px; rotate: 3deg;"'}>
      ${vineFrame(W, H, m, mobile ? 0.68 : 1).replace('<svg class="vine"', `<svg class="vine" style="left: -${out}px; top: -${out}px;"`)}
      <div class="bk" style="width: ${w}px; padding: ${pad}px;">${img.replace(/height: \d+px/, `height: ${ih}px`)}</div>
    </div>`;
}

const DESK_STARS = [
  [168, 118, 26, 8, 0, 0], [118, 300, 18, -12, 1, 1.2], [140, 560, 30, 18, 0, 2.1], [258, 760, 20, -6, 1, .6],
  [520, 98, 16, 22, 1, 2.8], [610, 772, 28, -18, 0, 1.7], [858, 118, 22, 10, 0, .3], [872, 470, 16, -20, 1, 2.4],
  [880, 700, 26, 4, 0, 3.1], [1300, 160, 30, -10, 0, 1], [1330, 420, 18, 16, 1, 2.2], [1290, 700, 24, -4, 0, .8],
  [1100, 780, 18, 20, 1, 1.5], [1210, 120, 16, -16, 1, 3.4],
];
const MOB_STARS = [
  [6, 12, 20, 10, 0, 0], [318, 6, 14, -14, 1, 1.4], [2, 330, 16, 18, 1, 2.2], [330, 380, 22, -8, 0, .7],
  [30, 470, 22, -16, 0, 1.9], [312, 560, 16, 12, 1, 2.9], [20, 700, 14, 6, 1, .4], [322, 760, 20, -20, 0, 1.2],
];

function heroDesktop(data) {
  return `<!-- ================= INTRO LETTER ================= -->
  <section aria-labelledby="${data.h1Id}" class="lt-hero" style="position: absolute; left: 0; top: 0; width: 1440px; height: 900px;">
    ${DESK_STARS.map(star).join('\n    ')}
    ${letter(data)}
    ${photo(data)}
  </section>`;
}

function heroMobile(data) {
  return `<!-- INTRO LETTER -->
  <section aria-labelledby="${data.h1Id}" class="lt-hero" style="position: relative; padding: 50px 22px 40px; display: flex; flex-direction: column; align-items: center; gap: 104px;">
    ${MOB_STARS.map(star).join('\n    ')}
    ${letter({ ...data, mobile: true })}
    ${photo({ ...data, mobile: true })}
  </section>`;
}

// ---------- CSS ----------
const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.09'/%3E%3C/svg%3E")`;

function css(mobile) {
  const k = mobile
    ? { lace: '-26px -24px', r: 7, pad: 22, hole: 13, out: '28px 24px 34px', kick: 30, h1: 50, st: 5, p1: 16, p2: 15, p3: 14, gap: 10 }
    : { lace: '-50px -54px', r: 11, pad: 40, hole: 18, out: '54px 64px 62px', kick: 42, h1: 78, st: 7, p1: 19, p2: 18, p3: 17, gap: 16 };
  const sc = (pos, rep) => `radial-gradient(circle ${k.r}px at ${k.r}px ${k.r}px,#000 96%,#0000) ${pos}/${k.r * 2}px ${k.r * 2}px ${rep} border-box`;
  return `${CSS_START}
.lt-hero{isolation:isolate}
.lt-wrap{position:relative;z-index:1;filter:drop-shadow(0 16px 18px rgba(70,45,45,.22))${mobile ? ';width:100%;rotate:-1.5deg' : ''}}
.lace{position:absolute;inset:${k.lace};padding:${k.pad}px;box-sizing:border-box;background-color:#F3CBD2;background-origin:content-box;background-image:radial-gradient(circle,transparent ${k.hole * .2}px,#DF9AA9 ${k.hole * .2 + .4}px ${k.hole * .29}px,transparent ${k.hole * .29 + .4}px),radial-gradient(circle,#E8B0BC ${k.hole * .08}px,transparent ${k.hole * .08 + .5}px);background-size:${k.hole}px ${k.hole}px;background-position:0 0,${k.hole / 2}px ${k.hole / 2}px;outline:2px dashed #DE97A6;outline-offset:-${k.pad - 8}px;-webkit-mask:radial-gradient(circle ${k.hole * .2}px,#000 92%,#0000) 0 0/${k.hole}px ${k.hole}px content-box,${sc('0 0', 'repeat-x')},${sc('0 100%', 'repeat-x')},${sc('0 0', 'repeat-y')},${sc('100% 0', 'repeat-y')},linear-gradient(#000 0 0) 50% 50%/calc(100% - ${k.r * 2}px) calc(100% - ${k.r * 2}px) no-repeat border-box;-webkit-mask-composite:xor,source-over,source-over,source-over,source-over;mask-composite:exclude,add,add,add,add}
.letter{position:relative;display:flex;flex-direction:column;gap:${k.gap}px;padding:${k.out};background-color:#FAF4E3;background-image:linear-gradient(90deg,transparent 49.6%,rgba(120,98,66,.10) 50%,rgba(255,255,255,.75) 50.35%,transparent 51.2%),linear-gradient(180deg,transparent 52.4%,rgba(120,98,66,.09) 52.9%,rgba(255,255,255,.7) 53.2%,transparent 54.2%),linear-gradient(63deg,transparent 28%,rgba(120,98,66,.06) 28.5%,transparent 30%),linear-gradient(-31deg,transparent 69.5%,rgba(255,255,255,.55) 70%,rgba(120,98,66,.06) 70.6%,transparent 71.8%),linear-gradient(12deg,transparent 84%,rgba(120,98,66,.05) 84.4%,transparent 85.6%),radial-gradient(110% 80% at 18% 12%,rgba(255,255,255,.6),transparent 60%),radial-gradient(70% 60% at 88% 92%,rgba(170,138,92,.14),transparent 70%),${NOISE};color:#2F3A30}
.letter p{margin:0}
.lt-kick{font-family:'Meow Script',cursive;font-size:${k.kick}px;line-height:1;color:#C2345A;margin-bottom:-${mobile ? 6 : 10}px!important}
.lt-h1{margin:0;font-family:'Bagel Fat One','Arial Rounded MT Bold',sans-serif;font-weight:400;font-size:${k.h1}px;line-height:1.02;color:#FBF6E6;-webkit-text-stroke:${k.st}px #2F5A35;paint-order:stroke fill;text-shadow:${mobile ? 3 : 5}px ${mobile ? 3 : 5}px 0 #F3C2CC}
.lt-p1,.lt-p2,.lt-p3{font-family:'Zen Maru Gothic','Hiragino Maru Gothic ProN',system-ui,sans-serif;line-break:strict}
.lt-p1{font-weight:700;font-size:${k.p1}px;line-height:1.7;color:#1F3B24}
.lt-p2{font-weight:600;font-size:${k.p2}px;line-height:1.8}
.lt-p3{font-weight:500;font-size:${k.p3}px;line-height:1.8;color:#2F3A30}
.seal{position:absolute;filter:drop-shadow(1px 3px 2px rgba(60,40,50,.3))}
.lt-star{position:absolute;z-index:2;filter:drop-shadow(0 1px 1px rgba(40,50,20,.25));animation:st-tw 4.6s ease-in-out infinite}
@keyframes st-tw{0%,100%{scale:1}50%{scale:.8}}
.bk-wrap{position:relative;z-index:1}
.vine{position:absolute;overflow:visible;pointer-events:none}
.bk{position:relative;box-sizing:border-box;background-color:#9FBDAA;background-image:repeating-linear-gradient(0deg,rgba(255,255,255,.09) 0 1px,transparent 1px 3px),repeating-linear-gradient(90deg,rgba(30,60,40,.07) 0 1px,transparent 1px 3px),radial-gradient(120% 90% at 30% 20%,rgba(255,255,255,.18),transparent 60%);box-shadow:inset 0 0 0 1px rgba(30,60,40,.12),0 18px 26px -14px rgba(30,50,40,.5)}
.bk img{box-shadow:0 0 0 1px rgba(30,60,40,.15)}
@keyframes vn-draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
@keyframes vb-pop{from{opacity:0;scale:.2}to{opacity:1;scale:1}}
.vine .vn{stroke-dasharray:1;animation:vn-draw 2.2s cubic-bezier(.45,0,.2,1) .35s both}
.vine .vb{transform-box:fill-box;transform-origin:50% 100%;animation:vb-pop .55s cubic-bezier(.3,1.5,.5,1) 1.9s both}
@media (prefers-reduced-motion: reduce){.lt-star,.vine .vn,.vine .vb{animation:none}}
${CSS_END}`;
}

// ---------- apply ----------
const strip = (s) => s.replace(/<[^>]+>/g, (t) => (/^<\/?(br|em|strong|a)\b/i.test(t) ? t : ''));

for (const file of FILES) {
  const src = await readFile(file, 'utf8');
  const header = src.split('\n')[0];
  const board = (await import(pathToFileURL(file).href + '?t=' + Date.now())).default;
  for (const mode of ['desktop', 'mobile']) {
    const b = board[mode];
    const mobile = mode === 'mobile';
    const re = mobile
      ? /<!-- INTRO (?:COLLAGE|LETTER) -->[\s\S]*?<\/section>/
      : /<!-- =+ INTRO (?:COLLAGE|LETTER) =+ -->[\s\S]*?<\/section>/;
    const sec = b.html.match(re)?.[0];
    if (!sec) throw new Error(`hero not found: ${file} ${mode}`);
    const h1m = sec.match(/<h1 id="([^"]+)"[^>]*>([\s\S]*?)<\/h1>/);
    const ps = [...sec.matchAll(/<p(?=[\s>])( class="([^"]*)")?[^>]*>([\s\S]*?)<\/p>/g)]
      .filter((m) => m[2] !== 'lt-kick').map((m) => strip(m[3]).trim());
    const img = sec.match(/<img [^>]*>/)[0];
    if (ps.length !== 3) throw new Error(`expected 3 paragraphs in ${file} ${mode}, got ${ps.length}`);
    const data = { h1Id: h1m[1], h1: h1m[2], ps, img, kicker: 'Nice to meet you' };
    b.html = b.html.replace(re, mobile ? heroMobile(data) : heroDesktop(data));
    const at = b.css.indexOf(CSS_START);
    if (at >= 0) b.css = b.css.slice(0, at) + b.css.slice(b.css.indexOf(CSS_END) + CSS_END.length + 1);
    b.css += css(mobile) + '\n';
  }
  const body = ['desktop', 'mobile'].map((mode) => {
    const fields = Object.entries(board[mode]).map(([k, v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)}`);
    return `${JSON.stringify(mode)}: {\n${fields.join(',\n')}\n}`;
  }).join(',\n');
  await writeFile(file, `${header}\nexport default {\n${body}\n};\n`);
  console.log('updated', file);
}
