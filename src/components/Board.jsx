import { useLayoutEffect, useRef } from 'react';
import { navigate, handleInPageHash } from '../router.js';

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
        navigate(href);
      } else if (href.startsWith('#')) {
        e.preventDefault();
        if (href.length > 1) handleInPageHash(href.slice(1));
      }
    };
    root.addEventListener('click', onClick);
    return () => root.removeEventListener('click', onClick);
  }, [board]);

  return <div ref={hostRef} style={{ width: board.width }} />;
}
