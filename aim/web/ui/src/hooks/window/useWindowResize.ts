import { useEffect } from 'react';

const useWindowResize = (memoizedFnWithDeps: () => void): void => {
  useEffect(() => {
    const animationId = () => window.requestAnimationFrame(memoizedFnWithDeps);
    window.addEventListener('resize', animationId);
    return () => {
      window.removeEventListener('resize', animationId);
    };
  }, [memoizedFnWithDeps]);
};

export default useWindowResize;
