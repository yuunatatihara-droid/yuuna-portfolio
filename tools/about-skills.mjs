// Rebuilds the three About page Skills cards (JA + EN, desktop + mobile) as stationery:
// 01 a pink postage stamp, 02 a postcard with a mini stamp and postmark, 03 a sage stamp,
// each held by a clip (gold paperclip, white polka-dot clamp, silver star paperclip). No extra lettering.
// The card titles and list items are read from the board, so re-running it is safe.
//   node tools/about-skills.mjs
import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const FILES = ['src/boards/about.js', 'src/boards/about-en.js'];
const CSS_START = '/* about-skill-cards */';
const CSS_END = '/* /about-skill-cards */';
const START = '<!-- SKILL CARDS -->';
const END = '<!-- /SKILL CARDS -->';

// ---------- clips (reference: a sheet of clips, paperclips and clamps) ----------
const GOLD = '<linearGradient id="__g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#B8893A"/><stop offset=".45" stop-color="#F6E3A1"/><stop offset=".7" stop-color="#D6AE58"/><stop offset="1" stop-color="#A97A2C"/></linearGradient>';
const SILVER = '<linearGradient id="__s" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9AA1AB"/><stop offset=".45" stop-color="#FFFFFF"/><stop offset=".7" stop-color="#C5CBD3"/><stop offset="1" stop-color="#8C939D"/></linearGradient>';
const WIRE = 'M10 24V58a5 5 0 0 0 10 0V13a8.5 8.5 0 0 0-17 0V62a11 11 0 0 0 22 0V30';

const TAB = 'M46 2h28a8 8 0 0 1 8 8v28H38V10a8 8 0 0 1 8-8ZM60 8a6.5 6.5 0 1 0 .01 0Z';
const STAR5 = (cx, cy, R, r) => Array.from({ length: 10 }, (_, i) => {
  const a = -Math.PI / 2 + (i * Math.PI) / 5, d = i % 2 ? r : R;
  return `${(cx + d * Math.cos(a)).toFixed(1)},${(cy + d * Math.sin(a)).toFixed(1)}`;
}).join(' ');

const clips = {
  paperclip: (id, w, style, metal = GOLD) => `<svg class="clip" aria-hidden="true" viewBox="-2 -2 32 82" width="${w}" height="${Math.round(w * 82 / 32)}" style="${style}"><defs>${metal.replace(/__[gs]/, id)}</defs><path d="${WIRE}" fill="none" stroke="url(#${id})" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  clamp: (id, w, style) => `<svg class="clip" aria-hidden="true" viewBox="0 0 120 74" width="${w}" height="${Math.round(w * 74 / 120)}" style="${style}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".7" stop-color="#F6F3EF"/><stop offset="1" stop-color="#E4DED8"/></linearGradient><pattern id="${id}d" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3.5" r="2.6" fill="#E46F8A"/><circle cx="10.5" cy="10.5" r="2.6" fill="#E46F8A"/></pattern></defs><g stroke="#E2DCD5" stroke-width="1"><path fill-rule="evenodd" d="${TAB}" fill="url(#${id})"/><rect x="4" y="32" width="112" height="30" rx="6" fill="url(#${id})"/></g><path fill-rule="evenodd" d="${TAB}" fill="url(#${id}d)"/><rect x="4" y="32" width="112" height="30" rx="6" fill="url(#${id}d)"/><rect x="4" y="58" width="112" height="9" rx="3" fill="#DCD5CE"/><rect x="10" y="35" width="100" height="3" rx="1.5" fill="#FFFFFF" opacity=".8"/></svg>`,
  // a paperclip topped with a puffy silver star (reference photo)
  star: (id, w, style) => `<svg class="clip" aria-hidden="true" viewBox="-10 -20 48 100" width="${w}" height="${Math.round(w * 100 / 48)}" style="${style}"><defs>${SILVER.replace('__s', id)}<radialGradient id="${id}r" cx="38%" cy="30%" r="75%"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#DADEE4"/><stop offset="1" stop-color="#9EA6B1"/></radialGradient></defs><path d="${WIRE}" fill="none" stroke="url(#${id})" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/><polygon points="${STAR5(14, 3, 17, 8.5)}" fill="url(#${id}r)" stroke="url(#${id}r)" stroke-width="6" stroke-linejoin="round"/><polygon points="${STAR5(14, 3, 17, 8.5)}" fill="none" stroke="#A9B0BA" stroke-width="1" stroke-linejoin="round" opacity=".6" transform="translate(0 .6)"/><ellipse cx="8" cy="-6" rx="4" ry="2.4" fill="#FFFFFF" opacity=".85" transform="rotate(-30 8 -6)"/><g fill="#8C939D" opacity=".75"><circle cx="10.5" cy="3" r="1.1"/><circle cx="17.5" cy="3" r="1.1"/><circle cx="4" cy="5" r=".8"/><circle cx="24" cy="5" r=".8"/></g><path d="M12.2 6.4q1.8 1.6 3.6 0" fill="none" stroke="#8C939D" stroke-width=".9" stroke-linecap="round" opacity=".75"/></svg>`,
};

