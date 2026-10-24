// Rebuilds the three About page Skills cards (JA + EN, desktop + mobile) as stationery:
// 01 a pink postage stamp, 02 a postcard with a mini stamp and postmark, 03 a sage stamp,
// each held by a clip (gold paperclip, pink clamp, heart paperclip).
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

const clips = {
  paperclip: (id, w, style) => `<svg class="clip" aria-hidden="true" viewBox="-2 -2 32 82" width="${w}" height="${Math.round(w * 82 / 32)}" style="${style}"><defs>${GOLD.replace('__g', id)}</defs><path d="${WIRE}" fill="none" stroke="url(#${id})" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  heart: (id, w, style) => `<svg class="clip" aria-hidden="true" viewBox="-2 -24 44 106" width="${w}" height="${Math.round(w * 106 / 44)}" style="${style}"><defs>${SILVER.replace('__s', id)}<linearGradient id="${id}h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F28AA6"/><stop offset="1" stop-color="#C2345A"/></linearGradient></defs><path d="${WIRE}" transform="translate(4 0)" fill="none" stroke="url(#${id})" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 17C6 8-2 -2 4-11c5-7 13-5 14 2 1-7 9-9 14-2 6 9-2 19-14 28Z" fill="url(#${id}h)" stroke="#E6E9EE" stroke-width="3" stroke-linejoin="round"/><path d="M8-8c2-3 6-3 7 0" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" opacity=".8"/><g fill="#FFFFFF" opacity=".55"><circle cx="24" cy="-3" r="1.4"/><circle cx="12" cy="4" r="1.1"/><circle cx="20" cy="8" r="1"/></g></svg>`,
  clamp: (id, w, style) => `<svg class="clip" aria-hidden="true" viewBox="0 0 120 74" width="${w}" height="${Math.round(w * 74 / 120)}" style="${style}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F8C3CE"/><stop offset=".6" stop-color="#EE9DAF"/><stop offset="1" stop-color="#D97F94"/></linearGradient></defs><path fill-rule="evenodd" d="M46 2h28a8 8 0 0 1 8 8v28H38V10a8 8 0 0 1 8-8ZM60 8a6.5 6.5 0 1 0 .01 0Z" fill="url(#${id})"/><rect x="4" y="32" width="112" height="30" rx="6" fill="url(#${id})"/><rect x="4" y="58" width="112" height="9" rx="3" fill="#D27A90"/><rect x="10" y="36" width="100" height="3" rx="1.5" fill="#FFFFFF" opacity=".5"/><path d="M44 6h6" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" opacity=".6"/><text x="60" y="52" text-anchor="middle" font-family="'Bagel Fat One',sans-serif" font-size="11" fill="#FFFFFF" opacity=".75" letter-spacing="1">YUUNA</text></svg>`,
};

// ---------- small pieces ----------
const postmark = (w, style) => `<svg class="pc-mark" aria-hidden="true" viewBox="0 0 120 56" width="${w}" height="${Math.round(w * 56 / 120)}" style="${style}"><g fill="none" stroke="#B65A72" stroke-width="1.6" stroke-linecap="round" opacity=".7">${[14, 24, 34, 44].map((y) => `<path d="M2 ${y}q6-5 12 0t12 0t12 0t12 0t12 0"/>`).join('')}<circle cx="92" cy="28" r="23"/><circle cx="92" cy="28" r="16" stroke-width="1"/></g><g fill="#B65A72" opacity=".75" font-family="'Zen Maru Gothic',sans-serif" font-weight="700" text-anchor="middle"><text x="92" y="25" font-size="7" letter-spacing=".5">2026</text><text x="92" y="35" font-size="6" letter-spacing=".5">DESIGN</text></g></svg>`;

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
        <p class="pc-script" aria-hidden="true">Postcard</p>
        ${num}
        <h3 class="sk-h">${c.title}</h3>
        ${list}
        <p class="pc-sign" aria-hidden="true">Love, Yuuna</p>
        ${miniStamp(mobile ? 'right: 16px; top: 16px;' : 'right: 20px; top: 20px;')}
        ${postmark(mobile ? 78 : 96, mobile ? 'right: 38px; top: 50px;' : 'right: 46px; top: 62px;')}
        </div></div>
        ${clips.clamp(`clamp${mobile ? 'm' : ''}`, mobile ? 112 : 140, `left: 50%; top: ${mobile ? -40 : -50}px; margin-left: -${mobile ? 56 : 70}px; rotate: -3deg;`)}
      </div>`;
  }
  const sage = i === 2;
  const clip = sage
    ? clips.heart(`heart${mobile ? 'm' : ''}`, mobile ? 40 : 48, `right: ${mobile ? 28 : 36}px; top: ${mobile ? -48 : -58}px; rotate: 10deg;`)
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
.pc-script{margin:0 0 ${mobile ? 6 : 8}px;font-family:'Meow Script',cursive;font-size:${k.script}px;line-height:1;color:#C2345A}
.pc .sk-list{border-top:none;padding:4px 0 0;gap:0}
.pc .sk-list li{min-height:46px;border-bottom:1.5px solid rgba(194,52,90,.2);background:none;transform:none;clip-path:none;padding:0;border-radius:0;box-shadow:none;align-self:stretch;min-width:0}
.pc-sage .sk-list li{border-bottom-color:rgba(94,138,92,.28)}
.pc-post .sk-list li{border-bottom-color:rgba(47,119,204,.18)}
.pc .sk-list li::before{content:"✦" / "";position:static;width:auto;height:auto;margin:0;border-radius:0;background:none;box-shadow:none;font-size:12px;color:#C2345A}
.pc-sage .sk-list li::before{color:#5E8A5C}
.pc-post .sk-list li::before{content:"♡" / "";font-size:14px}
.pc .sk-list li.add{min-height:0;margin-top:14px;border:2px dashed #2F77CC;border-radius:12px;flex-direction:column;align-items:flex-start;justify-content:center;gap:0;padding:8px 16px;font-size:14px;color:#1F3B24}
.pc .sk-list li.add::before{display:none}
.pc-sign{margin:${mobile ? 14 : 18}px 0 0;align-self:flex-end;font-family:'Meow Script',cursive;font-size:${k.sign}px;line-height:1;color:#5B5B55}
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
