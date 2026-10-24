import { useLayoutEffect, useRef } from 'react';
import { navigate, handleInPageHash } from '../router.js';
import { rememberLanguage } from '../language.js';

/**
 * Renders one design board exactly as authored: its original markup and CSS are
 * mounted inside a Shadow DOM so each board keeps its own styles without
 * leaking into (or being affected by) the other boards on the page.
 */
export default function Board({ board }) {
  const hostRef = useRef(null);

  useLayoutEffect(() => {
    const host = hostRef.current;
    const root = host.shadowRoot || host.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>:host{display:block}*{-webkit-tap-highlight-color:transparent}${board.css}</style>${board.html}`;

    const onClick = (e) => {
      const a = e.composedPath().find((n) => n.tagName === 'A');
      if (!a) return;
      const href = a.getAttribute('href') || '';
      if (href.startsWith('mailto:') || href.startsWith('http')) return;
      if (href.startsWith('/')) {
        e.preventDefault();
        const lang = a.getAttribute('hreflang');
        if (lang) rememberLanguage(lang);
        navigate(href);
      } else if (href.startsWith('#')) {
        e.preventDefault();
        if (href.length > 1) handleInPageHash(href.slice(1));
      }
    };
    root.addEventListener('click', onClick);

    // Elements marked data-reveal get the class "in" once they scroll into view (boards animate on it).
    const reveal = root.querySelectorAll('[data-reveal]');
    let io;
    if (reveal.length && 'IntersectionObserver' in window) {
      io = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
        // Hidden-state styles (clip-path, scale 0) make the visible ratio 0, so trigger on any overlap
        // with the viewport minus its bottom 15% instead of on a ratio.
      }, { threshold: 0, rootMargin: '0px 0px -15% 0px' });
      reveal.forEach((el) => io.observe(el));
    } else {
      reveal.forEach((el) => el.classList.add('in'));
    }

    return () => {
      root.removeEventListener('click', onClick);
      io?.disconnect();
    };
  }, [board]);

  return <div ref={hostRef} style={{ width: board.width }} />;
}
