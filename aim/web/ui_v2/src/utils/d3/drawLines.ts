import * as d3 from 'd3';

import { CurveEnum } from './';
import { IDrawLinesProps } from 'types/utils/d3/drawLines';
import { IGetAxesScale } from 'types/utils/d3/getAxesScale';

const toTupleData = (x: number[], y: number[]): [number, number][] => {
  return x.map((v: number, i: number) => [v, y[i]]);
};

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

  linesRef.current.lineGenerator = function (
    xValues: IGetAxesScale['xScale'] = xScale,
    yValues: IGetAxesScale['yScale'] = yScale,
    curve: CurveEnum = curveInterpolation,
  ) {
    return d3
      .line()
      .x((d) => xValues(d[0]))
      .y((d) => yValues(d[1]))
      .curve(d3[curve]);
  };

  for (const line of data) {
    linesNodeRef.current
      .append('path')
      .data([toTupleData(line.data.xValues, line.data.yValues)])
      .attr('id', `Line-${line.key}`)
      .attr('clip-path', `url(#lines-rect-clip-${index})`)
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

  linesRef.current.updateLines = function (
    xScale: IGetAxesScale['xScale'],
    yScale: IGetAxesScale['yScale'],
    curve?: CurveEnum,
  ) {
    linesNodeRef.current
      .selectAll('.Line')
      .transition()
      .duration(500)
      .attr('d', linesRef.current.lineGenerator(xScale, yScale, curve));
  };
}

export default drawLines;
