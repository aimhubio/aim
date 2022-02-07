import React, { useEffect, useRef, useState } from 'react';

import { DEFAULT_CONTAINER_HEIGHT, DEFAULT_CONTAINER_WIDTH } from './config';

const INEXPLICABLE_SIZE = 6;

/**
 * Higher Order Component
 * Listen to Parent's Container changes and pass down new sizes
 */
function widthResize(
  Component: React.FunctionComponentElement<React.ReactNode> | any,
) {
  return function WidthResizeHOC(props: any) {
    const ref = useRef<any>();
    const [sizes, setSizes] = useState({
      width: props.width || DEFAULT_CONTAINER_WIDTH,
      height: props.height || DEFAULT_CONTAINER_HEIGHT,
    });

    const measure = (entries: any) => {
      const { width, height } = entries[0].contentRect;
      setSizes({
        height: Math.round(height) - INEXPLICABLE_SIZE,
        width: Math.round(width),
      });
    };
    useEffect(() => {
      const resizeObserver = new window.ResizeObserver(measure);
      resizeObserver.observe(ref.current);

      return () => {
        resizeObserver.disconnect();
      };
    }, []);

    const componentProps = {
      ...sizes,
      ...props,
      ref,
    };

    return <Component {...componentProps} />;
  };
}

export default widthResize;
