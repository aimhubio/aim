import * as d3 from 'd3';

import { CurveEnum } from './';
import { IDrawLinesProps } from '../../types/utils/d3/drawLines';

const toTupleData = (x: number[], y: number[]): [number, number][] => {
  return x.map((v: number, i: number) => [v, y[i]]);
};

function drawLines(props: IDrawLinesProps): void {
  const { linesRef, data, xScale, yScale, index } = props;
  if (!linesRef?.current) {
    return;
  }

  const lineGenerator = d3
    .line()
    .x((d) => xScale(d[0]))
    .y((d) => yScale(d[1]))
    .curve(d3[CurveEnum.Linear]);

  for (const line of data) {
    linesRef.current
      .append('path')
      .data([toTupleData(line.data.xValues, line.data.yValues)])
      .attr('d', lineGenerator)
      .attr('class', 'Line')
      .attr('id', `Line-${line.key}`)
      .attr('clip-path', 'url(#lines-rect-clip-' + index + ')')
      .style('fill', 'none')
      .style('stroke', line.color)
      .style('stroke-dasharray', line.dasharray);
  }
}

export default drawLines;
