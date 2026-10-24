// Restyles the About page "My Journey" timeline (JA + EN, desktop + mobile) to match the rest of
// the page's stationery look: postcard frames in pink and sage, perforated stamps, striped washi
// tape dates, a pink stitched timeline and a gold paperclip on the nested program card.
// The card text is left untouched. Safe to re-run.
//   node tools/about-journey.mjs
import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const FILES = ['src/boards/about.js', 'src/boards/about-en.js'];
const CSS_START = '/* about-journey */';
const CSS_END = '/* /about-journey */';

const MAPLE = 'M36 18 l4 10 7-4-2 10 9-1-6 8 4 3-12 2 1 12h-10l1-12-12-2 4-3-6-8 9 1-2-10 7 4z';
const stampArt = {
  jp: '<rect width="72" height="86" fill="#FBE3E8"/><circle cx="36" cy="43" r="16" fill="#D93A2B"/>',
  ca: `<rect width="72" height="86" fill="#E3EFDD"/><path d="${MAPLE}" fill="#D93A2B"/>`,
};
const stamp = (art, rot) => `<div class="jr-stamp jr-perf" aria-hidden="true" style="rotate: ${rot}deg;"><svg viewBox="0 0 72 86" preserveAspectRatio="none">${stampArt[art]}</svg></div>`;

function restyle(html) {
  const swaps = [
    // timeline: pink stitched line and a pink paper plane instead of the blue Figma marks
    ['stroke="#2F77CC" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 9"', 'stroke="#D88C9A" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="7 7"'],
    ['fill="#FFFFFF" stroke="#2F77CC" stroke-width="2" stroke-linejoin="round"', 'fill="#FFFFFF" stroke="#D88C9A" stroke-width="2" stroke-linejoin="round"'],
    ['<path d="M16 18 L32 2" stroke="#2F77CC" stroke-width="2">', '<path d="M16 18 L32 2" stroke="#D88C9A" stroke-width="2">'],
    // dates: striped washi tape in pink and sage
    ['<span class="jr-tape" style="background: rgba(249,203,216,0.95);">', '<span class="jr-tape jr-t-pink">'],
    ['<span class="jr-tape" style="background: rgba(246,239,196,0.95);">', '<span class="jr-tape jr-t-sage">'],
    ['<span class="jr-loc" style="color: #8A3A0B;">', '<span class="jr-loc" style="color: #4E7A4C;">'],
    // cards: pink and sage postcard frames
    ['<div class="jr-card" style="background: #FBFAF6; transform: rotate(0.4deg);">', '<div class="jr-card jr-pc jr-pc-pink" style="rotate: 0.4deg;">'],
    ['<div class="jr-card" style="background-color: #EBDAB9; background-image: repeating-linear-gradient(80deg, rgba(120,90,40,0.05) 0 2px, transparent 2px 9px); transform: rotate(-0.4deg);">', '<div class="jr-card jr-pc jr-pc-sage" style="rotate: -0.4deg;">'],
    // nested program: gold paperclip
    ['stroke="#8E929A" stroke-width="3" stroke-linecap="round"', 'stroke="#C9A04A" stroke-width="3" stroke-linecap="round"'],
  ];
  for (const [a, b] of swaps) html = html.split(a).join(b);
  // the Figma selection frame around the nested program
  html = html.replace(/\n *<div class="sel" style="inset: -?\d+px;"><i><\/i><i><\/i><i><\/i><i><\/i>(<b>[^<]*<\/b>)?<\/div>(?=\n *<span class="jr-chip">)/g, '');
  // the empty "next chapter" stop after the last card, and the line that led down to it
  html = html.replace(/\n\n *<!-- next chapter -->\n *<li>\s*<span class="jr-hdl" aria-hidden="true"><\/span>\s*<\/li>/, '');
  html = html.replace(/(<!-- Study abroad[^>]*-->\n *<li>\n *<span class="jr-hdl" aria-hidden="true"><\/span>)\n *<svg class="jr-line"[\s\S]*?<\/svg>/, '$1');
  // stamps: real perforated stamps (Japan flag, maple leaf)
  html = html.replace(/<svg class="jr-stamp"[^>]*style="transform: rotate\((-?\d+)deg\);">[\s\S]*?<\/svg>/g, (m, rot) => stamp(m.includes('<circle') ? 'jp' : 'ca', rot));
  return html;
}

