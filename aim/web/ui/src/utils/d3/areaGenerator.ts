import * as d3 from 'd3';

import { IAxisScale } from 'types/utils/d3/getAxisScale';

import { CurveEnum } from './';

export default function areaGenerator(xScale: IAxisScale, yScale: IAxisScale) {
  return d3
    .area()
    .x0((d: any) => xScale(d[0]))
    .x1((d: any) => xScale(d[1]))
    .y0((d: any) => yScale(d[2]))
    .y1((d: any) => yScale(d[3]))
    .curve(d3[CurveEnum.Linear]);
}
