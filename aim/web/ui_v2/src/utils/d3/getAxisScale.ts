import * as d3 from 'd3';

import { ScaleEnum } from './index';
import { ScaleType } from '../../types/components/LineChart/LineChart';
import {
  IGetAxisScale,
  IGetAxisScaleProps,
} from '../../types/utils/d3/getAxesScale';

function getScaleBaseFor(scaleType: ScaleType) {
  switch (scaleType) {
    case ScaleEnum.Log:
      return d3.scaleLog();
    case ScaleEnum.Linear:
      return d3.scaleLinear();
    default:
      return d3.scaleLinear();
  }
}

function getAxisScale(props: IGetAxisScaleProps): IGetAxisScale {
  const { visBoxRef, axisScaleType, min, max } = props;
  const { width, height, margin } = visBoxRef.current;

  const xScaleType = axisScaleType?.x || 'linear';
  const yScaleType = axisScaleType?.y || 'linear';

  const xScaleBase = getScaleBaseFor(xScaleType);
  const yScaleBase = getScaleBaseFor(yScaleType);

  // X-Scale
  const xScale = xScaleBase
    .domain([min.x, max.x])
    .range([0, width - margin.left - margin.right]);

  // Y-Scale
  const yScale = yScaleBase
    .domain([min.y, max.y])
    .range([height - margin.top - margin.bottom, 0]);

  return { xScale, yScale };
}

export default getAxisScale;
