import { useEffect, useState } from 'react';
import Board from './Board.jsx';

const MOBILE_MAX = 767; // below 768px the mobile (390px) boards are used

function useViewportWidth() {
  const read = () => document.documentElement.clientWidth || window.innerWidth;
  const [w, setW] = useState(read);
  useEffect(() => {
    const onResize = () => setW(read());
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);
  return w;
}

/**
 * Stacks the page's sections. Each section has a desktop (1440px) and a mobile
 * (390px) board; the matching one is shown and scaled to the viewport width,
 * so the layout stays pixel-identical to the design at any screen size.
 */
export default function ResponsivePage({ sections }) {
  const vw = useViewportWidth();
  const mobile = vw <= MOBILE_MAX;
  return (
    <div id="top">
      {sections.map(({ id, data }) => {
        const board = mobile ? data.mobile : data.desktop;
        const scale = vw / board.width;
        return (
          <section key={id} id={id} className="board-slot">
            <div className="board-zoom" style={{ width: board.width, zoom: scale }}>
              <Board board={board} />
            </div>
          </section>
        );
      })}
    </div>
  );
}