const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.07'/%3E%3C/svg%3E")`;

function css(mobile) {
  const k = mobile
    ? { frame: 9, stamp: [44, 52], sp: 4, g: 8, r: 2.3, stitch: 7 }
    : { frame: 12, stamp: [64, 76], sp: 6, g: 10, r: 2.8, stitch: 9 };
  const perf = `radial-gradient(circle ${k.r}px at 0 0,#0000 98%,#000) 0 0/${k.g}px ${k.g}px round border-box,radial-gradient(circle ${k.r}px at 100% 100%,#0000 98%,#000) 0 0/${k.g}px ${k.g}px round border-box`;
  return `${CSS_START}
.jr-hdl{border-radius:50%;background:#F2C3CC;border:2px solid #FFFFFF;box-shadow:0 0 0 1.5px #D88C9A}
.jr-tape{background-color:#F2C3CC;background-image:repeating-linear-gradient(-45deg,rgba(255,255,255,.4) 0 4px,transparent 4px 10px);box-shadow:0 6px 10px -8px rgba(0,0,0,.4)}
.jr-t-sage{background-color:#C9E0C0}
.jr-pc{background-color:#FDFAF3;background-image:${NOISE};box-shadow:inset 0 0 0 ${k.frame}px var(--jf),0 18px 26px -16px rgba(40,64,90,.4)}
.jr-pc-pink{--jf:#F3CDD3}
.jr-pc-sage{--jf:#BCD5B3}
.jr-perf{width:${k.stamp[0]}px;height:${k.stamp[1]}px;box-sizing:border-box;padding:${k.sp}px;background:#FFFFFF;-webkit-mask:linear-gradient(#000 0 0) content-box,${perf};-webkit-mask-composite:source-over,source-in;mask:linear-gradient(#000 0 0) content-box,${perf};mask-composite:add,intersect}
.jr-perf svg{display:block;width:100%;height:100%}
.jr-nest{background-color:#FDFAF3;background-image:${NOISE};outline:2px dashed #E3A1B0;outline-offset:-${k.stitch}px;box-shadow:0 12px 18px -12px rgba(40,64,90,.4)}
.jr-chip{background-color:#F2C3CC;background-image:repeating-linear-gradient(-45deg,rgba(255,255,255,.4) 0 4px,transparent 4px 10px);rotate:-1.5deg}
${CSS_END}`;
}

for (const file of FILES) {
  const src = await readFile(file, 'utf8');
  const header = src.split('\n')[0];
  const board = (await import(pathToFileURL(file).href + '?t=' + Date.now())).default;
  for (const mode of ['desktop', 'mobile']) {
    const b = board[mode];
    b.html = restyle(b.html);
    for (const left of ['#2F77CC', 'rgba(249,203,216', 'rgba(246,239,196', '#EBDAB9', '#8E929A', 'class="jr-stamp" ', 'inside study abroad']) {
      const jr = b.html.slice(b.html.indexOf('<ol class="jr"'), b.html.indexOf('</ol>', b.html.indexOf('<ol class="jr"')));
      if (jr.includes(left)) throw new Error(`left over "${left}" in ${file} ${mode}`);
    }
    const c0 = b.css.indexOf(CSS_START);
    if (c0 >= 0) b.css = b.css.slice(0, c0) + b.css.slice(b.css.indexOf(CSS_END) + CSS_END.length + 1);
    b.css += css(mode === 'mobile') + '\n';
  }
  const body = ['desktop', 'mobile'].map((mode) => {
    const fields = Object.entries(board[mode]).map(([k, v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)}`);
    return `${JSON.stringify(mode)}: {\n${fields.join(',\n')}\n}`;
  }).join(',\n');
  await writeFile(file, `${header}\nexport default {\n${body}\n};\n`);
  console.log('updated', file);
}
