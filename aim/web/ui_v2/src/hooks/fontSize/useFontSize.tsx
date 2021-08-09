import { useEffect, useState } from 'react';

function useFontSize(): string {
  const [width, setWidth] = useState<number>(1920);

  useEffect(() => {
    setWidth(window.innerWidth);
    window.addEventListener('resize', resizeHandler);
    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, []);

  function resizeHandler() {
    setWidth(window.innerWidth);
  }

  return ((width / 1920) * 16).toFixed(2);
}

export default useFontSize;
