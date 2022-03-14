import * as d3 from 'd3';

import { gradientStartColor, gradientEndColor } from 'utils/d3';

function getColorFromRange(
  range: [number, number],
  startColor: string = gradientStartColor,
  endColor: string = gradientEndColor,
) {
  return d3
    .scaleSequential()
    .domain(range)
    .interpolator(d3.interpolateRgb(startColor, endColor));
}

export default getColorFromRange;
