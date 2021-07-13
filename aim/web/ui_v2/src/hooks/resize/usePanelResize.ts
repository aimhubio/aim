import React from 'react';

function usePanelResize(
  wrapperRef: React.MutableRefObject<HTMLElement | any>,
  topPanelRef: React.MutableRefObject<HTMLElement | any>,
  bottomPanelRef: React.MutableRefObject<HTMLElement | any>,
  resizeElemRef: React.MutableRefObject<HTMLElement | any>,
): void {
  const handleResize = React.useCallback(() => {
    document.addEventListener('mousemove', startResize);
    document.addEventListener('mouseup', endResize);
  }, []);

  const startResize = React.useCallback((event: MouseEvent): void => {
    requestAnimationFrame(() => {
      if (bottomPanelRef.current && topPanelRef.current && wrapperRef.current) {
        const containerHeight: number =
          bottomPanelRef.current.getBoundingClientRect()?.height +
          topPanelRef.current.getBoundingClientRect()?.height;

        const searchBarHeight: number =
          wrapperRef.current.getBoundingClientRect()?.height - containerHeight;

        const height: number = event.clientY - searchBarHeight;

        const flex: number = height / containerHeight;
        if (topPanelRef.current && bottomPanelRef.current) {
          topPanelRef.current.style.flex = `${flex} 1 0`;
          bottomPanelRef.current.style.flex = `${1 - flex} 1 0`;
        }
      }
    });
  }, []);

  const endResize = React.useCallback(() => {
    document.removeEventListener('mousemove', startResize);
  }, []);

  React.useEffect(() => {
    resizeElemRef.current.addEventListener('mousedown', handleResize);
    return () => {
      resizeElemRef.current?.removeEventListener('mousedown', handleResize);
      document.removeEventListener('mouseup', endResize);
    };
  }, []);
}

export default usePanelResize;
