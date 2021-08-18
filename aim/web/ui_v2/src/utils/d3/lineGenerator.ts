import * as d3 from 'd3';

import { CurveEnum } from './';
import { IGetAxisScale } from 'types/utils/d3/getAxisScale';

export default function lineGenerator(
  xScaleValues: IGetAxisScale,
  yScaleValues: IGetAxisScale,
  curve: CurveEnum = CurveEnum.Linear,
  isYValuesAnObject: boolean = false,
) {
  return d3
    .line()
    .x((d) => xScaleValues(d[0]))
    .y((d) =>
      isYValuesAnObject ? yScaleValues[d[0]](d[1]) : yScaleValues(d[1]),
    )
    .curve(d3[curve]);
}
