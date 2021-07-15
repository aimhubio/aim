import * as d3 from 'd3';

import { CurveEnum } from './';
import { IDrawLinesProps } from 'types/utils/d3/drawLines';
import { IGetAxisScale } from '../../types/utils/d3/getAxesScale';

const toTupleData = (x: number[], y: number[]): [number, number][] => {
  return x.map((v: number, i: number) => [v, y[i]]);
};

function drawLines(props: IDrawLinesProps): void {
  const { linesRef, linesNodeRef, data, xScale, yScale, index, highlightMode } =
    props;
  if (!linesNodeRef?.current) {
    return;
  }

  linesRef.current.lineGenerator = function (
    xScaleFn: IGetAxisScale['xScale'] = xScale,
    yScaleFn: IGetAxisScale['yScale'] = yScale,
  ) {
    return d3
      .line()
      .x((d) => xScaleFn(d[0]))
      .y((d) => yScaleFn(d[1]))
      .curve(d3[CurveEnum.Linear]);
  };

  for (const line of data) {
    linesNodeRef.current
      .append('path')
      .data([toTupleData(line.data.xValues, line.data.yValues)])
      .attr('id', `Line-${line.key}`)
      .attr('clip-path', 'url(#lines-rect-clip-' + index + ')')
      .attr('d', linesRef.current.lineGenerator())
      .attr('class', 'Line')
      .attr(
        'data-selector',
        `Line-Sel-${highlightMode}-${line.selectors[highlightMode]}`,
      )
      .style('fill', 'none')
      .style('stroke', line.color)
      .style('stroke-dasharray', line.dasharray);
  }
}

export default drawLines;
