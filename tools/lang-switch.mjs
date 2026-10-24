// Language switch shown beside the main menu: text only (EN / JA), in the same translucent pill as the menu.
// The current language is a cream segment; the other one links to the same page in that language.
const INK = '#1F3B24', CREAM = '#F6EFC4';

export function switchMarkup({ lang, enHref, jaHref, mobile }) {
  const seg = mobile
    ? 'box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; min-width: 32px; min-height: 36px; padding: 0 8px; border-radius: 999px; font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-decoration: none;'
    : 'box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; min-width: 46px; min-height: 42px; padding: 0 12px; border-radius: 999px; font-size: 14px; font-weight: 700; letter-spacing: 0.06em; text-decoration: none;';
  const on = `${seg} background: ${CREAM}; color: ${INK};`;
  const off = `${seg} color: ${INK};`;
  const item = (code, label, href, name) => code === lang
    ? `<span lang="${code}" aria-current="true" title="${name}" style="${on}">${label}</span>`
    : `<a href="${href}" lang="${code}" hreflang="${code}" aria-label="${code === 'en' ? 'Switch to English' : '日本語に切り替え'}" title="${name}" style="${off}">${label}</a>`;
  const wrap = `display: inline-flex; align-items: center; gap: ${mobile ? 0 : 2}px; padding: ${mobile ? 4 : 5}px; border-radius: 999px; background: rgba(255,255,255,0.7);`;
  return `<div class="lang-switch" role="group" aria-label="${lang === 'ja' ? '言語' : 'Language'}" style="${wrap}">${item('en', 'EN', enHref, 'English')}${item('ja', 'JA', jaHref, '日本語')}</div>`;
}

// Takes the old switch link out of the main menu and puts the switch beside the menu.
export function applySwitch(html, opts) {
  const re = /(<nav aria-label="(?:メインメニュー|Main menu)"[^>]*>)([\s\S]*?)(\s*<\/nav>)/;
  const m = html.match(re);
  if (!m) throw new Error('main menu not found');
  if (html.includes('class="lang-switch"')) throw new Error('switch already added');
  const body = m[2].replace(/\s*<a href="[^"]*" lang="(?:en|ja)" hreflang="(?:en|ja)"[^>]*>[^<]*<\/a>/, '');
  if (body === m[2]) throw new Error('old switch link not found');
  const gap = opts.mobile ? 8 : 12;
  return html.replace(re, `<div style="display: flex; align-items: center; gap: ${gap}px;">${m[1]}${body}${m[3]}${switchMarkup(opts)}</div>`);
}

// Replaces an existing switch with the current design.
export function restyleSwitch(html, opts) {
  const re = /<div class="lang-switch"[^>]*>[\s\S]*?<\/div>/;
  if (!re.test(html)) throw new Error('switch not found');
  return html.replace(re, switchMarkup(opts));
}
