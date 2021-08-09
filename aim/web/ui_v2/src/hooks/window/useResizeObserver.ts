import { useEffect, RefObject } from 'react';

const useResizeObserver = (
  resizeObserverCallback: ResizeObserverCallback,
  target: RefObject<HTMLElement>,
): void => {
  useEffect(() => {
    if (target?.current) {
      const observer = new window.ResizeObserver(resizeObserverCallback);

      if (observer) {
        observer.observe(target.current);
      }
      return () => {
        if (observer) {
          observer.disconnect();
        }
      };
    }
  }, [resizeObserverCallback, target]);
};

export default useResizeObserver;
