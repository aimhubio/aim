import * as d3 from 'd3';

import { CurveEnum } from './';
import { IDrawLinesProps } from '../../types/utils/d3/drawLines';

function drawLines(props: IDrawLinesProps): void {
  const { linesRef, data, strokeColor = '#000', xScale, yScale } = props;
  if (!linesRef?.current) {
    return;
  }

  const lineGenerator = d3
    .line()
    .defined((d) => d !== null)
    .x((d) => xScale(d[0]))
    .y((d) => yScale(d[1]))
    .curve(d3[CurveEnum.Linear]);

  linesRef.current
    .append('path')
    .data([data.sort((a, b) => a[0] - b[0])])
    .attr('d', lineGenerator)
    .attr('class', 'PlotLine')
    .style('fill', 'none')
    .style('stroke', strokeColor);
}

export default drawLines;
