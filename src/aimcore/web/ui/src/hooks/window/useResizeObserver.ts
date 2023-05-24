import * as React from 'react';

const useResizeObserver = (
  resizeObserverCallback: ResizeObserverCallback,
  target: React.RefObject<HTMLElement>,
  returnCallback?: () => void,
): void => {
  React.useEffect(() => {
    if (target?.current) {
      const observer = new window.ResizeObserver(resizeObserverCallback);

      if (observer) {
        observer.observe(target.current);
      }
      return () => {
        if (observer) {
          observer.disconnect();
          if (typeof returnCallback === 'function') {
            returnCallback();
          }
        }
      };
    }
  }, [resizeObserverCallback, returnCallback, target]);
};

export default useResizeObserver;
