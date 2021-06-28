import * as d3 from 'd3';

import { CurveEnum } from './';
import { IDrawLines } from '../../types/utils/d3/drawLines';

function drawLines(props: IDrawLines): void {
  const { linesRef, data, strokeColor = '#000' } = props;
  if (!linesRef?.current) {
    return;
  }

  const line = d3
    .line()
    .x((d) => d[0])
    .y((d) => d[1])
    .curve(d3[CurveEnum.Linear]);

  linesRef.current
    .append('path')
    .datum(data)
    .attr('d', line)
    .attr('class', 'PlotLine')
    .style('fill', 'none')
    .style('stroke', strokeColor);
}

export default drawLines;
