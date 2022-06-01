import React, { memo, FC, ReactElement } from 'react';

import { BoxProps } from './types';

const Box: FC<BoxProps> = ({
  boxData,
  visualizableContent: Component,
  gap,
}: BoxProps): ReactElement => {
  return (
    <div
      style={{
        position: 'absolute',
        boxSizing: 'border-box',
        padding: `${gap}px`,
        left: `${boxData.visuals.x}px`,
        top: `${boxData.visuals.y}px`,
        width: `${boxData.visuals.width}px`,
        height: `${boxData.visuals.height}px`,
        opacity: `${boxData.visuals.opacity}`,
      }}
    >
      <Component {...boxData.metadata} />
    </div>
  );
};

Box.displayName = 'Box';

export default memo(Box);
