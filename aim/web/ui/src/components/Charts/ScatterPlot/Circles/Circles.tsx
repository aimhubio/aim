import React, { memo } from 'react';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { DEFAULT_CIRCLE_COLOR, DEFAULT_CIRCLE_RADIUS } from '../config';
import { ICircleProps } from '../types';

/**
 * Circle Component
 * @param data - the array of array, present the x, y coordinates of circles
 * @param scale - svg scale
 * @param color - circle's color
 * @param radius - circle's radius
 * @return React.FunctionComponentElement<SVGAElement>
 */
const Circle = ({
  data,
  scale,
  color = DEFAULT_CIRCLE_COLOR,
  radius = DEFAULT_CIRCLE_RADIUS,
}: ICircleProps): React.FunctionComponentElement<SVGAElement> => {
  // can easily handle hover and click, show tooltip, etc..
  // some UI tricks can be possible to move here instead of rendering it inside a single component
  return (
    <ErrorBoundary>
      <g>
        {data.map((coords: number[], i: number) => (
          <circle
            className='Aim_ScatterPlotCircle'
            cx={scale.x_scale(coords[0])}
            cy={scale.y_scale(coords[1])}
            style={{ fill: color }}
            r={radius}
            key={i}
          />
        ))}
      </g>
    </ErrorBoundary>
  );
};

Circle.displayName = 'Circle';

export default memo<ICircleProps>(Circle);
