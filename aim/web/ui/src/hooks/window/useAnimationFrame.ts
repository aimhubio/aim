import { useEffect } from 'react';

export const useAnimationFrame = (memoizedFnWithDeps: () => void): void => {
  useEffect(() => {
    const animationId = window.requestAnimationFrame(memoizedFnWithDeps);
    return () => {
      window.cancelAnimationFrame(animationId);
    };
  }, [memoizedFnWithDeps]);
};
