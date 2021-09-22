/* eslint-disable react/prop-types */
import React, { useEffect, useRef, useState } from 'react';
import { DEFAULT_CONTAINER_HEIGHT, DEFAULT_CONTAINER_WIDTH } from './config';

const INEXPLICABLE_SIZE = 6;

/**
 * Higher Order Component
 * Listen to Parent's Container changes and pass down new sizes
 */
function widthResize(Component) {
  return (props) => {
    const ref = useRef();
    const [sizes, setSizes] = useState({
      width: props.width || DEFAULT_CONTAINER_WIDTH,
      height: props.height || DEFAULT_CONTAINER_HEIGHT,
    });

    const measure = (entries) => {
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
