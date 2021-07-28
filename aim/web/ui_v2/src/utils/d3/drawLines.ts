import * as d3 from 'd3';

import { CurveEnum } from './';
import { IDrawLinesProps } from 'types/utils/d3/drawLines';
import { IGetAxesScale } from 'types/utils/d3/getAxesScale';
import { toTupleData } from 'utils/toTupleData';
import lineGenerator from './lineGenerator';
import { IProcessedData } from 'types/utils/d3/processData';

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
    xScaleValues: IGetAxesScale['xScale'] = xScale,
    yScaleValues: IGetAxesScale['yScale'] = yScale,
    curve: CurveEnum = curveInterpolation,
  ) {
    return d3
      .line()
      .x((d) => xScaleValues(d[0]))
      .y((d) => yScaleValues(d[1]))
      .curve(d3[curve]);
  };

  linesRef.current.updateLinesScales = function (
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

  linesRef.current.updateLines = function (updateData: IProcessedData[]) {
    let selection = linesNodeRef.current.selectAll('.Line').data(updateData);
    selection
      .enter()
      .append('path')
      .attr('class', 'Line')
      .merge(selection)
      .attr('id', (line: any) => `Line-${line.key}`)
      .attr('clip-path', `url(#lines-rect-clip-${index})`)
      .attr(
        'data-selector',
        (line: any) =>
          `Line-Sel-${highlightMode}-${line.selectors[highlightMode]}`,
      )
      .style('fill', 'none')
      .style('stroke', (line: any) => line.color)
      .style('stroke-dasharray', (line: any) => line.dasharray)
      .data(
        updateData.map((line) =>
          toTupleData(line.data.xValues, line.data.yValues),
        ),
      )
      .attr('d', linesRef.current.lineGenerator(xScale, yScale));
  };
  linesRef.current.updateLines(data);
}

export default drawLines;
