import { useEffect } from 'react';

const useAnimationFrame = (memoizedFnWithDeps: () => void): void => {
  useEffect(() => {
    const animationId = window.requestAnimationFrame(memoizedFnWithDeps);
    return () => {
      window.cancelAnimationFrame(animationId);
    };
  }, [memoizedFnWithDeps]);
};

export default useAnimationFrame;
