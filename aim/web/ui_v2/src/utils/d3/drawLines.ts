import * as d3 from 'd3';

import { CurveEnum } from './';
import { IDrawLinesProps } from 'types/utils/d3/drawLines';

function drawLines(props: IDrawLinesProps): void {
  const { linesRef, data, xScale, yScale } = props;
  if (!linesRef?.current) {
    return;
  }

  const lineGenerator = d3
    .line()
    .x((d) => xScale(d[0]))
    .y((d) => yScale(d[1]))
    .curve(d3[CurveEnum.Linear]);

  for (const line of data) {
    const { color = '#000', dasharray = '0' } = line;

    linesRef.current
      .append('path')
      .data([line.data])
      .attr('d', lineGenerator)
      .attr('class', 'PlotLine')
      .style('fill', 'none')
      .style('stroke', color)
      .style('stroke-dasharray', dasharray);
  }
}

export default drawLines;