// ---------- small pieces ----------
const postmark = (w, style) => `<svg class="pc-mark" aria-hidden="true" viewBox="0 0 120 56" width="${w}" height="${Math.round(w * 56 / 120)}" style="${style}"><g fill="none" stroke="#B65A72" stroke-width="1.6" stroke-linecap="round" opacity=".7">${[14, 24, 34, 44].map((y) => `<path d="M2 ${y}q6-5 12 0t12 0t12 0t12 0t12 0"/>`).join('')}<circle cx="92" cy="28" r="23"/><circle cx="92" cy="28" r="16" stroke-width="1"/></g></svg>`;

const miniStamp = (style) => `<div class="pc-frame pc-mini" aria-hidden="true" style="${style}"><svg viewBox="0 0 40 48" preserveAspectRatio="none"><defs><linearGradient id="msky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9EC9E8"/><stop offset="1" stop-color="#DCEEF8"/></linearGradient></defs><rect width="40" height="48" fill="url(#msky)"/><circle cx="29" cy="13" r="5" fill="#F6EFC4"/><path d="M0 36q10-9 20-3t20-4V48H0Z" fill="#8DB58A"/><path d="M0 41q12-6 24-1t16-2V48H0Z" fill="#5E8A5C"/><g fill="#F28AA6"><circle cx="9" cy="39" r="1.6"/><circle cx="15" cy="42" r="1.4"/><circle cx="31" cy="40" r="1.6"/></g></svg></div>`;

// ---------- markup ----------
function card(c, i, mobile) {
  const items = c.items.map((li) => `          ${li}`).join('\n');
  const list = `<ul class="sk-list">\n${items}\n        </ul>`;
  const num = `<span class="sk-num">${c.num}</span>`;
  if (i === 1) {
    return `      <!-- ${c.num} postcard -->
      <div class="sk-card pc pc-post" style="rotate: ${mobile ? 0.8 : 1}deg;">
        <div class="pc-frame"><div class="pc-paper">
        ${num}
        <h3 class="sk-h">${c.title}</h3>
        ${list}
        ${miniStamp(mobile ? 'right: 14px; top: 12px;' : 'right: 18px; top: 14px;')}
        ${postmark(mobile ? 78 : 96, mobile ? 'right: 52px; top: 16px;' : 'right: 64px; top: 20px;')}
        </div></div>
        ${clips.clamp(`clamp${mobile ? 'm' : ''}`, mobile ? 112 : 140, `left: 50%; top: ${mobile ? -40 : -50}px; margin-left: -${mobile ? 56 : 70}px; rotate: -3deg;`)}
      </div>`;
  }
  const sage = i === 2;
  const clip = sage
    ? clips.star(`sclip${mobile ? 'm' : ''}`, mobile ? 58 : 72, `right: ${mobile ? 30 : 44}px; top: ${mobile ? -58 : -72}px; rotate: -6deg;`)
    : clips.paperclip(`pclip${mobile ? 'm' : ''}`, mobile ? 30 : 38, `right: ${mobile ? 44 : 60}px; top: ${mobile ? -28 : -34}px; rotate: 8deg;`);
  return `      <!-- ${c.num} stamp -->
      <div class="sk-card pc pc-stamp${sage ? ' pc-sage' : ''}" style="rotate: ${sage ? -0.8 : -1.4}deg;">
        <div class="pc-frame"><div class="pc-paper">
        ${num}
        <h3 class="sk-h">${c.title}</h3>
        ${list}
        </div></div>
        ${clip}
      </div>`;
}

