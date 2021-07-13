import { useEffect, RefObject, useRef } from 'react';

const useResizeObserver = (
  resizeObserverCallback: ResizeObserverCallback,
  target: RefObject<HTMLElement>,
): void => {
  const observer = useRef<ResizeObserver>();
  useEffect(() => {
    if (target?.current && !observer.current) {
      observer.current = new window.ResizeObserver(resizeObserverCallback);

      if (observer.current) {
        observer.current.observe(target.current);
      }
      return () => {
        if (observer.current) {
          observer.current.disconnect();
        }
      };
    }
  }, [resizeObserverCallback, target]);
};

export default useResizeObserver;
