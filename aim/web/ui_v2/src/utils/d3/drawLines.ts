import * as d3 from 'd3';

import { CurveEnum } from './';
import { IDrawLinesProps } from 'types/utils/d3/drawLines';
import { IDrawAxesProps } from '../../types/utils/d3/drawAxes';

function drawLines(props: IDrawLinesProps): void {
  const { linesRef, data, xScale, yScale, index } = props;
  if (!linesRef?.current) {
    return;
  }

  linesRef.current.lineGenerator = function (
    x: IDrawAxesProps | any = xScale,
    y: IDrawAxesProps | any = yScale,
  ) {
    return d3
      .line()
      .x((d) => x(d[0]))
      .y((d) => y(d[1]))
      .curve(d3[CurveEnum.Linear]);
  };

  for (const line of data) {
    const { color = '#000', dasharray = '0' } = line;

    linesRef.current
      .append('path')
      .data([line.data])
      .attr('clip-path', `url(#lines-rect-clip-${index})`)
      .attr('d', linesRef.current.lineGenerator())
      .attr('class', 'PlotLine')
      .style('fill', 'none')
      .style('stroke', color)
      .style('stroke-dasharray', dasharray);
  }
}

export default drawLines;
