import * as d3 from 'd3';

import {
  IDrawHoverAttributesProps,
  IGetCoordinates,
  IGetCoordinatesProps,
  IHoverAxisLine,
} from '../../types/utils/d3/drawHoverAttributes';
import classes from './styles.module.css';
import { CircleEnum } from './index';
import { ILine } from '../../types/components/LineChart/LineChart';

function drawHoverAttributes(props: IDrawHoverAttributesProps): void {
  const {
    data,
    attributesRef,
    plotBoxRef,
    visAreaRef,
    visBoxRef,
    xScale,
    yScale,
  } = props;

  const { margin } = visBoxRef.current;
  const { height, width } = plotBoxRef.current;

  const svgArea = d3.select(visAreaRef.current).select('svg');

  svgArea?.on('mousemove', (event) => {
    const mouse: [number, number] = d3.pointer(event);
    const { mouseX, mouseY } = getCoordinates({
      mouse,
      xScale,
      yScale,
      margin,
    });

    // Closest xPoint for mouseX
    const xPoint = xScale.invert(mouseX);

    let nearestCircles: { x: number; y: number; key: string }[] = [];

    const closestCircle = {
      key: '',
      r: Infinity,
      x: 0,
      y: 0,
    };

    // Draw Circles
    attributesRef.current
      .selectAll('circle')
      .data(data)
      .join('circle')
      .attr('class', `${classes.HoverCircle}`)
      .attr('id', (line: ILine) => line.key)
      .attr('cx', function (line: ILine, i: number) {
        const index = d3.bisectCenter(line.data.xValues, xPoint);
        const closestXPoint = line.data.xValues[index];
        const closestXPixel = xScale(closestXPoint);

        nearestCircles = nearestCircles.concat([
          Object.assign(nearestCircles[i] || {}, {
            x: closestXPixel,
            key: line.key,
          }),
        ]);

        return closestXPixel;
      })
      .attr('cy', function (line: ILine, i: number) {
        const index = d3.bisectCenter(line.data.xValues, xPoint);
        const closestYPoint = line.data.yValues[index];
        const closestYPixel = yScale(closestYPoint);

        nearestCircles = nearestCircles.concat([
          Object.assign(nearestCircles[i] || {}, {
            y: closestYPixel,
            key: line.key,
          }),
        ]);

        return closestYPixel;
      })
      .attr('r', CircleEnum.Radius)
      .style('fill', (line: ILine) => line.color)
      .on('click', function (this: SVGElement) {
        // handlePointClick(
        //   closestStep,
        //   trace.runHash,
        //   trace.metricName,
        //   trace.traceContext,
        // );

        d3.select(this)
          .classed(classes.active, false)
          .classed(classes.focus, true);
      });

    // Find closest circle
    for (const circle of nearestCircles) {
      const rX = Math.abs(circle.x - mouseX);
      const rY = Math.abs(circle.y - mouseY);
      const r = Math.sqrt(Math.pow(rX, 2) + Math.pow(rY, 2));
      if (r < closestCircle.r) {
        Object.assign(closestCircle, {
          r,
          x: circle.x,
          y: circle.y,
          key: circle.key,
        });
      }
    }

    // Set closest circle class
    if (closestCircle.key) {
      attributesRef.current
        .select(`[id='${closestCircle.key}']`)
        .classed(classes.focus, false)
        .classed(classes.active, true)
        .attr('r', CircleEnum.ActiveRadius)
        .raise();
    }

    const hoverAxisData: IHoverAxisLine[] = [
      { x1: closestCircle.x, y1: 0, x2: closestCircle.x, y2: height },
      { x1: 0, y1: closestCircle.y, x2: width, y2: closestCircle.y },
    ];

    // Draw horizontal/vertical lines
    attributesRef.current
      .selectAll('line')
      .data(hoverAxisData)
      .join('line')
      .attr('class', `${classes.HoverLine}`)
      .style('stroke-width', 1)
      .style('stroke-dasharray', '4 2')
      .style('fill', 'none')
      .lower()
      .attr('x1', (axisLine: IHoverAxisLine) => axisLine.x1)
      .attr('y1', (axisLine: IHoverAxisLine) => axisLine.y1)
      .attr('x2', (axisLine: IHoverAxisLine) => axisLine.x2)
      .attr('y2', (axisLine: IHoverAxisLine) => axisLine.y2);
  });

  svgArea?.on('mouseleave', (event) => {
    console.log('leave', event);
  });
}

function getCoordinates({
  mouse,
  margin,
  xScale,
  yScale,
}: IGetCoordinatesProps): IGetCoordinates {
  const xPixel = Math.floor(mouse[0]) - margin.left;
  const yPixel = Math.floor(mouse[1]) - margin.top;
  const [xMin, xMax] = xScale.range();
  const [yMax, yMin] = yScale.range();

  return {
    mouseX: xPixel < xMin ? xMin : xPixel > xMax ? xMax : xPixel,
    mouseY: yPixel < yMin ? yMin : yPixel > yMax ? yMax : yPixel,
  };
}

export default drawHoverAttributes;
