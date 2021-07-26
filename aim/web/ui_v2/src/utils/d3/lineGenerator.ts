import * as d3 from 'd3';

import { CurveEnum } from './';
import { IGetAxesScale } from 'types/utils/d3/getAxesScale';
export default function lineGenerator(
  xValues: IGetAxesScale['xScale'],
  yValues: IGetAxesScale['yScale'],
  curve: CurveEnum = CurveEnum.Linear,
  isYValuesAnObject: boolean = false,
) {
  return d3
    .line()
    .x((d) => xValues(d[0]))
    .y((d) => (isYValuesAnObject ? yValues[d[0]](d[1]) : yValues(d[1])))
    .curve(d3[curve]);
}
