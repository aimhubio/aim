import { useEffect } from 'react';

export const useWindowResize = (memoizedFnWithDeps: () => void): void => {
  useEffect(() => {
    const animationId = () => window.requestAnimationFrame(memoizedFnWithDeps);
    window.addEventListener('resize', animationId);
    return () => {
      window.removeEventListener('resize', animationId);
    };
  }, [memoizedFnWithDeps]);
};
