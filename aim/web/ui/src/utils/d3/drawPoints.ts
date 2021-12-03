import { IDrawPointsArgs } from 'types/utils/d3/drawPoints';
import { IGetAxisScale } from 'types/utils/d3/getAxisScale';
import { IProcessedData } from 'types/utils/d3/processData';
import { ILine } from 'types/components/LineChart/LineChart';

import { CircleEnum } from './index';

function drawPoints(args: IDrawPointsArgs): void {
  const { index, xScale, yScale, pointsRef, pointsNodeRef, highlightMode } =
    args;

  if (!pointsNodeRef?.current) {
    return;
  }

  pointsRef.current.updateScales = function (
    xScale: IGetAxisScale,
    yScale: IGetAxisScale,
  ): void {
    pointsNodeRef.current
      .selectAll('.Circle')
      .attr('cx', (p: ILine) => xScale(p.data.xValues[0]))
      .attr('cy', (p: ILine) => yScale(p.data.yValues[0]))
      .attr('r', CircleEnum.Radius);
  };

  pointsRef.current.updatePoints = function (data: IProcessedData[]): void {
    pointsNodeRef.current
      ?.selectAll('.Circle')
      .data(data)
      .join('circle')
      .attr('class', 'Circle')
      .attr('id', (p: ILine) => `Circle-${p.key}`)
      .attr('clip-path', `url(#lines-rect-clip-${index})`)
      .attr('groupKey', (p: ILine) => p.groupKey)
      .attr(
        'data-selector',
        (p: ILine) =>
          `Circle-Sel-${highlightMode}-${p.selectors?.[highlightMode]}`,
      )
      .attr('cx', (p: ILine) => xScale(p.data.xValues[0]))
      .attr('cy', (p: ILine) => yScale(p.data.yValues[0]))
      .attr('r', CircleEnum.Radius)
      .style('fill', (p: ILine) => p.color);
  };

  pointsRef.current.updatePoints(args.data);
}

export default drawPoints;