// ---------- CSS ----------
const PAPER = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.07'/%3E%3C/svg%3E")`;

function css(mobile) {
  const k = mobile
    ? { g: 18, r: 5, pad: 11, post: 10, in: '24px 22px 26px', mini: [40, 48], mg: 8, mr: 2.4, mp: 5, script: 26, sign: 24 }
    : { g: 22, r: 6, pad: 13, post: 12, in: '30px 30px 32px', mini: [48, 58], mg: 9, mr: 2.8, mp: 6, script: 30, sign: 28 };
  // Perforation: holes at every tile corner (two layers intersected so the right and bottom edges
  // get holes too), then the content box added back so only the edge row of holes shows.
  const perf = (g, r) => `radial-gradient(circle ${r}px at 0 0,#0000 98%,#000) 0 0/${g}px ${g}px round border-box,radial-gradient(circle ${r}px at 100% 100%,#0000 98%,#000) 0 0/${g}px ${g}px round border-box`;
  return `${CSS_START}
.sk-grid{gap:${mobile ? 44 : 48}px}
.pc{padding:0;background:none;box-shadow:none;filter:drop-shadow(0 14px 12px rgba(40,64,90,.22))}
.pc-frame{position:relative;flex:1;display:flex;flex-direction:column;box-sizing:border-box;padding:${k.pad}px;background:#F2C3CC}
.pc-stamp .pc-frame{-webkit-mask:linear-gradient(#000 0 0) content-box,${perf(k.g, k.r)};-webkit-mask-composite:source-over,source-in;mask:linear-gradient(#000 0 0) content-box,${perf(k.g, k.r)};mask-composite:add,intersect}
.pc-sage .pc-frame{background:#BCD5B3}
.pc-post .pc-frame{padding:${k.post}px;background:#F3CDD3;border-radius:3px}
.pc-paper{position:relative;flex:1;box-sizing:border-box;padding:${k.in};display:flex;flex-direction:column;background-color:#FDFAF3;background-image:${PAPER}}
.pc-stamp .pc-paper{box-shadow:inset 0 0 0 6px #FDFAF3,inset 0 0 0 7.5px #E3A1B0}
.pc-sage .pc-paper{box-shadow:inset 0 0 0 6px #FDFAF3,inset 0 0 0 7.5px #9DBD92}
.pc .sk-num{background:#F9CBD8}
.pc-sage .sk-num{background:#C9E0C0}
.pc-post .sk-num{background:#D4EAF7}
.pc .sk-list{border-top:none;padding:4px 0 0;gap:0}
.pc .sk-list li{min-height:46px;border-bottom:1.5px solid rgba(194,52,90,.2);background:none;transform:none;clip-path:none;padding:0;border-radius:0;box-shadow:none;align-self:stretch;min-width:0}
.pc-sage .sk-list li{border-bottom-color:rgba(94,138,92,.28)}
.pc-post .sk-list li{border-bottom-color:rgba(47,119,204,.18)}
.pc .sk-list li::before{content:"✦" / "";position:static;width:auto;height:auto;margin:0;border-radius:0;background:none;box-shadow:none;font-size:12px;color:#C2345A}
.pc-sage .sk-list li::before{color:#5E8A5C}
.pc .sk-list li.add{min-height:0;margin-top:14px;border:2px dashed #2F77CC;border-radius:12px;flex-direction:column;align-items:flex-start;justify-content:center;gap:0;padding:8px 16px;font-size:14px;color:#1F3B24}
.pc .sk-list li.add::before{display:none}
.pc-mini{position:absolute;width:${k.mini[0]}px;height:${k.mini[1]}px;padding:${k.mp}px;background:#FFFFFF;rotate:4deg;filter:drop-shadow(0 2px 2px rgba(0,0,0,.18));-webkit-mask:linear-gradient(#000 0 0) content-box,${perf(k.mg, k.mr)};-webkit-mask-composite:source-over,source-in;mask:linear-gradient(#000 0 0) content-box,${perf(k.mg, k.mr)};mask-composite:add,intersect}
.pc-mini svg{display:block;width:100%;height:100%}
.pc-mark{position:absolute;pointer-events:none;rotate:-8deg}
.clip{position:absolute;z-index:2;overflow:visible;filter:drop-shadow(1px 3px 2px rgba(40,40,40,.28))}
${CSS_END}`;
}

