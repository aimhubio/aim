import * as d3 from 'd3';

import { CurveEnum } from './';
import { IDrawLinesProps } from '../../types/utils/d3/drawLines';
import { ILine } from '../../types/components/LineChart/LineChart';

function drawLines(props: IDrawLinesProps): void {
  const { linesRef, data, xScale, yScale } = props;
  if (!linesRef?.current) {
    return;
  }

  for (const line of data) {
    const lineGenerator = d3
      .line()
      .x((d) => xScale(d))
      .y((d, i) => yScale(line.data.yValues[i]))
      .curve(d3[CurveEnum.Linear]);

    const { color = '#000', dasharray = '0', opacity = '1' } = line;

    linesRef.current
      .append('path')
      .data([line])
      .attr('d', (d: ILine) => lineGenerator(d.data.xValues as any)) // TODO: fix typing issue for line generator argument
      .attr('class', 'PlotLine')
      .style('fill', 'none')
      .style('stroke', color)
      .style('stroke-opacity', opacity)
      .style('stroke-dasharray', dasharray);
  }
}

export default drawLines;
