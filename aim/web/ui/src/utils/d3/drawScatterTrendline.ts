import * as d3 from 'd3';

import { IPoint } from 'components/ScatterPlot';

import {
  linearRegression,
  linearRegressionLine,
} from 'utils/regression/linearRegression';
import loess from 'utils/regression/loess';

import { TrendlineTypeEnum } from '.';

/**
 * Given the params with the type for trendline
 * respectively, draws a line on the ScatterPlot
 */
function drawScatterTrendline({
  index,
  data,
  type,
  xScale,
  yScale,
  bandwidth,
  targetRef,
}: any): void {
  if (!targetRef?.current) {
    return;
  }

  const points = data
    .map((d: IPoint) => [xScale(d.data.xValues[0]), yScale(d.data.yValues[0])])
    .filter((d: [number, number]) => d[0] !== undefined && d[1] !== undefined)
    .sort((a: [number, number], b: [number, number]) => a[0] - b[0]);

  let regressionPoints;

  if (type === TrendlineTypeEnum.SLR) {
    const slr = linearRegression(points);
    const slrLine = linearRegressionLine(slr);

    const firstX = points[0][0];
    const lastX = points[points.length - 1][0];
    const xCoordinates = [firstX, lastX];

    regressionPoints = xCoordinates.map((d) => [d, slrLine(d as number)]);
  } else {
    regressionPoints = loess(points, bandwidth ?? 0.66);
  }

  const line = d3
    .line()
    .x((d) => d[0])
    .y((d) => d[1]);

  targetRef.current
    .append('path')
    .datum(regressionPoints)
    .classed('RegressionLine', true)
    .attr('clip-path', 'url(#lines-rect-clip-' + index + ')')
    .attr('d', line);
}

export default drawScatterTrendline;