// ---------- apply ----------
for (const file of FILES) {
  const src = await readFile(file, 'utf8');
  const header = src.split('\n')[0];
  const board = (await import(pathToFileURL(file).href + '?t=' + Date.now())).default;
  for (const mode of ['desktop', 'mobile']) {
    const b = board[mode];
    const mobile = mode === 'mobile';
    let at = b.html.indexOf(START), end;
    if (at >= 0) {
      end = b.html.indexOf(END, at) + END.length;
    } else {
      // first run: from the selection frame inside the grid to the grid's closing tag
      const grid = b.html.indexOf('<div class="sk-grid"');
      at = b.html.indexOf('<div class="sel"', grid);
      let u = at;
      for (let n = 0; n < 3; n++) u = b.html.indexOf('</ul>', u) + 5;
      end = b.html.indexOf('</div>', u) + 6; // closes the third card
    }
    const block = b.html.slice(at, end);
    const cards = [...block.matchAll(/<span class="sk-num"[^>]*>([^<]*)<\/span>\s*<h3 class="sk-h">([\s\S]*?)<\/h3>\s*<ul class="sk-list">([\s\S]*?)<\/ul>/g)]
      .map(([, num, title, ul]) => ({
        num, title,
        items: [...ul.matchAll(/<li([^>]*)>([\s\S]*?)<\/li>/g)].map(([, attrs, inner]) => {
          const add = /class="add"/.test(attrs);
          return `<li${add ? ' class="add"' : ''}>${add ? inner : inner.replace(/<span aria-hidden="true">✓<\/span>/, '')}</li>`;
        }),
      }));
    if (cards.length !== 3) throw new Error(`expected 3 skill cards in ${file} ${mode}, got ${cards.length}`);
    const html = `${START}\n${cards.map((c, i) => card(c, i, mobile)).join('\n\n')}\n      ${END}`;
    b.html = b.html.slice(0, at) + html + b.html.slice(end);
    const c0 = b.css.indexOf(CSS_START);
    if (c0 >= 0) b.css = b.css.slice(0, c0) + b.css.slice(b.css.indexOf(CSS_END) + CSS_END.length + 1);
    b.css += css(mobile) + '\n';
  }
  const body = ['desktop', 'mobile'].map((mode) => {
    const fields = Object.entries(board[mode]).map(([k, v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)}`);
    return `${JSON.stringify(mode)}: {\n${fields.join(',\n')}\n}`;
  }).join(',\n');
  await writeFile(file, `${header}\nexport default {\n${body}\n};\n`);
  console.log('updated', file);
}
