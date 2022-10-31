import { IPoint } from 'components/ScatterPlot';

import { IDrawPointsArgs } from 'types/utils/d3/drawPoints';
import { IAxisScale } from 'types/utils/d3/getAxisScale';

import { CircleEnum } from './index';

function drawPoints(args: IDrawPointsArgs): void {
  const { index, nameKey, data, xScale, yScale, pointsRef, pointsNodeRef } =
    args;

  if (!pointsNodeRef?.current) {
    return;
  }

  pointsRef.current.updateScales = function (
    xScale: IAxisScale,
    yScale: IAxisScale,
  ): void {
    pointsNodeRef.current
      .selectAll('.Circle')
      .attr('cx', (p: IPoint) => xScale(p.data.xValues[0]).toFixed(2))
      .attr('cy', (p: IPoint) => yScale(p.data.yValues[0]).toFixed(2))
      .attr('r', CircleEnum.Radius);
  };

  pointsRef.current.updatePoints = function (pointData: IPoint[]): void {
    pointsNodeRef.current
      ?.selectAll('.Circle')
      .data(
        pointData.filter(
          (p: IPoint) => p.data.yValues[0] !== '-' && p.data.xValues[0] !== '-',
        ),
      )
      .join('circle')
      .attr('class', 'Circle')
      .attr('id', (p: IPoint) => `Circle-${p.key}`)
      .attr('clip-path', `url(#${nameKey}-lines-rect-clip-${index})`)
      .attr('groupKey', (p: IPoint) => p.groupKey)
      .attr('cx', (p: IPoint) => xScale(p.data.xValues[0]).toFixed(2))
      .attr('cy', (p: IPoint) => yScale(p.data.yValues[0]).toFixed(2))
      .attr('r', CircleEnum.Radius)
      .attr('fill', (p: IPoint) => p.color)
      .attr('stroke', (d: IPoint) => d.color)
      .attr('color', (d: IPoint) => d.color);
  };

  pointsRef.current.updatePoints(data);
}

export default drawPoints;
