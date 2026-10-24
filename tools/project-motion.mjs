// Motion for the case study pages (MUSE, Maple Nest). Board.jsx tags elements from REVEAL with
// data-reveal and adds "in" when they scroll into view; this CSS animates on that.
export const REVEAL = {
  // The selection box in the hero draws in like the ones on the home page.
  sel: '.s-hero .sel',
  // Children of these appear one after another.
  group: '.rcards,.fcards,.stat-grid,.r3,.arc,.prio,.vids,.mine-ph,.labels,.mrows,.drs,.swatches,.types,.fig2,.bars2,.phase,.chain,.iaf',
  // These rise in on their own.
  up: '.sh,.sh2,.duo,.hmw,.fig,.cta,.nextp,.fs-row,.diff,.limits2,.note,.f-intro,.quote',
};

export const CSS = `
/* ── Case study motion ── */
@media (prefers-reduced-motion: no-preference){
[data-reveal="up"]{transition:opacity .7s ease,translate .7s cubic-bezier(.2,.8,.2,1)}
[data-reveal="up"]:not(.in){opacity:0;translate:0 32px}
[data-reveal="group"]>*{transition:opacity .6s ease,translate .6s cubic-bezier(.2,.8,.2,1)}
[data-reveal="group"]:not(.in)>*{opacity:0;translate:0 28px}
[data-reveal="group"]>:nth-child(2){transition-delay:.09s}
[data-reveal="group"]>:nth-child(3){transition-delay:.18s}
[data-reveal="group"]>:nth-child(4){transition-delay:.27s}
[data-reveal="group"]>:nth-child(5){transition-delay:.36s}
[data-reveal="group"]>:nth-child(n+6){transition-delay:.45s}
.bars .bar u i{transition:width 1.1s cubic-bezier(.2,.8,.2,1) .35s}
.bars2[data-reveal]:not(.in) .bar u i{width:0!important}
.sel[data-reveal="sel"]{transition:clip-path .8s cubic-bezier(.2,.8,.2,1) .3s,opacity .4s ease .3s}
.sel[data-reveal="sel"]:not(.in){opacity:0;clip-path:inset(0 100% 100% 0)}
.sel[data-reveal="sel"].in{clip-path:inset(-48px)}
.sel[data-reveal="sel"]>i{transition:scale .4s cubic-bezier(.3,1.8,.5,1) .8s}
.sel[data-reveal="sel"]:not(.in)>i{scale:0}
.sel[data-reveal="sel"]>b{transition:opacity .35s ease 1.1s,translate .35s ease 1.1s}
.sel[data-reveal="sel"]:not(.in)>b{opacity:0;translate:0 8px}
.sticker{animation:wobble 5s ease-in-out infinite}
@keyframes wobble{0%,100%{rotate:0deg}50%{rotate:8deg}}
.s-hero h1 .ch{display:inline-block;animation:tpop .8s cubic-bezier(.3,1.6,.5,1) calc(var(--i) * 70ms + 150ms) both}
.s-hero h1 .cw{display:inline-block;transition:color .25s}
.s-hero h1 .cw:hover{color:#C2345A}
.s-hero h1:hover .cw{animation:twave .8s cubic-bezier(.3,1.4,.5,1) calc(var(--i) * 55ms) both}
@keyframes tpop{from{opacity:0;transform:translateY(.45em) scale(.6)}to{opacity:1;transform:none}}
@keyframes twave{0%,100%{transform:none}30%{transform:translateY(-.16em) rotate(-7deg) scale(1.05,1.08)}55%{transform:translateY(.02em) scale(1.06,.92)}78%{transform:translateY(-.04em) rotate(2deg)}}
.rcard,.pc,.stat,.mrow,.fc{transition:translate .3s ease,box-shadow .3s ease}
.rcard:hover,.pc:hover,.stat:hover,.mrow:hover{translate:0 -4px}
}
`;

// Splits a hero title ("MUSE", "Maple<br>Nest") into letters that pop in and wave on hover,
// keeping the whole title as one word for screen readers.
export function titleLetters(title) {
  const plain = title.replace(/<br\s*\/?>/g, ' ');
  let i = 0;
  const letters = title.split(/(<br\s*\/?>)/).map((part) => /^<br/.test(part) ? part
    : [...part].map((c) => `<span class="ch" aria-hidden="true" style="--i: ${i++};"><span class="cw">${c}</span></span>`).join('')).join('');
  return `<span class="sr">${plain}</span>${letters}`;
}
export const SR_CSS = '\n.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}\n';
