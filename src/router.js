// Minimal client-side router (History API), so the site has no extra runtime dependencies.
import { useEffect, useState } from 'react';

const listeners = new Set();

function scrollToHash(hash) {
  if (!hash) {
    window.scrollTo(0, 0);
    return;
  }
  // Wait a frame so the new page has rendered before scrolling.
  requestAnimationFrame(() => {
    const el = document.getElementById(hash);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else window.scrollTo(0, 0);
  });
}

export function navigate(to) {
  const [path, hash] = to.split('#');
  const target = path || '/';
  if (target !== window.location.pathname) {
    window.history.pushState({}, '', target + (hash ? '#' + hash : ''));
    listeners.forEach((fn) => fn(target));
  }
  scrollToHash(hash);
}

export function usePath() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    listeners.add(setPath);
    window.addEventListener('popstate', onPop);
    return () => {
      listeners.delete(setPath);
      window.removeEventListener('popstate', onPop);
    };
  }, []);
  return path;
}

export function handleInPageHash(hash) {
  scrollToHash(hash);
}
