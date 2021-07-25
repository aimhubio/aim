import * as d3 from 'd3';

import { CurveEnum } from './';
import { IDrawLinesProps } from 'types/utils/d3/drawLines';
import { IGetAxesScale } from 'types/utils/d3/getAxesScale';
import { toTupleData } from 'utils/toTupleData';
import lineGenerator from './lineGenerator';

function drawLines(props: IDrawLinesProps): void {
  const {
    data,
    index,
    xScale,
    yScale,
    linesRef,
    linesNodeRef,
    curveInterpolation,
    highlightMode,
  } = props;

  if (!linesNodeRef?.current) {
    return;
  }
  for (const line of data) {
    linesNodeRef.current
      .append('path')
      .data([toTupleData(line.data.xValues, line.data.yValues)])
      .attr('id', `Line-${line.key}`)
      .attr('clip-path', `url(#lines-rect-clip-${index})`)
      .attr('d', lineGenerator(xScale, yScale, curveInterpolation))
      .attr('class', 'Line')
      .attr(
        'data-selector',
        `Line-Sel-${highlightMode}-${line.selectors[highlightMode]}`,
      )
      .style('fill', 'none')
      .style('stroke', line.color)
      .style('stroke-dasharray', line.dasharray);
  }

  linesRef.current.updateLines = function (
    xScale: IGetAxesScale['xScale'],
    yScale: IGetAxesScale['yScale'],
    curve?: CurveEnum,
  ) {
    linesNodeRef.current
      .selectAll('.Line')
      .transition()
      .duration(500)
      .attr('d', lineGenerator(xScale, yScale, curve));
  };
}

export default drawLines;
