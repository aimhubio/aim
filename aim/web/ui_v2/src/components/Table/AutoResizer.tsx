// @ts-nocheck
/* eslint-disable react/prop-types */

import React from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';

/**
 * Decorator component that automatically adjusts the width and height of a single child
 */
const AutoResizer = ({ className, width, height, children, onResize }) => {
  const disableWidth = typeof width === 'number';
  const disableHeight = typeof height === 'number';

  if (disableWidth && disableHeight) {
    return (
      <div
        className={className}
        style={{ width, height, position: 'relative' }}
      >
        {children({ width, height })}
      </div>
    );
  }

  return (
    <AutoSizer
      className={className}
      disableWidth={disableWidth}
      disableHeight={disableHeight}
      onResize={onResize}
    >
      {(size) =>
        children({
          width: disableWidth ? width : size.width,
          height: disableHeight ? height : size.height,
        })
      }
    </AutoSizer>
  );
};

export default AutoResizer;
