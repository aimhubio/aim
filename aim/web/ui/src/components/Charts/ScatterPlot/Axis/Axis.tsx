import React, { useEffect, memo } from 'react';
import { select } from 'd3';

import { IAxisProps } from '../types';

/**
 * Component Axis
 * Usage
 *    <Axis
 *      transform={`translate(0, ${height})`}
 *      scale={d3.axisBottom(/yous scale/)}
 *      label={'Y Axis'}
 *     />
 * @param label - it can be the name of the axis (Y axis)
 * @param transform - svg transform (it can be translate())
 * @param scale - svg element scale
 * @return React.FunctionComponentElement<SVGGElement>
 */
const Axis = ({
  label,
  transform,
  scale,
}: IAxisProps): React.FunctionComponentElement<SVGGElement> => {
  const ref: React.MutableRefObject<any> = React.createRef();

  useEffect(() => {
    select(ref.current).call(scale);
  }, [scale]);

  // Can work width axis's UI easily here
  // i.e. paint label as title etc.
  return (
    <g
      ref={ref}
      textAnchor='end'
      transform={transform}
      className='Aim_ScatterPlotAxis'
    />
  );
};

Axis.displayName = 'Axis';

export default memo<IAxisProps>(Axis);
