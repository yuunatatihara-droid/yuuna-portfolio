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
      const path = e.composedPath();
      const a = path.find((n) => n.tagName === 'A');
      if (!a) {
        // A larger click area (e.g. a whole project frame) can point at a page with data-href.
        const area = path.find((n) => n.dataset?.href);
        if (area) navigate(area.dataset.href);
        return;
      }
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

    // A board can list selectors to animate in (board.reveal: { kind: selector }); each match is tagged
    // data-reveal="kind", skipping anything inside or around an element that is already tagged.
    for (const [kind, selector] of Object.entries(board.reveal || {})) {
      root.querySelectorAll(selector).forEach((el) => {
        if (el.closest('[data-reveal]') || el.querySelector('[data-reveal]')) return;
        el.setAttribute('data-reveal', kind);
      });
    }

    // Elements marked data-reveal get the class "in" once their top passes 85% of the viewport height
    // (boards animate on it). Checking on scroll, rather than with an IntersectionObserver, also
    // catches elements that a fast scroll carries past the viewport between frames.
    let pending = [...root.querySelectorAll('[data-reveal]')];
    let frame = 0;
    const check = () => {
      frame = 0;
      const line = window.innerHeight * 0.85;
      pending = pending.filter((el) => {
        if (el.getBoundingClientRect().top >= line) return true;
        el.classList.add('in');
        return false;
      });
      if (!pending.length) stop();
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(check); };
    const stop = () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
    if (pending.length) {
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      check();
    }

    return () => {
      root.removeEventListener('click', onClick);
      stop();
    };
  }, [board]);

  return <div ref={hostRef} style={{ width: board.width }} />;
}
